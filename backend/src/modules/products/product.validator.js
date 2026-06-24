import { z } from 'zod';
import mongoose from 'mongoose';

// Custom validator for Mongoose ObjectId
const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid Category ID',
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters long').trim(),
  category: objectIdSchema,
  origin: z.string().min(1, 'Origin is required').trim(),
  grade: z.string().min(1, 'Grade is required').trim(),
});

export const updateProductSchema = createProductSchema.partial();
