import { User } from '../models/User';
import jwt from 'jsonwebtoken';

const generateToken = (id: string, res: any) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, 
  });
};

export const registerUser = async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user: any = await User.create({
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
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const user: any = await User.findOne({ email });

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
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const logoutUser = (req: any, res: any) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: any, res: any) => {
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
};
