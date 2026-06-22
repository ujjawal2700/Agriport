import { z } from 'zod';
import mongoose from 'mongoose';

// Custom validator for Mongoose ObjectId
const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid Category ID',
});

// Price Slab schema
const priceSlabSchema = z.object({
  minQty: z.preprocess((val) => Number(val), z.number().int().min(1, 'Minimum quantity must be at least 1')),
  unitPrice: z.preprocess((val) => Number(val), z.number().min(0, 'Unit price cannot be negative')),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters long').trim(),
  description: z.string().min(5, 'Product description must be at least 5 characters long').trim(),
  sku: z.string().min(2, 'SKU must be at least 2 characters long').trim().toUpperCase(),
  category: objectIdSchema,
  unit: z.string().default('kg'),
  moq: z.preprocess((val) => (val === undefined || val === '' ? 1 : Number(val)), z.number().int().min(1, 'MOQ must be at least 1')),
  priceSlabs: z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }
    return val;
  }, z.array(priceSlabSchema).min(1, 'At least one price slab must be defined.')),
  specs: z.preprocess((val) => {
    if (typeof val === 'string' && val !== '') {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }
    return val || {};
  }, z.record(z.string()).optional()),
  variants: z.preprocess((val) => {
    if (typeof val === 'string' && val !== '') {
      try {
        return JSON.parse(val);
      } catch (e) {
        // If it's a comma-separated list
        return val.split(',').map(v => v.trim());
      }
    }
    return val || [];
  }, z.array(z.string()).optional()),
  stock: z.preprocess((val) => (val === undefined || val === '' ? 0 : Number(val)), z.number().int().min(0, 'Stock cannot be negative')),
});

export const updateProductSchema = createProductSchema.partial().extend({
  category: objectIdSchema.optional(),
});
