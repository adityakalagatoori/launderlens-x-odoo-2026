import { Router } from 'express';
import { prisma } from '../lib/prisma';
const router = Router();

// GET / - Search/list cities
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const { q, region, cost, visa } = req.query;
    const where: any = {};
    if (q) where.name = { contains: String(q) };
    if (region) where.region = String(region);
    if (cost) where.costLevel = parseInt(String(cost));
    if (visa === 'false') where.visaRequired = false;

    const cities = await prisma.city.findMany({ 
      where, 
      select: {
        id: true, name: true, country: true, region: true, description: true,
        costLevel: true, rating: true, climate: true, coverImage: true, safetyScore: true,
        bestTimeToVisit: true, visaRequired: true, currency: true, population: true,
        seasonalAlerts: true, highTrafficMonths: true,
        _count: { select: { activities: true } },
        activities: { take: 3, select: { id: true, name: true, category: true, cost: true, imageUrl: true, rating: true } }
      },
      take: 50
    });
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json({ success: true, data: cities });
  } catch (error) { next(error); }
});

// GET /compare?ids=a,b,c
router.get('/compare', async (req: any, res: any, next: any) => {
  try {
    const ids = (String(req.query.ids || '')).split(',').filter(Boolean);
    const cities = await prisma.city.findMany({ where: { id: { in: ids } }, include: { _count: { select: { activities: true } } } });
    res.json({ success: true, data: cities });
  } catch (error) { next(error); }
});

// GET /:id
router.get('/:id', async (req: any, res: any, next: any) => {
  try {
    const city = await prisma.city.findUnique({
      where: { id: String(req.params.id) },
      include: { activities: true, safetyAlerts: true }
    });
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });
    res.json({ success: true, data: city });
  } catch (error) { next(error); }
});

// GET /:id/safety
router.get('/:id/safety', async (req: any, res: any, next: any) => {
  try {
    const city = await prisma.city.findUnique({ where: { id: String(req.params.id) }, select: { safetyScore: true, name: true } });
    const alerts = await prisma.safetyAlert.findMany({ where: { cityId: String(req.params.id) } });
    res.json({ success: true, data: { city, alerts } });
  } catch (error) { next(error); }
});

// GET /:id/reviews
router.get('/:id/reviews', async (req: any, res: any, next: any) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { targetId: String(req.params.id), targetType: 'city' },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: reviews });
  } catch (error) { next(error); }
});

// POST /:id/reviews
router.post('/:id/reviews', async (req: any, res: any, next: any) => {
  try {
    const { userId, rating, body } = req.body;
    const review = await prisma.review.create({
      data: { userId, targetId: String(req.params.id), targetType: 'city', rating: parseFloat(rating), body }
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) { next(error); }
});

export default router;
