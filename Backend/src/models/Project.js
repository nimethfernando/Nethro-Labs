import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clusterName: {
    type: String,
    required: true,
    trim: true,
    default: 'Default Cluster'
  },
  description: {
    type: String,
    trim: true,
    default: 'No description provided.'
  },
  budget: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// ✅ Compile and export cleanly as a Mongoose Model
const Project = mongoose.model('Project', projectSchema);
export default Project;