import express from 'express';
import { register } from '../controllers/authController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

// Admin creates client accounts through this proxy path
router.post('/create-client', register);

export default router;