import { Router } from 'express';
import { prisma } from '../lib/prisma';
const router = Router();

// GET / - Search activities
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const { cityId, category, maxCost } = req.query;
    const where: any = {};
    if (cityId) where.cityId = String(cityId);
    if (category) where.category = String(category);
    if (maxCost) where.cost = { lte: parseFloat(String(maxCost)) };

    const activities = await prisma.activity.findMany({ where, include: { city: true } });
    res.json({ success: true, data: activities });
  } catch (error) { next(error); }
});

// GET /detour-roulette
router.get('/detour-roulette', async (req: any, res: any, next: any) => {
  try {
    const { cityId, budget } = req.query;
    const where: any = {};
    if (cityId) where.cityId = String(cityId);
    if (budget) where.cost = { lte: parseFloat(String(budget)) };

    const activities = await prisma.activity.findMany({ where });
    if (activities.length === 0) return res.status(404).json({ success: false, message: 'No detours found' });

    const detour = activities[Math.floor(Math.random() * activities.length)];
    res.json({ success: true, data: detour });
  } catch (error) { next(error); }
});

// GET /:id
router.get('/:id', async (req: any, res: any, next: any) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: String(req.params.id) },
      include: { city: true }
    });
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.json({ success: true, data: activity });
  } catch (error) { next(error); }
});

export default router;
