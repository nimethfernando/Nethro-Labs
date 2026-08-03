import express from 'express';
import { register, login, setupInitialPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/setup-password', protect, setupInitialPassword);

export default router;