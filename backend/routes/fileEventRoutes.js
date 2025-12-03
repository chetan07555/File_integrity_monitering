import express from 'express';
import {
  getFileEvents,
  getFileEventById,
  getFileHistory,
  getEventStats,
  deleteFileEvent,
} from '../controllers/fileEventController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getFileEvents);
router.get('/stats', getEventStats);
router.get('/:id', getFileEventById);
router.get('/history/:filePath', getFileHistory);

// Admin only routes
router.delete('/:id', authorize('admin'), deleteFileEvent);

export default router;
