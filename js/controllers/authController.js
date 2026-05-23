const { User } = require('../models/User.js');
const jwt = require('jsonwebtoken');

const generateToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });

  // Detect production environment (Vercel or NODE_ENV=production)
  const isVercel = !!process.env.VERCEL || process.env.VERCEL_ENV === 'production';
  const isProduction = process.env.NODE_ENV === 'production' || isVercel;

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction, // HTTPS required in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' requires secure=true
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    path: '/', // Cookie available on all paths
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      generateToken(user._id.toString(), res);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      generateToken(user._id.toString(), res);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const logoutUser = (req, res) => {
  // Detect production environment for consistent cookie clearing
  const isVercel = !!process.env.VERCEL || process.env.VERCEL_ENV === 'production';
  const isProduction = process.env.NODE_ENV === 'production' || isVercel;

  // Clear JWT cookie by setting expiration to Unix epoch
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0), // Unix epoch (1970-01-01)
    path: '/',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getMe };