import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get activities with filters
router.get('/', async (req, res, next) => {
  try {
    const { cityId, category, maxCost } = req.query;
    
    const where: any = {};
    if (cityId) where.cityId = String(cityId);
    if (category) where.category = String(category);
    if (maxCost) where.cost = { lte: parseFloat(String(maxCost)) };

    const activities = await prisma.activity.findMany({
      where,
      include: {
        city: true
      }
    });

    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
});

// Detour Roulette
router.get('/detour-roulette', async (req, res, next) => {
  try {
    const { cityId, budget } = req.query;
    
    const where: any = {};
    if (cityId) where.cityId = String(cityId);
    if (budget) where.cost = { lte: parseFloat(String(budget)) };
    
    const activities = await prisma.activity.findMany({ where });
    
    if (activities.length === 0) {
      return res.status(404).json({ success: false, message: 'No detours found' });
    }
    
    // Pick a random activity
    const randomIndex = Math.floor(Math.random() * activities.length);
    const detour = activities[randomIndex];
    
    res.json({ success: true, data: detour });
  } catch (error) {
    next(error);
  }
});

// Get single activity
router.get('/:id', async (req, res, next) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: {
        city: true
      }
    });
    
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    
    res.json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
});

export default router;
