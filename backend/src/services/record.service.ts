import Record from '../models/Record.model';
import { ParsedRow } from './fileParser.service';
import config from '../config';
import logger from '../utils/logger';

class RecordService {
  async createRecords(
    uploadJobId: string,
    rows: ParsedRow[]
  ): Promise<{ created: number; errors: number }> {
    let created = 0;
    let errors = 0;

    // Process in chunks
    const chunkSize = config.reconciliation.chunkSize;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);

      try {
        const records = chunk.map((row) => ({
          uploadJobId,
          transactionId: row.transactionId,
          referenceNumber: row.referenceNumber,
          amount: row.amount,
          date: row.date,
          description: row.description,
          sourceSystem: row.sourceSystem,
          metadata: row,
        }));

        await Record.insertMany(records, { ordered: false });
        created += records.length;

        logger.debug(`Inserted ${records.length} records for job ${uploadJobId}`);
      } catch (error: any) {
        // Handle duplicate key errors
        if (error.writeErrors) {
          const inserted = chunk.length - error.writeErrors.length;
          created += inserted;
          errors += error.writeErrors.length;
          
          logger.warn(
            `Chunk insert partial success: ${inserted} inserted, ${error.writeErrors.length} failed`
          );
        } else {
          errors += chunk.length;
          logger.error('Chunk insert failed:', error);
        }
      }
    }

    logger.info(`Records created for job ${uploadJobId}: ${created} created, ${errors} errors`);
    return { created, errors };
  }

  async getRecordsByUploadJobId(uploadJobId: string): Promise<any[]> {
    return Record.find({ uploadJobId }).lean();
  }

  async getRecordById(recordId: string): Promise<any> {
    return Record.findById(recordId).lean();
  }

  async findRecordsByTransactionId(transactionId: string): Promise<any[]> {
    return Record.find({ transactionId }).lean();
  }

  async findRecordsByReferenceNumber(referenceNumber: string): Promise<any[]> {
    return Record.find({ referenceNumber }).lean();
  }

  async searchRecords(criteria: any, limit: number = 100): Promise<any[]> {
    return Record.find(criteria).limit(limit).lean();
  }
}

export default new RecordService();
