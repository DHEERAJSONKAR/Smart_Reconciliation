import mongoose, { Document, Schema } from 'mongoose';

export enum ReconciliationStatus {
  MATCHED = 'MATCHED',
  PARTIAL = 'PARTIAL',
  UNMATCHED = 'UNMATCHED',
  DUPLICATE = 'DUPLICATE',
}

export interface IReconciliationResult extends Document {
  recordId: mongoose.Types.ObjectId;
  uploadJobId: mongoose.Types.ObjectId;
  status: ReconciliationStatus;
  matchedWith?: mongoose.Types.ObjectId;
  confidence?: number;
  reason?: string;
  ruleName?: string;
  amountVariance?: number;
  manuallyReviewed: boolean;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reconciliationResultSchema = new Schema<IReconciliationResult>(
  {
    recordId: {
      type: Schema.Types.ObjectId,
      ref: 'Record',
      required: [true, 'Record ID is required'],
    },
    uploadJobId: {
      type: Schema.Types.ObjectId,
      ref: 'UploadJob',
      required: [true, 'Upload job ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ReconciliationStatus),
      required: [true, 'Status is required'],
      index: true,
    },
    matchedWith: {
      type: Schema.Types.ObjectId,
      ref: 'Record',
      index: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1,
    },
    reason: {
      type: String,
      trim: true,
    },
    ruleName: {
      type: String,
      trim: true,
    },
    amountVariance: {
      type: Number,
      default: 0,
    },
    manuallyReviewed: {
      type: Boolean,
      default: false,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reconciliationResultSchema.index({ uploadJobId: 1, status: 1 });
reconciliationResultSchema.index({ recordId: 1 }, { unique: true });
reconciliationResultSchema.index({ status: 1, manuallyReviewed: 1 });

const ReconciliationResult = mongoose.model<IReconciliationResult>(
  'ReconciliationResult',
  reconciliationResultSchema
);

export default ReconciliationResult;
