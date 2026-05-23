import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const protect = async (req: any, res: any, next: any) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
