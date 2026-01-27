import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sanitizeRequest } from './middleware/sanitize.middleware';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';
import reconciliationRoutes from './routes/reconciliation.routes';
import dashboardRoutes from './routes/dashboard.routes';
import auditRoutes from './routes/audit.routes';
import logger from './utils/logger';

const app: Application = express();

// TODO: Move CORS config to environment variables
// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting - might need to adjust these values based on actual usage
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);
// console.log('Rate limiter configured');

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize input
app.use(sanitizeRequest);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Reconciliation & Audit System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      uploads: '/api/uploads',
      reconciliation: '/api/reconciliation',
      dashboard: '/api/dashboard',
      audit: '/api/audit'
    },
    documentation: 'All API endpoints are available under /api prefix'
  });
});

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
