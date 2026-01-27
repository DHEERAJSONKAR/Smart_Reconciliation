import mongoose, { Document, Schema } from 'mongoose';

export interface IRecord extends Document {
  uploadJobId: mongoose.Types.ObjectId;
  transactionId: string;
  referenceNumber: string;
  amount: number;
  date: Date;
  description?: string;
  sourceSystem?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const recordSchema = new Schema<IRecord>(
  {
    uploadJobId: {
      type: Schema.Types.ObjectId,
      ref: 'UploadJob',
      required: [true, 'Upload job ID is required'],
      index: true,
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      trim: true,
      index: true,
    },
    referenceNumber: {
      type: String,
      required: [true, 'Reference number is required'],
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sourceSystem: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for reconciliation
recordSchema.index({ transactionId: 1, amount: 1 });
recordSchema.index({ referenceNumber: 1, amount: 1 });
recordSchema.index({ uploadJobId: 1, transactionId: 1 });

const Record = mongoose.model<IRecord>('Record', recordSchema);

export default Record;
