import { Queue } from './Queue';
import config from '../config';

export interface UploadJobData {
  uploadJobId: string;
  filePath: string;
  fileName: string;
}

export const uploadQueue = new Queue<UploadJobData>('upload-queue', {
  maxAttempts: config.worker.retryAttempts,
  retryDelay: config.worker.retryDelay,
  concurrency: config.worker.concurrency,
});
