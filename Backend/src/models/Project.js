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
  },

  // --- Web Development Deployment Links ---
  stagingUrl: {
    type: String,
    trim: true,
    default: ''
  },
  liveUrl: {
    type: String,
    trim: true,
    default: ''
  },

  // --- Website Build Lifecycle & Tracking ---
  status: {
    type: String,
    enum: [
      'Requirement Analysis',
      'UI/UX Design',
      'In Development',
      'QA & Testing',
      'Deployed / Live',
      'Maintenance'
    ],
    default: 'Requirement Analysis'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, { 
  timestamps: true 
});

// ✅ Compile and export cleanly as a Mongoose Model
const Project = mongoose.model('Project', projectSchema);
export default Project;