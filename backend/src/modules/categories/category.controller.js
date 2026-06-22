import Category from './category.model.js';
import mongoose from 'mongoose';
import asyncWrapper from '../../utils/asyncWrapper.js';
import AppError from '../../utils/AppError.js';
import { successResponse } from '../../utils/apiResponse.js';

// 1. Get all categories sorted by order (Public)
export const getCategories = asyncWrapper(async (req, res) => {
  const categories = await Category.find().sort('order');
  return successResponse(res, categories, 200, 'Categories retrieved successfully.');
});

// 2. Create category (Admin only)
export const createCategory = asyncWrapper(async (req, res, next) => {
  const { name, image, order } = req.body;

  // Check duplicate
  const exists = await Category.findOne({ name });
  if (exists) {
    return next(new AppError('Category with this name already exists.', 409));
  }

  const category = await Category.create({ name, image, order });
  return successResponse(res, category, 201, 'Category created successfully.');
});

// 3. Update category (Admin only)
export const updateCategory = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { name, image, order } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    return next(new AppError('Category not found.', 404));
  }

  if (name) {
    category.name = name;
  }
  if (image !== undefined) {
    category.image = image;
  }
  if (order !== undefined) {
    category.order = order;
  }

  await category.save();
  return successResponse(res, category, 200, 'Category updated successfully.');
});

// 4. Delete category (Admin only)
export const deleteCategory = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return next(new AppError('Category not found.', 404));
  }

  // Check if there are active products under this category
  // Using dynamic model query to avoid circular dependency crashes
  const Product = mongoose.models.Product || mongoose.model('Product');
  if (Product) {
    const productsCount = await Product.countDocuments({ category: id, isArchived: false });
    if (productsCount > 0) {
      return next(new AppError('Cannot delete category because it contains active products.', 400));
    }
  }

  await Category.deleteOne({ _id: id });
  return successResponse(res, null, 200, 'Category deleted successfully.');
});
