import { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import uploadService from '../services/upload.service';
import reconciliationService from '../services/reconciliation.service';
import { UploadJobStatus } from '../models/UploadJob.model';

class DashboardController {
  getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Get upload jobs based on role
    const uploadFilters: any = {};
    if (userRole !== 'ADMIN') {
      uploadFilters.uploadedBy = userId;
    }

    const [allJobs, completedJobs, processingJobs, failedJobs] = await Promise.all([
      uploadService.getUploadJobs(uploadFilters, 1, 1000),
      uploadService.getUploadJobs(
        { ...uploadFilters, status: UploadJobStatus.COMPLETED },
        1,
        1000
      ),
      uploadService.getUploadJobs(
        { ...uploadFilters, status: UploadJobStatus.PROCESSING },
        1,
        1000
      ),
      uploadService.getUploadJobs(
        { ...uploadFilters, status: UploadJobStatus.FAILED },
        1,
        1000
      ),
    ]);

    // Aggregate reconciliation stats from all completed jobs
    let totalReconciliationStats = {
      total: 0,
      matched: 0,
      partial: 0,
      unmatched: 0,
      duplicate: 0,
    };

    for (const job of completedJobs.jobs) {
      try {
        const stats = await reconciliationService.getReconciliationStats(
          job._id.toString()
        );
        totalReconciliationStats.total += stats.total;
        totalReconciliationStats.matched += stats.matched;
        totalReconciliationStats.partial += stats.partial;
        totalReconciliationStats.unmatched += stats.unmatched;
        totalReconciliationStats.duplicate += stats.duplicate;
      } catch (error) {
        // Skip if no reconciliation results yet
      }
    }

    const summary = {
      uploads: {
        total: allJobs.total,
        completed: completedJobs.total,
        processing: processingJobs.total,
        failed: failedJobs.total,
      },
      reconciliation: totalReconciliationStats,
      recentJobs: allJobs.jobs.slice(0, 10),
    };

    return ApiResponse.success(res, summary, 'Dashboard summary retrieved successfully');
  });

  getRecentActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { limit = '20' } = req.query;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const uploadFilters: any = {};
    if (userRole !== 'ADMIN') {
      uploadFilters.uploadedBy = userId;
    }

    const recentJobs = await uploadService.getUploadJobs(
      uploadFilters,
      1,
      parseInt(limit as string, 10)
    );

    return ApiResponse.success(
      res,
      recentJobs,
      'Recent activity retrieved successfully'
    );
  });
}

export default new DashboardController();
