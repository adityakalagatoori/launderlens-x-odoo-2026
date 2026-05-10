import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();

// GET /stats - Overview stats for admin dashboard
router.get('/stats', async (req: any, res: any, next: any) => {
  try {
    const [userCount, tripCount, cityCount, activityCount, expenseCount, noteCount] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.city.count(),
      prisma.activity.count(),
      prisma.expense.count(),
      prisma.note.count(),
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
        counts: { users: userCount, trips: tripCount, cities: cityCount, activities: activityCount, expenses: expenseCount, notes: noteCount },
        totals: { totalBudget: totalBudget._sum.budget || 0, totalExpenses: totalExpenses._sum.amount || 0 },
        recentUsers, recentTrips, recentExpenses
      }
    });
  } catch (error) { next(error); }
});

// GET /users - List all users
router.get('/users', async (req: any, res: any, next: any) => {
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

// GET /trips - List all trips across all users
router.get('/trips', async (req: any, res: any, next: any) => {
  try {
    const trips = await prisma.trip.findMany({
      include: { owner: { select: { name: true, email: true } }, _count: { select: { expenses: true, notes: true, itinerary: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: trips });
  } catch (error) { next(error); }
});

// GET /expenses - List all expenses
router.get('/expenses', async (req: any, res: any, next: any) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: { user: { select: { name: true } }, trip: { select: { name: true } } },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: expenses });
  } catch (error) { next(error); }
});

// DELETE /users/:id - Delete a user (admin action)
router.delete('/users/:id', async (req: any, res: any, next: any) => {
  try {
    await prisma.user.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
});

export default router;
