import mongoose from 'mongoose';

const stockRequestSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester ID is required'],
      index: true,
    },
    requesterRole: {
      type: String,
      required: true,
      enum: ['manager', 'executive'],
    },
    type: {
      type: String,
      required: true,
      enum: ['add', 'update', 'new_product'],
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
    },
    requestedChange: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const StockRequest = mongoose.model('StockRequest', stockRequestSchema);

export default StockRequest;
