import UploadJob, { IUploadJob, UploadJobStatus } from '../models/UploadJob.model';
import { calculateFileHash } from '../utils/fileUtils';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

class UploadService {
  async createUploadJob(
    fileName: string,
    filePath: string,
    fileSize: number,
    uploadedBy: string
  ): Promise<IUploadJob> {
    try {
      // Calculate file hash for idempotency
      const fileHash = await calculateFileHash(filePath);

      // Check if file already uploaded
      const existingJob = await UploadJob.findOne({ fileHash });
      if (existingJob) {
        logger.info(`Duplicate file detected: ${fileHash}`);
        throw new AppError(
          `This file has already been uploaded (Job ID: ${existingJob._id})`,
          409
        );
      }

      // Create upload job
      const uploadJob = await UploadJob.create({
        fileName,
        filePath,
        fileSize,
        fileHash,
        uploadedBy,
        status: UploadJobStatus.PROCESSING,
        startedAt: new Date(),
      });

      logger.info(`Upload job created: ${uploadJob._id} for file: ${fileName}`);

      return uploadJob;
    } catch (error) {
      logger.error('Failed to create upload job:', error);
      throw error;
    }
  }

  async getUploadJobById(jobId: string): Promise<IUploadJob | null> {
    return UploadJob.findById(jobId).populate('uploadedBy', 'email role');
  }

  async getUploadJobs(filters: any = {}, page: number = 1, limit: number = 20): Promise<{
    jobs: IUploadJob[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      UploadJob.find(filters)
        .populate('uploadedBy', 'email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UploadJob.countDocuments(filters),
    ]);

    return {
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUploadJobStatus(
    jobId: string,
    status: UploadJobStatus,
    updates: Partial<IUploadJob> = {}
  ): Promise<IUploadJob | null> {
    const updateData: any = { status, ...updates };

    if (status === UploadJobStatus.COMPLETED || status === UploadJobStatus.FAILED) {
      updateData.completedAt = new Date();
    }

    const job = await UploadJob.findByIdAndUpdate(
      jobId,
      updateData,
      { new: true }
    );

    if (job) {
      logger.info(`Upload job ${jobId} status updated to ${status}`);
    }

    return job;
  }

  async incrementProcessedRecords(jobId: string, count: number = 1): Promise<void> {
    await UploadJob.findByIdAndUpdate(jobId, {
      $inc: { processedRecords: count },
    });
  }
}

export default new UploadService();
