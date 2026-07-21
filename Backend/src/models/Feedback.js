import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: { type: String, required: true },
  attachments: [{ type: String }], // Optional image/screenshot links
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);