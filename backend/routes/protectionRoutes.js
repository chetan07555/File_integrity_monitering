import express from 'express';
import { protect } from '../middleware/auth.js';
import { protectFile, restoreBackup } from '../controllers/protectionController.js';

const router = express.Router();

router.use(protect);
router.post('/', protectFile);
router.post('/restore', restoreBackup);

export default router;
