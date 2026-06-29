import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';




const router = express.Router();




router.use(protect);
router.use(restrictTo('admin'));




router.get('/dashboard-overview', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Admin Dashboard Panel',
  });
});




export default router;