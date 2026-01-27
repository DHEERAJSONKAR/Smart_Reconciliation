import { Request, Response } from 'express';
import uploadService from '../services/upload.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';
import { uploadQueue } from '../queues/upload.queue';

class UploadController {
  uploadFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return ApiResponse.badRequest(res, 'No file uploaded');
    }

    const { filename, path: filePath, size, originalname } = req.file;
    const userId = req.user!.userId;

    // Log upload initiation
    logger.info(`File upload initiated by user ${userId}: ${originalname}`);

    try {
      // Create upload job
      const uploadJob = await uploadService.createUploadJob(
        originalname,
        filePath,
        size,
        userId
      );

      // Add job to queue for async processing
      await uploadQueue.add({
        uploadJobId: uploadJob._id.toString(),
        filePath,
        fileName: originalname,
      });

      logger.info(`Upload job ${uploadJob._id} added to queue`);

      return ApiResponse.created(
        res,
        {
          jobId: uploadJob._id,
          fileName: uploadJob.fileName,
          status: uploadJob.status,
          message: 'File uploaded successfully and queued for processing',
        },
        'File upload initiated'
      );
    } catch (error: any) {
      logger.error('Upload failed:', error);

      // If it's a duplicate file error, return specific response
      if (error.statusCode === 409) {
        return ApiResponse.conflict(res, error.message);
      }

      throw error;
    }
  });

  getUploadJob = asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;

    const uploadJob = await uploadService.getUploadJobById(jobId);

    if (!uploadJob) {
      return ApiResponse.notFound(res, 'Upload job not found');
    }

    return ApiResponse.success(res, uploadJob, 'Upload job retrieved successfully');
  });

  listUploadJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, page = '1', limit = '20' } = req.query;

    const filters: any = {};

    // If not admin, only show user's own uploads
    if (req.user!.role !== 'ADMIN') {
      filters.uploadedBy = req.user!.userId;
    }

    if (status) {
      filters.status = status;
    }

    const result = await uploadService.getUploadJobs(
      filters,
      parseInt(page as string, 10),
      parseInt(limit as string, 10)
    );

    return ApiResponse.success(res, result, 'Upload jobs retrieved successfully');
  });
}

export default new UploadController();
