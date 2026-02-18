import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { AuditService } from '../services/auditService';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  UserProfileResponse,
  ErrorResponse,
} from '../../../shared/types';

const router = express.Router();

// Create a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    // Log the event (no workspace yet)
    await AuditService.logEvent(
      'user_registered',
      user._id.toString(),
      '', // no workspace
      user._id.toString(),
      'user',
      { email }
    );

    res.status(201).json({ userId: user._id, message: 'User created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response<LoginResponse | ErrorResponse>) => {
  try {
    const { email, password }: LoginRequest = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      const errorResponse: ErrorResponse = { error: 'Invalid credentials' };
      return res.status(401).json(errorResponse);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    // Log the event
    await AuditService.logEvent(
      'user_logged_in',
      user._id.toString(),
      '', // no specific workspace
      user._id.toString(),
      'user',
      {}
    );

    const response: LoginResponse = { token, user: { id: user._id.toString(), name: user.name, email: user.email } };
    res.json(response);
  } catch (error) {
    const errorResponse: ErrorResponse = { error: 'Login failed' };
    res.status(500).json(errorResponse);
  }
});

// Get user profile
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    if ((req as any).user._id.toString() !== req.params.id && (req as any).user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
