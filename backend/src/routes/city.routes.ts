import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all cities with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { q, region, cost } = req.query;
    
    const where: any = {};
    if (q) where.name = { contains: String(q) };
    if (region) where.region = String(region);
    if (cost) where.costLevel = parseInt(String(cost));

    const cities = await prisma.city.findMany({
      where,
      include: {
        activities: {
          take: 3
        }
      }
    });

    res.json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
});

// Get single city
router.get('/:id', async (req, res, next) => {
  try {
    const city = await prisma.city.findUnique({
      where: { id: req.params.id },
      include: {
        activities: true
      }
    });
    
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }
    
    res.json({ success: true, data: city });
  } catch (error) {
    next(error);
  }
});

// Compare cities
router.get('/compare/ids', async (req, res, next) => {
  try {
    const { ids } = req.query;
    if (!ids || typeof ids !== 'string') {
      return res.status(400).json({ success: false, message: 'Must provide comma-separated ids' });
    }
    
    const idArray = ids.split(',');
    const cities = await prisma.city.findMany({
      where: { id: { in: idArray } }
    });
    
    res.json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
});

export default router;
