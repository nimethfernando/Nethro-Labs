import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js'; 
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/projects - Retrieve all projects (Admin only)
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const projects = await Project.find().populate('client', 'name email role');
    return res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('❌ Fetch Projects Error:', error);
    return res.status(500).json({
      message: `Server error fetching projects: ${error.message}`
    });
  }
});

// POST /api/projects - Provision Client & Project Mapping
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { 
      name, 
      clientName, 
      organizationName, 
      email, 
      corporateEmail,
      password, 
      sharedPassword,
      clusterName, 
      projectCluster,
      description, 
      operationalSpecifications,
      budget,
      allocatedBudget 
    } = req.body;

    const finalName = name || clientName || organizationName;
    const finalEmail = email || corporateEmail;
    const finalPassword = password || sharedPassword;
    const finalClusterName = clusterName || projectCluster;
    const finalDescription = description || operationalSpecifications;
    const finalBudget = budget || allocatedBudget;

    if (!finalName || !finalEmail || !finalPassword) {
      return res.status(400).json({ 
        message: 'Missing core profile specifications (Name, Email gateway, or Temporary password).' 
      });
    }

    const clientExists = await User.findOne({ email: finalEmail });
    if (clientExists) {
      return res.status(400).json({ 
        message: 'A client profile with this corporate email gateway already exists.' 
      });
    }

    const newClient = new User({
      name: finalName,
      email: finalEmail,
      password: finalPassword,
      role: 'client',
      requiresPasswordReset: true,
      isVerified: true
    });
    const savedClient = await newClient.save();

    const newProject = new Project({
      client: savedClient._id,
      clusterName: finalClusterName || 'Default Cluster',
      description: finalDescription || 'No description provided.',
      budget: Number(finalBudget) || 0
    });
    await newProject.save();

    return res.status(201).json({
      success: true,
      message: 'Client environment and project infrastructure provisioned successfully.'
    });

  } catch (error) {
    console.error('❌ Provisioning Error:', error);
    return res.status(500).json({ 
      message: `Server error during provisioning: ${error.message}` 
    });
  }
});

// PUT /api/projects/:id - Update Project Details
router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const {
      clusterName,
      projectCluster,
      description,
      operationalSpecifications,
      budget,
      allocatedBudget,
      status,
      clientName,
      corporateEmail
    } = req.body;

    const finalClusterName = clusterName || projectCluster;
    const finalDescription = description || operationalSpecifications;
    const finalBudget = budget !== undefined ? budget : allocatedBudget;

    // 1. Dynamic update object
    const projectUpdates = {};
    if (finalClusterName !== undefined) projectUpdates.clusterName = finalClusterName;
    if (finalDescription !== undefined) projectUpdates.description = finalDescription;
    if (finalBudget !== undefined) projectUpdates.budget = Number(finalBudget) || 0;
    if (status !== undefined) projectUpdates.status = status;

    // 2. Find and update project document
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { $set: projectUpdates },
      { new: true, runValidators: true }
    ).populate('client', 'name email role');

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project infrastructure not found.' });
    }

    // 3. Optional: Update linked client profile
    if (updatedProject.client && (clientName || corporateEmail)) {
      const clientUpdates = {};
      if (clientName) clientUpdates.name = clientName;
      if (corporateEmail) clientUpdates.email = corporateEmail;

      await User.findByIdAndUpdate(
        updatedProject.client._id,
        { $set: clientUpdates },
        { runValidators: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Project details updated successfully.',
      project: updatedProject
    });

  } catch (error) {
    console.error('❌ Project Update Error:', error);
    return res.status(500).json({
      message: `Server error while updating project: ${error.message}`
    });
  }
});

export default router;