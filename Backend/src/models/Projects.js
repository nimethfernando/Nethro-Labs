import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';

const router = express.Router();

// POST /api/projects - Form Handler
router.post('/', async (req, res) => {
  try {
    // Extracted and normalized to handle variations in frontend payload naming conventions
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

    // Fallbacks to guarantee fields match your exact UI form labels
    const finalName = name || clientName || organizationName;
    const finalEmail = email || corporateEmail;
    const finalPassword = password || sharedPassword;
    const finalClusterName = clusterName || projectCluster;
    const finalDescription = description || operationalSpecifications;
    const finalBudget = budget || allocatedBudget;

    // Validate essential profile specifications
    if (!finalName || !finalEmail || !finalPassword) {
      return res.status(400).json({ 
        message: 'Missing core profile specifications (Name, Email gateway, or Temporary password).' 
      });
    }

    // 1. Check if the client profile already exists
    const clientExists = await User.findOne({ email: finalEmail });
    if (clientExists) {
      return res.status(400).json({ 
        message: 'A client profile with this corporate email gateway already exists.' 
      });
    }

    // 2. Provision the client user document
    const newClient = new User({
      name: finalName,
      email: finalEmail,
      password: finalPassword, // Model pre-save hook automatically hashes this securely
      role: 'client',
      requiresPasswordReset: true,
      isVerified: true
    });
    const savedClient = await newClient.save();

    // 3. Create the architectural project mapping
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

export default router;