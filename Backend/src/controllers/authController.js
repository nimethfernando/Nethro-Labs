import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const sendTokenResponse = (user, statusCode, res, extraFields = {}) => {
  const token = signToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isFirstLogin: user.isFirstLogin,
    },
    ...extraFields,
  });
};

// Admin endpoint to register new users/clients
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // New users default to isFirstLogin: true
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'client',
      isFirstLogin: true,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login endpoint
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPasswords(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Intercept login if first-time user needs a password reset
    if (user.isFirstLogin) {
      return res.status(200).json({
        success: true,
        requiresPasswordReset: true,
        message: 'First time login detected. Password modification required.',
        token: signToken(user._id, user.role), // Token supplied to authorize setup-password route
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isFirstLogin: user.isFirstLogin,
        },
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Endpoint for setting initial new password
export const setupInitialPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Please provide a valid password (min 6 characters)' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update password and clear first login flag
    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();

    sendTokenResponse(user, 200, res, { message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};