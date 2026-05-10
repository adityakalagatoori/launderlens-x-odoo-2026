import { Router } from 'express';
import { prisma } from '../lib/prisma';
const router = Router();

function getUserId(req: any): string | null {
  try {
    const auth = req.headers.authorization;
    if (!auth) return null;
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET || 'traveloop-secret-key');
    return decoded.userId;
  } catch { return null; }
}

// GET / - Get all wishlisted items (Cities & Activities)
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req) || req.query.userId as string;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const [cityWishlists, activityWishlists] = await Promise.all([
      prisma.cityWishlist.findMany({
        where: { userId },
        include: { city: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.wishlist.findMany({
        where: { userId },
        include: { activity: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({ 
      success: true, 
      data: [...cityWishlists, ...activityWishlists] 
    });
  } catch (error) { next(error); }
});

// POST /city/:cityId - Add/Remove city from wishlist
router.post('/city/:cityId', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const existing = await prisma.cityWishlist.findUnique({
      where: { userId_cityId: { userId, cityId: req.params.cityId } }
    });

    if (existing) {
      await prisma.cityWishlist.delete({ where: { id: existing.id } });
      return res.json({ success: true, wishlisted: false, message: 'Removed city from wishlist' });
    }

    const wishlist = await prisma.cityWishlist.create({
      data: { userId, cityId: req.params.cityId },
      include: { city: true }
    });
    res.status(201).json({ success: true, wishlisted: true, data: wishlist });
  } catch (error) { next(error); }
});

// POST /activity/:activityId - Add/Remove activity from wishlist
router.post('/activity/:activityId', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const existing = await prisma.wishlist.findUnique({
      where: { userId_activityId: { userId, activityId: req.params.activityId } }
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ success: true, wishlisted: false, message: 'Removed activity from wishlist' });
    }

    const wishlist = await prisma.wishlist.create({
      data: { userId, activityId: req.params.activityId },
      include: { activity: true }
    });
    res.status(201).json({ success: true, wishlisted: true, data: wishlist });
  } catch (error) { next(error); }
});

// GET /check/:cityId - Legacy check for city
router.get('/check/:cityId', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.json({ success: true, wishlisted: false });

    const existing = await prisma.cityWishlist.findUnique({
      where: { userId_cityId: { userId, cityId: req.params.cityId } }
    });
    res.json({ success: true, wishlisted: !!existing });
  } catch (error) { next(error); }
});

export default router;
