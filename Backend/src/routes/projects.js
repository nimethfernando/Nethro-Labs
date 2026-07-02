import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';

const router = express.Router();

// POST /api/projects - Provision Client Profile & Map Project Details
router.post('/', async (expressRequest, expressResponse) => {
  try {
    const { name, email, password, clusterName, description, budget } = expressRequest.body;

    // 1. Check if the client user registration already exists
    const clientExists = await User.findOne({ email });
    if (clientExists) {
      return expressResponse.status(400).json({ message: 'A client profile with this email gateway already exists.' });
    }

    // 2. Generate and save the new client account
    const newClient = new User({
      name,
      email,
      password, // The User pre-save hook handles the hashing automatically!
      role: 'client',
      requiresPasswordReset: true,
      isVerified: true
    });
    const savedClient = await newClient.save();

    // 3. Create the architectural project mapping tied to this client's _id
    const newProject = new Project({
      client: savedClient._id,
      clusterName,
      description,
      budget: Number(budget) || 0
    });
    await newProject.save();

    expressResponse.status(201).json({
      success: true,
      message: 'Client environment and project infrastructure provisioned successfully.'
    });

  } catch (error) {
    expressResponse.status(500).json({ message: `Server error during profiling: ${error.message}` });
  }
});

export default router;