export enum UploadStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface UploadJob {
  _id: string;
  fileName: string;
  fileSize: number;
  status: UploadStatus;
  totalRecords: number;
  processedRecords: number;
  uploadedBy: {
    _id: string;
    email: string;
    role: string;
  };
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  jobId: string;
  fileName: string;
  status: string;
  message: string;
}
