import mongoose from 'mongoose';
import StockRequest from './stockRequest.model.js';
import VendorPurchase from './vendorPurchase.model.js';
import Product from '../products/product.model.js';
import { paginate } from '../../utils/paginate.js';
import asyncWrapper from '../../utils/asyncWrapper.js';
import AppError from '../../utils/AppError.js';
import { successResponse } from '../../utils/apiResponse.js';

// 1. Get all stock requests (Admin/Manager only)
export const getAdminStockRequests = asyncWrapper(async (req, res) => {
  const { status, requesterId, category } = req.query;

  const queryObj = {};

  if (status) queryObj.status = status;
  if (requesterId) queryObj.requesterId = requesterId;
  if (category) queryObj.category = category;

  const result = await paginate(StockRequest, queryObj, req.query, {
    sort: { createdAt: -1 },
    populate: [
      { path: 'requesterId', select: 'name email mobile role' },
      { path: 'reviewedBy', select: 'name email role' }
    ]
  });

  return successResponse(
    res,
    {
      stockRequests: result.docs,
      pagination: result.pagination,
    },
    200,
    'Stock requests retrieved successfully.'
  );
});

// 2. Approve or reject a stock request (Admin only)
export const updateStockRequestStatus = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return next(new AppError('Status must be either "approved" or "rejected".', 400));
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (_sessionErr) {
    session = null;
  }

  try {
    const stockRequest = session
      ? await StockRequest.findById(id).session(session)
      : await StockRequest.findById(id);
    if (!stockRequest) {
      throw new AppError('Stock request not found.', 404);
    }

    if (stockRequest.status !== 'pending') {
      throw new AppError(`Stock request is already processed and is "${stockRequest.status}".`, 400);
    }

    if (status === 'rejected') {
      if (!rejectionReason) {
        throw new AppError('Rejection reason is required when status is "rejected".', 400);
      }
      stockRequest.status = 'rejected';
      stockRequest.rejectionReason = rejectionReason;
      stockRequest.reviewedBy = req.user._id;
      stockRequest.reviewedAt = new Date();
      
      if (session) {
        await stockRequest.save({ session });
        await session.commitTransaction();
      } else {
        await stockRequest.save();
      }

      return successResponse(res, stockRequest, 200, 'Stock request rejected successfully.');
    }

    // If approved:
    let updateQuery = {};
    if (stockRequest.type === 'add') {
      updateQuery = { $inc: { stock: stockRequest.requestedChange } };
    } else if (stockRequest.type === 'update' || stockRequest.type === 'new_product') {
      updateQuery = { $set: { stock: stockRequest.requestedChange } };
    } else {
      throw new AppError('Invalid stock request type.', 400);
    }

    // Set dynamic specifications in the product
    if (stockRequest.specifications && stockRequest.specifications.size > 0) {
      updateQuery.$set = updateQuery.$set || {};
      for (const [key, val] of stockRequest.specifications.entries()) {
        updateQuery.$set[`specifications.${key}`] = val;
      }
    }

    const updateOptions = { new: true };
    if (session) updateOptions.session = session;

    const product = await Product.findByIdAndUpdate(
      stockRequest.productId,
      updateQuery,
      updateOptions
    );

    if (!product) {
      throw new AppError('Product associated with this stock request not found.', 404);
    }

    if (product.stock < 0) {
      throw new AppError('Stock request would result in negative product stock.', 400);
    }

    stockRequest.status = 'approved';
    stockRequest.reviewedBy = req.user._id;
    stockRequest.reviewedAt = new Date();
    
    if (session) {
      await stockRequest.save({ session });
      await session.commitTransaction();
    } else {
      await stockRequest.save();
    }

    return successResponse(
      res,
      { stockRequest, newStock: product.stock },
      200,
      'Stock request approved and product stock updated successfully.'
    );
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    return next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
});

// 3. Create a stock request (Executive/Manager only)
export const createStockRequest = asyncWrapper(async (req, res, next) => {
  const { productId, type, requestedChange, notes, specifications } = req.body;

  if (!productId || !type || requestedChange === undefined) {
    return next(new AppError('Product ID, request type, and requested change quantity are required.', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  const stockRequest = await StockRequest.create({
    productId,
    productName: product.name,
    category: product.category ? product.category.toString() : 'General',
    requesterId: req.user._id,
    requesterRole: req.user.role,
    type,
    currentStock: product.stock || 0,
    requestedChange: Number(requestedChange),
    notes: notes || '',
    status: 'pending',
    specifications: specifications || {},
  });

  return successResponse(res, stockRequest, 201, 'Stock request raised successfully.');
});

// 4. Get all vendor purchases (Executive/Manager only)
export const getVendorPurchases = asyncWrapper(async (req, res) => {
  const queryObj = {};

  // Restrict list to owner if they are not admin
  if (req.user.role !== 'admin') {
    queryObj.purchasedBy = req.user._id;
  }

  const result = await paginate(VendorPurchase, queryObj, req.query, {
    sort: { purchaseDate: -1 }
  });

  return successResponse(
    res,
    {
      purchases: result.docs,
      pagination: result.pagination,
    },
    200,
    'Vendor purchases retrieved successfully.'
  );
});

// 5. Create a new vendor purchase (Executive/Manager only)
export const createVendorPurchase = asyncWrapper(async (req, res, next) => {
  const { vendorName, productId, quantity, unit, buyPrice, purchaseDate, notes, status, specifications } = req.body;

  if (!vendorName || !productId || !quantity || !buyPrice || !purchaseDate) {
    return next(new AppError('Vendor name, Product ID, quantity, buy price, and purchase date are required.', 400));
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (_sessionErr) {
    session = null;
  }

  try {
    const product = session
      ? await Product.findById(productId).session(session)
      : await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    const qty = Number(quantity);
    const price = Number(buyPrice);
    const total = qty * price;
    const purchaseStatus = status || 'pending';

    const purchaseData = {
      purchasedBy: req.user._id,
      vendorName,
      productId,
      productName: product.name,
      quantity: qty,
      unit: unit || product.unit || 'kg',
      buyPrice: price,
      total,
      purchaseDate: new Date(purchaseDate),
      status: purchaseStatus,
      notes: notes || '',
    };

    let purchaseDoc;
    if (session) {
      const purchases = await VendorPurchase.create([purchaseData], { session });
      purchaseDoc = purchases[0];
    } else {
      purchaseDoc = await VendorPurchase.create(purchaseData);
    }

    // If already received, immediately add to stock and update specifications atomically
    if (purchaseStatus === 'received') {
      const updateOptions = session ? { session } : {};
      const updateQuery = { $inc: { stock: qty } };
      if (specifications && Object.keys(specifications).length > 0) {
        updateQuery.$set = {};
        for (const [key, val] of Object.entries(specifications)) {
          updateQuery.$set[`specifications.${key}`] = val;
        }
      }
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateQuery,
        { new: true, ...updateOptions }
      );
      if (!updatedProduct) {
        throw new AppError('Failed to update product stock.', 500);
      }
    }

    if (session) {
      await session.commitTransaction();
    }

    return successResponse(res, purchaseDoc, 201, 'Vendor purchase logged successfully.');
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    return next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
});
