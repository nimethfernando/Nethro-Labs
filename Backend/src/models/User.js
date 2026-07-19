import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'client'], // 🔥 Added 'client' to fix the validation crash
    default: 'client',
  },
  requiresPasswordReset: {
    type: Boolean,
    default: true, // 🔥 Automatically flags new accounts for a mandatory first-login password change
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Async pre-save hook for password hashing (Modern Promise Style)
userSchema.pre('save', async function () {
  // If the password hasn't been updated, exit early by simply returning.
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // 💡 CRITICAL FIX: In async hooks, do not accept or call next(). 
    // Simply letting the function complete successfully resolves the internal Mongoose promise.
  } catch (error) {
    // Throwing an error safely rejects the internal promise and halts the save lifecycle.
    throw new Error(error.message || error);
  }
});

// Password comparison method
userSchema.methods.matchPasswords = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;