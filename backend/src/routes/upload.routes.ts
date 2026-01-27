import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { UserRole } from '../models/User.model';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// Upload file - ANALYST and ADMIN can upload
router.post(
  '/',
  authorize(UserRole.ANALYST, UserRole.ADMIN),
  upload.single('file'),
  uploadController.uploadFile
);

// Get upload job by ID - all authenticated users
router.get('/:jobId', uploadController.getUploadJob);

// List upload jobs - all authenticated users (filtered by role in controller)
router.get('/', uploadController.listUploadJobs);

export default router;
