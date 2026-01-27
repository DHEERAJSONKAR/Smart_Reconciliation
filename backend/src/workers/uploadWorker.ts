import { uploadQueue, UploadJobData } from '../queues/upload.queue';
import uploadService from '../services/upload.service';
import fileParserService from '../services/fileParser.service';
import recordService from '../services/record.service';
import UploadJob, { UploadJobStatus } from '../models/UploadJob.model';
import logger from '../utils/logger';
import { deleteFile } from '../utils/fileUtils';
import connectDatabase from '../database/connection';

// Import reconciliation service (will be implemented in Phase 6)
let reconciliationService: any;
try {
  reconciliationService = require('../services/reconciliation.service').default;
} catch {
  logger.warn('Reconciliation service not yet available');
}

class UploadWorker {
  private pollingInterval: NodeJS.Timeout | null = null;

  start(): void {
    logger.info('Upload worker started');

    // Register queue processor for in-process jobs
    uploadQueue.process(async (data: UploadJobData) => {
      await this.processUploadJob(data);
    });

    uploadQueue.on('job:completed', (job) => {
      logger.info(`Upload job ${job.data.uploadJobId} completed`);
    });

    uploadQueue.on('job:failed', (job) => {
      logger.error(`Upload job ${job.data.uploadJobId} failed: ${job.error}`);
    });

    uploadQueue.on('job:retry', (job) => {
      logger.warn(`Upload job ${job.data.uploadJobId} retrying (attempt ${job.attempts})`);
    });

    // Poll database for PROCESSING jobs (for cross-process support)
    this.startPolling();
  }

  private startPolling(): void {
    logger.info('Starting database polling for pending jobs');
    
    // Poll every 5 seconds
    this.pollingInterval = setInterval(async () => {
      try {
        await this.processPendingJobs();
      } catch (error) {
        logger.error('Error in polling cycle:', error);
      }
    }, 5000);
  }

  private async processPendingJobs(): Promise<void> {
    try {
      // Find jobs that are in PROCESSING status and haven't been picked up
      const pendingJobs = await UploadJob.find({
        status: UploadJobStatus.PROCESSING,
        processedRecords: 0,
      }).limit(5);

      if (pendingJobs.length > 0) {
        logger.info(`Found ${pendingJobs.length} pending jobs to process`);
      }

      for (const job of pendingJobs) {
        try {
          await this.processUploadJob({
            uploadJobId: job._id.toString(),
            filePath: job.filePath,
            fileName: job.fileName,
          });
        } catch (error) {
          logger.error(`Failed to process job ${job._id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error fetching pending jobs:', error);
    }
  }

  stop(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      logger.info('Worker polling stopped');
    }
  }

  private async processUploadJob(data: UploadJobData): Promise<void> {
    const { uploadJobId, filePath, fileName } = data;

    logger.info(`Processing upload job: ${uploadJobId} - ${fileName}`);

    try {
      // Parse file
      logger.info(`Parsing file: ${fileName}`);
      const parseResult = await fileParserService.parseFile(filePath);

      // Update total records
      await uploadService.updateUploadJobStatus(uploadJobId, UploadJobStatus.PROCESSING, {
        totalRecords: parseResult.totalRows,
      });

      if (parseResult.rows.length === 0) {
        throw new Error('No valid records found in file');
      }

      // Create records
      logger.info(`Creating records for job: ${uploadJobId}`);
      const { created, errors } = await recordService.createRecords(
        uploadJobId,
        parseResult.rows
      );

      // Update processed records count
      await uploadService.updateUploadJobStatus(uploadJobId, UploadJobStatus.PROCESSING, {
        processedRecords: created,
      });

      // Run reconciliation if service is available
      if (reconciliationService && typeof reconciliationService.reconcileUploadJob === 'function') {
        logger.info(`Running reconciliation for job: ${uploadJobId}`);
        await reconciliationService.reconcileUploadJob(uploadJobId);
      }

      // Mark job as completed
      await uploadService.updateUploadJobStatus(uploadJobId, UploadJobStatus.COMPLETED);

      // Clean up uploaded file
      await deleteFile(filePath);

      logger.info(`Upload job ${uploadJobId} completed successfully: ${created} records created`);
    } catch (error: any) {
      logger.error(`Upload job ${uploadJobId} failed:`, error);

      // Mark job as failed
      await uploadService.updateUploadJobStatus(uploadJobId, UploadJobStatus.FAILED, {
        errorMessage: error.message,
      });

      throw error;
    }
  }
}

// Initialize database connection and start worker
const startWorker = async () => {
  try {
    await connectDatabase();
    logger.info('Worker connected to database');
    
    const worker = new UploadWorker();
    worker.start();
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
};

startWorker();

export default UploadWorker;
