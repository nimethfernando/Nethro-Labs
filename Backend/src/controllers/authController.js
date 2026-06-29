import jwt from 'jsonwebtoken';
import User from '../models/User.js';




const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};




const sendTokenResponse = (user, statusCode, res) => {
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
  });
};




export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;


    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }


    const user = await User.create({ name, email, password, role });
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


    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};