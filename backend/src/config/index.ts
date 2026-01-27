import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

interface Config {
  env: string;
  port: number;
  mongodb: {
    uri: string;
  };
  jwt: {
    secret: string;
    expiresIn: string | number;
  };
  upload: {
    maxFileSize: number;
    uploadDir: string;
  };
  reconciliation: {
    chunkSize: number;
    partialMatchVariance: number;
  };
  worker: {
    concurrency: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_reconciliation',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
    uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  },
  reconciliation: {
    chunkSize: parseInt(process.env.RECONCILIATION_CHUNK_SIZE || '1000', 10),
    partialMatchVariance: parseFloat(process.env.PARTIAL_MATCH_VARIANCE || '0.02'),
  },
  worker: {
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
    retryAttempts: parseInt(process.env.WORKER_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.WORKER_RETRY_DELAY || '5000', 10),
  },
};

export default config;
