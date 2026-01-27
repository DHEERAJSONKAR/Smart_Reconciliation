import mongoose, { Document, Schema } from 'mongoose';

export enum UploadJobStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IUploadJob extends Document {
  fileName: string;
  fileHash: string;
  fileSize: number;
  filePath: string;
  status: UploadJobStatus;
  uploadedBy: mongoose.Types.ObjectId;
  totalRecords: number;
  processedRecords: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const uploadJobSchema = new Schema<IUploadJob>(
  {
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileHash: {
      type: String,
      required: [true, 'File hash is required'],
      unique: true,
      index: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    status: {
      type: String,
      enum: Object.values(UploadJobStatus),
      default: UploadJobStatus.PROCESSING,
      required: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploaded by user is required'],
      index: true,
    },
    totalRecords: {
      type: Number,
      default: 0,
    },
    processedRecords: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
uploadJobSchema.index({ uploadedBy: 1, createdAt: -1 });
uploadJobSchema.index({ status: 1, createdAt: -1 });

const UploadJob = mongoose.model<IUploadJob>('UploadJob', uploadJobSchema);

export default UploadJob;
