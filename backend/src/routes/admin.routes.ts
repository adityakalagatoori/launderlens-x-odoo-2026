import { Router } from 'express';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';
const router = Router();

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@traveloop.com';
const ADMIN_PASSWORD_HASH = crypto.createHash('sha256').update('admin@2026').digest('hex');

// POST /login - Admin login with hardcoded credentials
router.post('/login', async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (email !== ADMIN_EMAIL || passwordHash !== ADMIN_PASSWORD_HASH) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ role: 'ADMIN', email: ADMIN_EMAIL }, process.env.JWT_SECRET || 'traveloop-secret-key', { expiresIn: '8h' });

    res.json({
      success: true,
      data: { token, admin: { email: ADMIN_EMAIL, name: 'System Administrator' } }
    });
  } catch (error) { next(error); }
});

// Middleware to verify admin token
function requireAdmin(req: any, res: any, next: any) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ success: false, message: 'Admin authentication required' });
    
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET || 'traveloop-secret-key');
    
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access only' });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
}

// GET /stats - Overview stats for admin dashboard (protected)
router.get('/stats', requireAdmin, async (req: any, res: any, next: any) => {
  try {
    const [userCount, tripCount, cityCount, activityCount, expenseCount, noteCount, guideCount, postCount] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.city.count(),
      prisma.activity.count(),
      prisma.expense.count(),
      prisma.note.count(),
      prisma.touristGuide.count(),
      prisma.communityPost.count(),
    ]);

    // Recent activity
    const recentUsers = await prisma.user.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, createdAt: true, role: true } });
    const recentTrips = await prisma.trip.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { owner: { select: { name: true, email: true } } } });
    const recentExpenses = await prisma.expense.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } }, trip: { select: { name: true } } } });

    // Budget totals
    const totalBudget = await prisma.trip.aggregate({ _sum: { budget: true } });
    const totalExpenses = await prisma.expense.aggregate({ _sum: { amount: true } });

    res.json({
      success: true,
      data: {
        counts: { users: userCount, trips: tripCount, cities: cityCount, activities: activityCount, expenses: expenseCount, notes: noteCount, guides: guideCount, posts: postCount },
        totals: { totalBudget: totalBudget._sum.budget || 0, totalExpenses: totalExpenses._sum.amount || 0 },
        recentUsers, recentTrips, recentExpenses
      }
    });
  } catch (error) { next(error); }
});

// GET /users - List all users (protected)
router.get('/users', requireAdmin, async (req: any, res: any, next: any) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, country: true, travelStyle: true, createdAt: true,
        _count: { select: { trips: true, expenses: true, notes: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: users });
  } catch (error) { next(error); }
});

// GET /trips - List all trips across all users (protected)
router.get('/trips', requireAdmin, async (req: any, res: any, next: any) => {
  try {
    const trips = await prisma.trip.findMany({
      include: { owner: { select: { name: true, email: true } }, _count: { select: { expenses: true, notes: true, itinerary: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: trips });
  } catch (error) { next(error); }
});

// GET /expenses - List all expenses (protected)
router.get('/expenses', requireAdmin, async (req: any, res: any, next: any) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: { user: { select: { name: true } }, trip: { select: { name: true } } },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: expenses });
  } catch (error) { next(error); }
});

// GET /guides - List all guides (protected)
router.get('/guides', requireAdmin, async (req: any, res: any, next: any) => {
  try {
    const guides = await prisma.touristGuide.findMany({
      include: { city: { select: { name: true, country: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: guides });
  } catch (error) { next(error); }
});

// DELETE /users/:id - Delete a user (protected)
router.delete('/users/:id', requireAdmin, async (req: any, res: any, next: any) => {
  try {
    await prisma.user.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
});

export default router;
