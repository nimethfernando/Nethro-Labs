import express from 'express';
import { getProjectStats, getProjectTimeline } from '../controllers/clientController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('client', 'admin'));

router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Client Dashboard Terminal',
    user: req.user,
  });
});

router.get('/projects/:projectId/stats', getProjectStats);
router.get('/projects/:projectId/timeline', getProjectTimeline);

export default router;