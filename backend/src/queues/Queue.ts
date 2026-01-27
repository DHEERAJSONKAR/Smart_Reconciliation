import EventEmitter from 'events';
import logger from '../utils/logger';

export interface QueueJob<T = any> {
  id: string;
  data: T;
  attempts: number;
  maxAttempts: number;
  delay: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface QueueOptions {
  maxAttempts?: number;
  retryDelay?: number;
  concurrency?: number;
}

export type JobProcessor<T = any> = (data: T) => Promise<void>;

export class Queue<T = any> extends EventEmitter {
  private jobs: Map<string, QueueJob<T>> = new Map();
  private processing: Set<string> = new Set();
  private processor?: JobProcessor<T>;
  private options: Required<QueueOptions>;
  private processingCount: number = 0;

  constructor(name: string, options: QueueOptions = {}) {
    super();
    this.options = {
      maxAttempts: options.maxAttempts || 3,
      retryDelay: options.retryDelay || 5000,
      concurrency: options.concurrency || 5,
    };

    logger.info(`Queue "${name}" initialized with concurrency: ${this.options.concurrency}`);
  }

  async add(data: T): Promise<string> {
    const jobId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job: QueueJob<T> = {
      id: jobId,
      data,
      attempts: 0,
      maxAttempts: this.options.maxAttempts,
      delay: this.options.retryDelay,
      status: 'pending',
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);
    logger.debug(`Job ${jobId} added to queue`);
    this.emit('job:added', job);

    // Start processing if processor is set
    if (this.processor) {
      this.processNext();
    }

    return jobId;
  }

  process(processor: JobProcessor<T>): void {
    this.processor = processor;
    logger.info('Queue processor registered');
    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (!this.processor) return;
    if (this.processingCount >= this.options.concurrency) return;

    const pendingJob = this.getNextPendingJob();
    if (!pendingJob) return;

    this.processingCount++;
    this.processing.add(pendingJob.id);
    pendingJob.status = 'processing';
    pendingJob.attempts++;

    logger.debug(`Processing job ${pendingJob.id} (attempt ${pendingJob.attempts}/${pendingJob.maxAttempts})`);

    try {
      await this.processor(pendingJob.data);
      this.completeJob(pendingJob.id);
    } catch (error: any) {
      this.failJob(pendingJob.id, error.message);
    } finally {
      this.processing.delete(pendingJob.id);
      this.processingCount--;
      
      // Process next job
      setImmediate(() => this.processNext());
    }
  }

  private getNextPendingJob(): QueueJob<T> | undefined {
    for (const job of this.jobs.values()) {
      if (job.status === 'pending' && !this.processing.has(job.id)) {
        return job;
      }
    }
    return undefined;
  }

  private completeJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'completed';
      job.processedAt = new Date();
      logger.info(`Job ${jobId} completed successfully`);
      this.emit('job:completed', job);
      
      // Clean up old completed jobs
      setTimeout(() => this.jobs.delete(jobId), 60000); // Remove after 1 minute
    }
  }

  private failJob(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.error = error;

    if (job.attempts < job.maxAttempts) {
      // Retry
      logger.warn(`Job ${jobId} failed (attempt ${job.attempts}/${job.maxAttempts}), retrying in ${job.delay}ms`);
      job.status = 'pending';
      
      setTimeout(() => {
        this.processNext();
      }, job.delay);
      
      this.emit('job:retry', job);
    } else {
      // Max attempts reached
      job.status = 'failed';
      job.processedAt = new Date();
      logger.error(`Job ${jobId} failed permanently after ${job.attempts} attempts: ${error}`);
      this.emit('job:failed', job);
      
      // Clean up failed jobs
      setTimeout(() => this.jobs.delete(jobId), 300000); // Remove after 5 minutes
    }
  }

  getJob(jobId: string): QueueJob<T> | undefined {
    return this.jobs.get(jobId);
  }

  getStats(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    const stats = {
      total: this.jobs.size,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    for (const job of this.jobs.values()) {
      stats[job.status]++;
    }

    return stats;
  }
}
