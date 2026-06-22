import mongoose from 'mongoose';

const priceSlabSchema = new mongoose.Schema(
  {
    minQty: {
      type: Number,
      required: [true, 'Minimum quantity is required'],
      min: [1, 'Minimum quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
  },
  { _id: false } // Do not generate object IDs for each price slab item
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    unit: {
      type: String,
      required: true,
      default: 'kg',
    },
    moq: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'MOQ must be at least 1'],
    },
    images: {
      type: [String],
      default: [],
    },
    priceSlabs: {
      type: [priceSlabSchema],
      required: [true, 'Price slabs are required'],
      validate: [
        {
          validator: function(val) {
            return val && val.length > 0;
          },
          message: 'At least one price slab must be defined.',
        },
      ],
    },
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    variants: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    status: {
      type: String,
      required: true,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'out_of_stock',
    },
    isArchived: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
productSchema.index({ name: 'text', description: 'text' });

// Compound and sorting indexes for products catalog
productSchema.index({ isArchived: 1, category: 1, 'priceSlabs.0.unitPrice': 1 });
productSchema.index({ isArchived: 1, category: 1, 'priceSlabs.0.unitPrice': -1 });
productSchema.index({ isArchived: 1, category: 1, createdAt: -1 });
productSchema.index({ isArchived: 1, createdAt: -1 });
productSchema.index({ isArchived: 1, stock: 1 });

// pre-save hook to calculate status based on stock level
productSchema.pre('save', function() {
  if (this.isModified('stock') || this.isNew) {
    if (this.stock === 0) {
      this.status = 'out_of_stock';
    } else if (this.stock < 10) {
      this.status = 'low_stock';
    } else {
      this.status = 'in_stock';
    }
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
