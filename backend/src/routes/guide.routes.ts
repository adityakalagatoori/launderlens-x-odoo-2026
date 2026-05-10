import { Router } from 'express';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';
const router = Router();

// POST /register - Register a new guide
router.post('/register', async (req: any, res: any, next: any) => {
  try {
    const { name, email, phone, password, cityId, languages, ratePerDay, experience, bio, specialties } = req.body;
    if (!email || !password || !name || !cityId) {
      return res.status(400).json({ success: false, message: 'Name, email, password and city are required' });
    }

    const existing = await prisma.touristGuide.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered as a guide' });

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const guide = await prisma.touristGuide.create({
      data: {
        name, email, phone, passwordHash, cityId,
        languages: JSON.stringify(languages || []),
        ratePerDay: parseFloat(ratePerDay || 0),
        experience: parseInt(experience || 0),
        bio, specialties
      },
      include: { city: true }
    });

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ guideId: guide.id, role: 'GUIDE' }, process.env.JWT_SECRET || 'traveloop-secret-key', { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      data: { guide: { id: guide.id, name: guide.name, email: guide.email, city: guide.city }, token }
    });
  } catch (error) { next(error); }
});

// POST /login - Guide login
router.post('/login', async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const guide = await prisma.touristGuide.findUnique({ where: { email }, include: { city: true } });

    if (!guide || guide.passwordHash !== passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ guideId: guide.id, role: 'GUIDE' }, process.env.JWT_SECRET || 'traveloop-secret-key', { expiresIn: '24h' });

    res.json({
      success: true,
      data: { guide: { id: guide.id, name: guide.name, email: guide.email, city: guide.city, rating: guide.rating, experience: guide.experience }, token }
    });
  } catch (error) { next(error); }
});

// GET /me - Get guide profile
router.get('/me', async (req: any, res: any, next: any) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET || 'traveloop-secret-key');
    if (!decoded.guideId) return res.status(401).json({ success: false, message: 'Not a guide token' });

    const guide = await prisma.touristGuide.findUnique({
      where: { id: decoded.guideId },
      include: { city: true, bookings: { include: { trip: true, user: { select: { name: true, email: true } } } } }
    });
    if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
    res.json({ success: true, data: guide });
  } catch (error) { next(error); }
});

// PATCH /me - Update guide profile
router.patch('/me', async (req: any, res: any, next: any) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET || 'traveloop-secret-key');
    if (!decoded.guideId) return res.status(401).json({ success: false, message: 'Not a guide token' });

    const { name, phone, bio, languages, ratePerDay, experience, specialties, avatar, cityId } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (bio !== undefined) data.bio = bio;
    if (languages) data.languages = JSON.stringify(languages);
    if (ratePerDay !== undefined) data.ratePerDay = parseFloat(ratePerDay);
    if (experience !== undefined) data.experience = parseInt(experience);
    if (specialties !== undefined) data.specialties = specialties;
    if (avatar !== undefined) data.avatar = avatar;
    if (cityId !== undefined) data.cityId = cityId;

    const guide = await prisma.touristGuide.update({
      where: { id: decoded.guideId },
      data,
      include: { city: true }
    });
    res.json({ success: true, data: guide });
  } catch (error) { next(error); }
});

// GET /city/:cityId - Get all guides for a city
router.get('/city/:cityId', async (req: any, res: any, next: any) => {
  try {
    const guides = await prisma.touristGuide.findMany({
      where: { cityId: req.params.cityId },
      select: {
        id: true, name: true, email: true, phone: true, languages: true,
        ratePerDay: true, experience: true, bio: true, avatar: true,
        rating: true, specialties: true, isVerified: true,
        city: { select: { name: true, country: true } }
      }
    });
    res.json({ success: true, data: guides });
  } catch (error) { next(error); }
});

// GET / - List all guides
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const guides = await prisma.touristGuide.findMany({
      select: {
        id: true, name: true, email: true, phone: true, languages: true,
        ratePerDay: true, experience: true, bio: true, avatar: true,
        rating: true, specialties: true, isVerified: true,
        city: { select: { id: true, name: true, country: true } }
      }
    });
    res.json({ success: true, data: guides });
  } catch (error) { next(error); }
});

// POST /book - Book a guide for a trip
router.post('/book', async (req: any, res: any, next: any) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET || 'traveloop-secret-key');

    const { tripId, guideId } = req.body;
    const booking = await prisma.guideTripBooking.create({
      data: { tripId, guideId, userId: decoded.userId },
      include: { guide: { select: { name: true, email: true, phone: true } }, trip: { select: { name: true } } }
    });
    res.status(201).json({ success: true, data: booking });
  } catch (error) { next(error); }
});

// PATCH /booking/:id/status - Update booking status (for guides)
router.patch('/booking/:id/status', async (req: any, res: any, next: any) => {
  try {
    const { status, message } = req.body;
    const data: any = { status };
    if (message !== undefined) data.message = message;

    const booking = await prisma.guideTripBooking.update({
      where: { id: req.params.id },
      data,
      include: { guide: true, trip: true, user: { select: { name: true, email: true } } }
    });
    res.json({ success: true, data: booking });
  } catch (error) { next(error); }
});

// GET /bookings/:tripId - Get bookings for a trip
router.get('/bookings/:tripId', async (req: any, res: any, next: any) => {
  try {
    const bookings = await prisma.guideTripBooking.findMany({
      where: { tripId: req.params.tripId },
      include: {
        guide: { select: { id: true, name: true, email: true, phone: true, rating: true, ratePerDay: true, specialties: true, avatar: true, city: true } },
        user: { select: { name: true } }
      }
    });
    res.json({ success: true, data: bookings });
  } catch (error) { next(error); }
});

export default router;
