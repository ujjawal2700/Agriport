import Product from './product.model.js';
import { paginate } from '../../utils/paginate.js';
import asyncWrapper from '../../utils/asyncWrapper.js';
import AppError from '../../utils/AppError.js';
import { successResponse } from '../../utils/apiResponse.js';

// 1. Get all products with filtering, search, sorting and pagination (Public)
export const getProducts = asyncWrapper(async (req, res) => {
  const { search, category, inStockOnly, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

  const queryObj = { isArchived: false };

  // Text search on indexed fields
  if (search) {
    queryObj.$text = { $search: search };
  }

  // Category filter
  if (category) {
    queryObj.category = category;
  }

  // Stock filter (only show in-stock products)
  if (inStockOnly === 'true') {
    queryObj.stock = { $gt: 0 };
  }

  // Price range filtering (on the base/first price slab unitPrice)
  if (minPrice || maxPrice) {
    queryObj['priceSlabs.0.unitPrice'] = {};
    if (minPrice) {
      queryObj['priceSlabs.0.unitPrice'].$gte = Number(minPrice);
    }
    if (maxPrice) {
      queryObj['priceSlabs.0.unitPrice'].$lte = Number(maxPrice);
    }
  }

  // Sorting logic
  let sortObj = {};
  if (sort === 'price_asc') {
    sortObj['priceSlabs.0.unitPrice'] = 1;
  } else if (sort === 'price_desc') {
    sortObj['priceSlabs.0.unitPrice'] = -1;
  } else if (sort === 'relevance' && search) {
    sortObj.score = { $meta: 'textScore' };
  } else {
    sortObj.createdAt = -1; // Default: newest first
  }

  // If text search relevance is selected, project score
  const select = (sort === 'relevance' && search) ? { score: { $meta: 'textScore' } } : null;

  const result = await paginate(Product, queryObj, req.query, {
    sort: sortObj,
    populate: { path: 'category', select: 'name slug' },
    select
  });

  return successResponse(
    res,
    {
      products: result.docs,
      pagination: result.pagination,
    },
    200,
    'Products retrieved successfully.'
  );
});

// 2. Get a single product by ID (Public)
export const getProductById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id, isArchived: false }).populate('category', 'name slug');

  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  return successResponse(res, product, 200, 'Product retrieved successfully.');
});

// 3. Create product (Admin only)
export const createProduct = asyncWrapper(async (req, res, next) => {
  const { name, description, sku, category, unit, moq, priceSlabs, specs, variants, stock } = req.body;

  // Check unique SKU
  const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
  if (existingProduct) {
    return next(new AppError(`Product with SKU "${sku}" already exists.`, 409));
  }

  // Retrieve images uploaded by handleUploads middleware
  const images = req.uploadedFiles?.images || [];

  const product = await Product.create({
    name,
    description,
    sku,
    category,
    unit,
    moq,
    priceSlabs,
    specs,
    variants,
    stock,
    images,
  });

  const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');
  return successResponse(res, populatedProduct, 201, 'Product created successfully.');
});

// 4. Update product (Admin only)
export const updateProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, sku, category, unit, moq, priceSlabs, specs, variants, stock } = req.body;

  const product = await Product.findOne({ _id: id, isArchived: false });
  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  // Validate SKU if changing
  if (sku && sku.toUpperCase() !== product.sku) {
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return next(new AppError(`Product with SKU "${sku}" already exists.`, 409));
    }
    product.sku = sku.toUpperCase();
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (category) product.category = category;
  if (unit) product.unit = unit;
  if (moq !== undefined) product.moq = moq;
  if (priceSlabs) product.priceSlabs = priceSlabs;
  if (specs) product.specs = specs;
  if (variants) product.variants = variants;
  if (stock !== undefined) product.stock = stock;

  // Process images
  let images = req.body.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      images = [images];
    }
  }
  
  if (!Array.isArray(images)) {
    images = product.images; // fallback to existing images
  }

  // If new uploads exist, append them to the existing ones
  if (req.uploadedFiles?.images) {
    images = [...images, ...req.uploadedFiles.images];
  }
  product.images = images;

  await product.save();

  const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');
  return successResponse(res, populatedProduct, 200, 'Product updated successfully.');
});

// 5. Delete product (Admin only - soft-delete)
export const deleteProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({ _id: id, isArchived: false });
  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  product.isArchived = true;
  await product.save();

  return successResponse(res, null, 200, 'Product soft-deleted successfully.');
});
