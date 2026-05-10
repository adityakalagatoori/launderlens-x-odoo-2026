import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// POST /register - Create a real account
router.post('/register', async (req: any, res: any, next: any) => {
  try {
    const { email, phone, name, password } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or phone is required' });
    }

    // Check existing
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) return res.status(409).json({ success: false, message: 'Phone already registered' });
    }

    // Simple password hash (for prototype; use bcrypt in production)
    const passwordHash = password ? crypto.createHash('sha256').update(password).digest('hex') : undefined;

    const user = await prisma.user.create({
      data: { email, phone, name, passwordHash }
    });

    // Auto-generate tokens
    const jwt = require('jsonwebtoken');
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'traveloop-secret-key', { expiresIn: '24h' });
    const refreshToken = crypto.randomBytes(40).toString('hex');

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.status(201).json({
      success: true,
      data: { user: { id: user.id, email: user.email, phone: user.phone, name: user.name }, accessToken }
    });
  } catch (error) {
    next(error);
  }
});

// POST /login - Login with email+password
router.post('/login', async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.passwordHash !== passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const jwt = require('jsonwebtoken');
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'traveloop-secret-key', { expiresIn: '24h' });
    const refreshToken = crypto.randomBytes(40).toString('hex');

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.json({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name }, accessToken }
    });
  } catch (error) {
    next(error);
  }
});

// GET /me - Get current user profile
router.get('/me', async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const token = authHeader.replace('Bearer ', '');
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'traveloop-secret-key');

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, phone: true, name: true, avatar: true, bio: true, country: true, travelStyle: true, role: true, createdAt: true }
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// PATCH /me - Update profile
router.patch('/me', async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const token = authHeader.replace('Bearer ', '');
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'traveloop-secret-key');

    const { name, bio, country, travelStyle, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { name, bio, country, travelStyle, avatar },
      select: { id: true, email: true, name: true, bio: true, country: true, travelStyle: true, avatar: true }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Magic link endpoint (kept for compatibility)
router.post('/magic-link', async (req: any, res: any) => {
  const { email } = req.body;
  const magicToken = crypto.randomBytes(32).toString('hex');
  const magicExpires = new Date(Date.now() + 15 * 60 * 1000);

  try {
    await prisma.user.upsert({
      where: { email },
      update: { magicToken, magicExpires },
      create: { email, magicToken, magicExpires }
    });

    const magicUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify?token=${magicToken}`;
    console.log('DEBUG: Magic Link URL:', magicUrl);

    res.status(200).json({ success: true, message: 'Magic link sent to your email.', debug_link: magicUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send magic link' });
  }
});

// OTP request (demo fallback)
router.post('/otp/request', async (req: any, res: any) => {
  const { phone } = req.body;
  console.log('DEBUG: OTP requested for:', phone);
  res.status(200).json({ success: true, message: 'OTP sent (Demo: use any 6-digit code)' });
});

// OTP verify (demo - accepts any code)
router.post('/otp/verify', async (req: any, res: any, next: any) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ success: false, message: 'Phone and code required' });

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({ data: { phone } });
    }

    const jwt = require('jsonwebtoken');
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'traveloop-secret-key', { expiresIn: '24h' });

    res.json({ success: true, data: { user: { id: user.id, phone: user.phone, name: user.name }, accessToken } });
  } catch (error) {
    next(error);
  }
});

export default router;
