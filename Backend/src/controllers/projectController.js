import Project from '../models/Project.js';

// Update project details
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and update the project, returning the updated document
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};