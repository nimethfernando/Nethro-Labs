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
    },
    ...extraFields,
  });
};

// Admin uses this endpoint to register new clients with a temporary common password
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Admins creating users will default 'isFirstLogin' to true
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: role || 'client',
      isFirstLogin: true 
    });
    
    sendTokenResponse(user, 211, res);
  } catch (error) {
    next(error);
  }
};

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

    // Intercept login if it's the client's first time using the temporary password
    if (user.role === 'client' && user.isFirstLogin) {
      return res.status(200).json({
        success: true,
        requiresPasswordReset: true,
        message: 'First time login detected. Password modification required.',
        token: signToken(user._id, user.role), // Temporary token to access setup route
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Client uses this endpoint to finalize account initialization
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

    // Update password and drop the first time login flag
    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();

    sendTokenResponse(user, 200, res, { message: 'Password initialized successfully.' });
  } catch (error) {
    next(error);
  }
};