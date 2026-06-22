import express from 'express';
import * as productController from './product.controller.js';
import { createProductSchema, updateProductSchema } from './product.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import validate from '../../middlewares/validate.js';
import handleUploads from '../../middlewares/upload.js';

const router = express.Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin-only routes with uploads and validation
router.post(
  '/',
  authenticate,
  authorize('admin'),
  handleUploads([{ name: 'images', maxCount: 5 }]),
  validate(createProductSchema),
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  handleUploads([{ name: 'images', maxCount: 5 }]),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  productController.deleteProduct
);

export default router;
