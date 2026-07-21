import express from 'express';
import Feedback from '../models/Feedback.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/feedback/:projectId - Get all feedback/messages for a project
router.get('/:projectId', protect, async (req, res) => {
  try {
    const messages = await Feedback.find({ project: req.params.projectId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// POST /api/feedback/:projectId - Send feedback / response message
router.post('/:projectId', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const newMessage = new Feedback({
      project: req.params.projectId,
      sender: req.user._id,
      message,
    });

    await newMessage.save();
    const populatedMessage = await newMessage.populate('sender', 'name role');

    return res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;