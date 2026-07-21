import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js'; 
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; // Adjust based on your auth middleware setup

const router = express.Router();

// ... [YOUR EXISTING POST / ROUTE] ...

// PUT /api/projects/:id - Update Project Details
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      clusterName,
      projectCluster,
      description,
      operationalSpecifications,
      budget,
      allocatedBudget,
      status, // Optional: if you track project status (e.g., Pending, In Progress, Completed)
      clientName,
      corporateEmail
    } = req.body;

    // Normalization fallbacks matching your POST handler logic
    const finalClusterName = clusterName || projectCluster;
    const finalDescription = description || operationalSpecifications;
    const finalBudget = budget !== undefined ? budget : allocatedBudget;

    // 1. Build project update object dynamically
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
    ).populate('client', 'name email role'); // Populate client info for response

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project infrastructure not found.' });
    }

    // 3. Optional: Update client user profile if client details (Name/Email) were provided in the edit form
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