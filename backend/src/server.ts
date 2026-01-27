import app from './app';
import config from './config';
import connectDatabase from './database/connection';
import logger from './utils/logger';
import fs from 'fs';
import path from 'path';

// Create necessary directories
const createDirectories = () => {
  const dirs = [
    config.upload.uploadDir,
    path.join(__dirname, '../logs'),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  });
};

const startServer = async () => {
  try {
    // Create directories
    createDirectories();

    // Connect to database
    await connectDatabase();

    // Start server
    app.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
      logger.info(`Health check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
