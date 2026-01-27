import ReconciliationResult, {
  ReconciliationStatus,
  IReconciliationResult,
} from '../models/ReconciliationResult.model';
import Record from '../models/Record.model';
import recordService from './record.service';
import { getActiveRules } from '../config/reconciliationRules';
import config from '../config';
import logger from '../utils/logger';

export interface ReconciliationStats {
  total: number;
  matched: number;
  partial: number;
  unmatched: number;
  duplicate: number;
}

class ReconciliationService {
  async reconcileUploadJob(uploadJobId: string): Promise<ReconciliationStats> {
    logger.info(`Starting reconciliation for upload job: ${uploadJobId}`);

    const records = await recordService.getRecordsByUploadJobId(uploadJobId);
    // console.log('Found records:', records.length); // debugging
    
    if (records.length === 0) {
      logger.warn(`No records found for upload job: ${uploadJobId}`);
      return {
        total: 0,
        matched: 0,
        partial: 0,
        unmatched: 0,
        duplicate: 0,
      };
    }

    const stats: ReconciliationStats = {
      total: records.length,
      matched: 0,
      partial: 0,
      unmatched: 0,
      duplicate: 0,
    };

    // Get active reconciliation rules
    const rules = getActiveRules();
    logger.info(`Applying ${rules.length} reconciliation rules`);

    // Process records in chunks to avoid memory issues
    // TODO: make chunk size configurable per job type
    const chunkSize = config.reconciliation.chunkSize;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);

      for (const record of chunk) {
        const result = await this.reconcileRecord(record, uploadJobId);
        stats[result.status.toLowerCase() as keyof ReconciliationStats]++;
      }
    }

    logger.info(`Reconciliation completed for job ${uploadJobId}:`, stats);
    return stats;
  }

  private async reconcileRecord(
    record: any,
    uploadJobId: string
  ): Promise<IReconciliationResult> {
    // Check if already reconciled
    const existing = await ReconciliationResult.findOne({ recordId: record._id });
    if (existing) {
      return existing;
    }

    // Get active rules in priority order
    const rules = getActiveRules();

    // Try each rule
    for (const rule of rules) {
      let result: IReconciliationResult | null = null;

      switch (rule.name) {
        case 'EXACT_MATCH':
          result = await this.applyExactMatchRule(record, uploadJobId);
          break;
        case 'PARTIAL_MATCH':
          result = await this.applyPartialMatchRule(record, uploadJobId);
          break;
        case 'DUPLICATE_DETECTION':
          result = await this.applyDuplicateDetectionRule(record, uploadJobId);
          break;
      }

      if (result) {
        return result;
      }
    }

    // No match found - mark as unmatched
    return await this.createReconciliationResult(
      record._id,
      uploadJobId,
      ReconciliationStatus.UNMATCHED,
      {
        reason: 'No matching record found',
        ruleName: 'UNMATCHED',
      }
    );
  }

  private async applyExactMatchRule(
    record: any,
    uploadJobId: string
  ): Promise<IReconciliationResult | null> {
    // Find records with same transactionId and amount from different upload jobs
    const matches = await Record.find({
      transactionId: record.transactionId,
      amount: record.amount,
      uploadJobId: { $ne: uploadJobId },
    }).limit(10);

    if (matches.length > 0) {
      const matchedRecord = matches[0];

      // Check if the matched record is already reconciled
      const existingMatch = await ReconciliationResult.findOne({
        recordId: matchedRecord._id,
        status: ReconciliationStatus.MATCHED,
      });

      if (!existingMatch) {
        // Create reconciliation result for both records
        await this.createReconciliationResult(
          matchedRecord._id.toString(),
          matchedRecord.uploadJobId.toString(),
          ReconciliationStatus.MATCHED,
          {
            matchedWith: record._id.toString(),
            ruleName: 'EXACT_MATCH',
            reason: 'Exact match on transaction ID and amount',
            confidence: 1.0,
          }
        );

        return await this.createReconciliationResult(
          record._id.toString(),
          uploadJobId,
          ReconciliationStatus.MATCHED,
          {
            matchedWith: matchedRecord._id.toString(),
            ruleName: 'EXACT_MATCH',
            reason: 'Exact match on transaction ID and amount',
            confidence: 1.0,
          }
        );
      }
    }

    return null;
  }

  private async applyPartialMatchRule(
    record: any,
    uploadJobId: string
  ): Promise<IReconciliationResult | null> {
    // Find records with same reference number from different upload jobs
    const matches = await Record.find({
      referenceNumber: record.referenceNumber,
      uploadJobId: { $ne: uploadJobId },
    }).limit(10);

    if (matches.length === 0) {
      return null;
    }

    // Check amount variance
    const variance = config.reconciliation.partialMatchVariance;

    for (const matchedRecord of matches) {
      const amountDiff = Math.abs(matchedRecord.amount - record.amount);
      const amountVariance = amountDiff / record.amount;

      if (amountVariance <= variance) {
        // Check if already reconciled
        const existingMatch = await ReconciliationResult.findOne({
          recordId: matchedRecord._id,
          status: { $in: [ReconciliationStatus.MATCHED, ReconciliationStatus.PARTIAL] },
        });

        if (!existingMatch) {
          // Create reconciliation result for both records
          await this.createReconciliationResult(
            matchedRecord._id.toString(),
            matchedRecord.uploadJobId.toString(),
            ReconciliationStatus.PARTIAL,
            {
              matchedWith: record._id.toString(),
              ruleName: 'PARTIAL_MATCH',
              reason: `Partial match on reference number with amount variance of ${(
                amountVariance * 100
              ).toFixed(2)}%`,
              confidence: 1 - amountVariance,
              amountVariance: amountDiff,
            }
          );

          return await this.createReconciliationResult(
            record._id.toString(),
            uploadJobId,
            ReconciliationStatus.PARTIAL,
            {
              matchedWith: matchedRecord._id.toString(),
              ruleName: 'PARTIAL_MATCH',
              reason: `Partial match on reference number with amount variance of ${(
                amountVariance * 100
              ).toFixed(2)}%`,
              confidence: 1 - amountVariance,
              amountVariance: amountDiff,
            }
          );
        }
      }
    }

    return null;
  }

  private async applyDuplicateDetectionRule(
    record: any,
    uploadJobId: string
  ): Promise<IReconciliationResult | null> {
    // Find duplicate records with same transactionId in the SAME upload job
    const duplicates = await Record.find({
      transactionId: record.transactionId,
      uploadJobId: uploadJobId,
      _id: { $ne: record._id },
    }).limit(5);

    if (duplicates.length > 0) {
      return await this.createReconciliationResult(
        record._id.toString(),
        uploadJobId,
        ReconciliationStatus.DUPLICATE,
        {
          ruleName: 'DUPLICATE_DETECTION',
          reason: `Duplicate transaction ID found ${duplicates.length} time(s) in the same upload`,
          confidence: 1.0,
        }
      );
    }

    return null;
  }

  private async createReconciliationResult(
    recordId: string,
    uploadJobId: string,
    status: ReconciliationStatus,
    options: {
      matchedWith?: string;
      ruleName?: string;
      reason?: string;
      confidence?: number;
      amountVariance?: number;
    } = {}
  ): Promise<IReconciliationResult> {
    const result = await ReconciliationResult.create({
      recordId,
      uploadJobId,
      status,
      matchedWith: options.matchedWith,
      ruleName: options.ruleName,
      reason: options.reason,
      confidence: options.confidence,
      amountVariance: options.amountVariance,
      manuallyReviewed: false,
    });

    logger.debug(`Reconciliation result created: ${result._id} - ${status}`);
    return result;
  }

  async getReconciliationResults(
    uploadJobId: string,
    filters: {
      status?: ReconciliationStatus;
      manuallyReviewed?: boolean;
    } = {}
  ): Promise<IReconciliationResult[]> {
    const query: any = { uploadJobId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.manuallyReviewed !== undefined) {
      query.manuallyReviewed = filters.manuallyReviewed;
    }

    return ReconciliationResult.find(query)
      .populate('recordId')
      .populate('matchedWith')
      .sort({ createdAt: -1 });
  }

  async getReconciliationStats(uploadJobId: string): Promise<ReconciliationStats> {
    const results = await ReconciliationResult.aggregate([
      { $match: { uploadJobId: uploadJobId as any } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats: ReconciliationStats = {
      total: 0,
      matched: 0,
      partial: 0,
      unmatched: 0,
      duplicate: 0,
    };

    results.forEach((result) => {
      const status = result._id.toLowerCase();
      stats[status as keyof ReconciliationStats] = result.count;
      stats.total += result.count;
    });

    return stats;
  }

  async updateReconciliationResult(
    resultId: string,
    userId: string,
    updates: {
      status?: ReconciliationStatus;
      notes?: string;
    }
  ): Promise<IReconciliationResult | null> {
    const result = await ReconciliationResult.findByIdAndUpdate(
      resultId,
      {
        ...updates,
        manuallyReviewed: true,
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (result) {
      logger.info(`Reconciliation result ${resultId} updated by user ${userId}`);
    }

    return result;
  }
}

export default new ReconciliationService();
