import express from 'express';
import { getProjectStats, getProjectTimeline } from '../controllers/clientController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';




const router = express.Router();




router.use(protect);
router.use(restrictTo('client', 'admin'));




router.get('/projects/:projectId/stats', getProjectStats);
router.get('/projects/:projectId/timeline', getProjectTimeline);




export default router;