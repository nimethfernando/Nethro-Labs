import crypto from 'crypto';
import User from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js';
import { success, error } from '../utils/apiResponse.js';

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;

    if (await User.findOne({ email }))
      return error(res, 'Email already registered', 409);

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name, email, password, company, phone,
      emailVerifyToken: crypto.createHash('sha256').update(verifyToken).digest('hex'),
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
    await sendWelcomeEmail(user, verifyUrl).catch(console.error);

    const accessToken  = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, cookieOpts);
    return success(res, { user, accessToken }, 'Registration successful. Check your email to verify.', 201);
  } catch (err) {
    console.error(err);
    return error(res, err.message);
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +refreshToken');

    if (!user || !(await user.matchPassword(password)))
      return error(res, 'Invalid email or password', 401);

    if (!user.isActive)
      return error(res, 'Account has been deactivated. Contact support.', 403);

    user.lastLogin = new Date();
    const refreshToken = signRefreshToken(user._id);
    user.refreshToken  = refreshToken;
    await user.save({ validateBeforeSave: false });

    const accessToken = signAccessToken(user._id, user.role);
    res.cookie('refreshToken', refreshToken, cookieOpts);
    return success(res, { user, accessToken }, 'Login successful');
  } catch (err) {
    return error(res, err.message);
  }
};

// POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) return error(res, 'No refresh token', 401);

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token)
      return error(res, 'Invalid or expired refresh token', 401);

    const accessToken      = signAccessToken(user._id, user.role);
    const newRefreshToken  = signRefreshToken(user._id);
    user.refreshToken      = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken, cookieOpts);
    return success(res, { accessToken }, 'Token refreshed');
  } catch (err) {
    return error(res, 'Invalid or expired refresh token', 401);
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.clearCookie('refreshToken');
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  return success(res, req.user);
};

// PUT /api/auth/me
export const updateMe = async (req, res) => {
  try {
    const allowed = ['name', 'company', 'phone', 'notificationPrefs'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    return success(res, user, 'Profile updated');
  } catch (err) {
    return error(res, err.message);
  }
};

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword)))
      return error(res, 'Current password is incorrect', 400);

    user.password = newPassword;
    await user.save();
    return success(res, null, 'Password changed successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // Always respond the same to prevent email enumeration
    if (!user) return success(res, null, 'If that email exists, a reset link has been sent.');

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user, resetUrl).catch(console.error);

    return success(res, null, 'If that email exists, a reset link has been sent.');
  } catch (err) {
    return error(res, err.message);
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken:   hashed,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) return error(res, 'Reset token is invalid or has expired', 400);

    user.password             = req.body.password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return success(res, null, 'Password reset successful. You can now log in.');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ emailVerifyToken: hashed }).select('+emailVerifyToken');

    if (!user) return error(res, 'Invalid or expired verification link', 400);

    user.isEmailVerified  = true;
    user.emailVerifyToken = undefined;
    await user.save({ validateBeforeSave: false });

    return success(res, null, 'Email verified successfully');
  } catch (err) {
    return error(res, err.message);
  }
};
