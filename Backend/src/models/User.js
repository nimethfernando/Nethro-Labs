import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:         { type: String, required: true, minlength: 8, select: false },
  role:             { type: String, enum: ['client', 'admin', 'staff'], default: 'client' },
  company:          { type: String, trim: true },
  phone:            { type: String, trim: true },
  avatar:           { type: String },
  isActive:         { type: Boolean, default: true },
  isEmailVerified:  { type: Boolean, default: false },
  emailVerifyToken: { type: String, select: false },
  resetPasswordToken:   { type: String, select: false },
  resetPasswordExpires: { type: Date,   select: false },
  refreshToken:     { type: String, select: false },
  lastLogin:        { type: Date },
  notificationPrefs: {
    email:    { type: Boolean, default: true },
    tickets:  { type: Boolean, default: true },
    invoices: { type: Boolean, default: true },
    projects: { type: Boolean, default: true },
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; delete obj.refreshToken;
  delete obj.emailVerifyToken; delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

export default mongoose.model('User', userSchema);
