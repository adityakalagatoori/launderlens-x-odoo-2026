import { Router } from 'express';
import { prisma } from '../lib/prisma';
const router = Router();

// Helper to extract userId from JWT
function getUserId(req: any): string | null {
  try {
    const auth = req.headers.authorization;
    if (!auth) return null;
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET || 'traveloop-secret-key');
    return decoded.userId;
  } catch { return null; }
}

// GET / - List trips for authenticated user
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req) || (req.query.userId as string);
    const where: any = {};
    if (userId) where.ownerId = userId;

    const trips = await prisma.trip.findMany({
      where,
      select: {
        id: true, name: true, description: true, startDate: true, endDate: true,
        coverPhoto: true, tripType: true, budget: true, currency: true, visibility: true,
        tripMode: true, lookingForBuddy: true, createdAt: true,
        _count: { select: { expenses: true, notes: true } }
      },
      orderBy: { startDate: 'desc' },
      take: 100
    });
    res.json({ success: true, data: trips });
  } catch (error) { next(error); }
});

// POST / - Create trip
router.post('/', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    const { name, description, startDate, endDate, tripType, budget, currency, timezone, visibility, tags, tripMode, lookingForBuddy } = req.body;

    const ownerId = userId || req.body.ownerId;
    if (!ownerId) return res.status(400).json({ success: false, message: 'Authentication required' });

    const trip = await prisma.trip.create({
      data: {
        name, description,
        startDate: new Date(startDate), endDate: new Date(endDate),
        tripType: tripType || 'Leisure', budget: parseFloat(budget || 0),
        currency: currency || 'USD', timezone: timezone || 'UTC',
        visibility: visibility || 'PRIVATE', tags: JSON.stringify(tags || []),
        tripMode: tripMode || 'solo',
        lookingForBuddy: lookingForBuddy || false,
        ownerId
      }
    });

    // Create default budget categories
    const defaultCats = ['Accommodation', 'Transport', 'Food', 'Activities', 'Shopping', 'Other'];
    for (const label of defaultCats) {
      await prisma.budgetCategory.create({ data: { tripId: trip.id, label, allocated: 0, spent: 0 } });
    }

    res.status(201).json({ success: true, data: trip });
  } catch (error) { next(error); }
});

// GET /:id
router.get('/:id', async (req: any, res: any, next: any) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        companions: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        itinerary: { include: { city: true, activities: { include: { activity: true } } }, orderBy: { order: 'asc' } },
        budgetCats: true,
        expenses: { orderBy: { date: 'desc' } },
        packingLists: { include: { items: true } },
        notes: { orderBy: { createdAt: 'desc' } },
        carbonEmissions: true,
        guideBookings: { include: { guide: { select: { id: true, name: true, phone: true, avatar: true } } } }
      }
    });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, data: trip });
  } catch (error) { next(error); }
});

// PATCH /:id
router.patch('/:id', async (req: any, res: any, next: any) => {
  try {
    const { name, description, startDate, endDate, budget, visibility } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (startDate) data.startDate = new Date(startDate);
    if (endDate) data.endDate = new Date(endDate);
    if (budget !== undefined) data.budget = parseFloat(budget);
    if (visibility) data.visibility = visibility;

    const trip = await prisma.trip.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: trip });
  } catch (error) { next(error); }
});

// DELETE /:id
router.delete('/:id', async (req: any, res: any, next: any) => {
  try {
    await prisma.trip.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Trip deleted' });
  } catch (error) { next(error); }
});

// ── ITINERARY STOPS ──
router.post('/:tripId/stops', async (req: any, res: any, next: any) => {
  try {
    const { cityId, daysCount, notes } = req.body;
    const count = await prisma.itineraryStop.count({ where: { tripId: req.params.tripId } });
    const stop = await prisma.itineraryStop.create({
      data: { tripId: req.params.tripId, cityId, order: count + 1, daysCount: daysCount || 1, notes },
      include: { city: true }
    });
    res.status(201).json({ success: true, data: stop });
  } catch (error) { next(error); }
});

router.delete('/:tripId/stops/:stopId', async (req: any, res: any, next: any) => {
  try {
    await prisma.itineraryStop.delete({ where: { id: req.params.stopId } });
    res.json({ success: true, message: 'Stop removed' });
  } catch (error) { next(error); }
});

// ── ITINERARY ACTIVITIES ──
router.post('/:tripId/stops/:stopId/activities', async (req: any, res: any, next: any) => {
  try {
    const { activityId, day, timeStart, timeEnd, notes } = req.body;
    const act = await prisma.itineraryActivity.create({
      data: { stopId: req.params.stopId, activityId, day: day || 1, timeStart, timeEnd, notes },
      include: { activity: true }
    });
    res.status(201).json({ success: true, data: act });
  } catch (error) { next(error); }
});

router.delete('/:tripId/stops/:stopId/activities/:actId', async (req: any, res: any, next: any) => {
  try {
    await prisma.itineraryActivity.delete({ where: { id: req.params.actId } });
    res.json({ success: true, message: 'Activity removed from itinerary' });
  } catch (error) { next(error); }
});

// ── EXPENSES ──
router.get('/:tripId/expenses', async (req: any, res: any, next: any) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { tripId: req.params.tripId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' }
    });
    const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    res.json({ success: true, data: { expenses, total } });
  } catch (error) { next(error); }
});

router.post('/:tripId/expenses', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req) || req.body.userId;
    const { amount, currency, category, description, date } = req.body;
    const expense = await prisma.expense.create({
      data: {
        tripId: req.params.tripId, userId,
        amount: parseFloat(amount), currency: currency || 'USD',
        category, description, date: date ? new Date(date) : new Date()
      }
    });

    // Update budget category spent
    const cat = await prisma.budgetCategory.findFirst({ where: { tripId: req.params.tripId, label: category } });
    if (cat) {
      await prisma.budgetCategory.update({ where: { id: cat.id }, data: { spent: { increment: parseFloat(amount) } } });
    }

    res.status(201).json({ success: true, data: expense });
  } catch (error) { next(error); }
});

router.delete('/:tripId/expenses/:expId', async (req: any, res: any, next: any) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.expId } });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) { next(error); }
});

// ── BUDGET CATEGORIES ──
router.get('/:tripId/budget', async (req: any, res: any, next: any) => {
  try {
    const cats = await prisma.budgetCategory.findMany({ where: { tripId: req.params.tripId } });
    const trip = await prisma.trip.findUnique({ where: { id: req.params.tripId }, select: { budget: true, currency: true } });
    const totalSpent = cats.reduce((s: number, c: any) => s + c.spent, 0);
    res.json({ success: true, data: { categories: cats, totalBudget: trip?.budget || 0, totalSpent, currency: trip?.currency || 'USD' } });
  } catch (error) { next(error); }
});

router.patch('/:tripId/budget', async (req: any, res: any, next: any) => {
  try {
    const { categories } = req.body;
    for (const cat of categories) {
      await prisma.budgetCategory.update({ where: { id: cat.id }, data: { allocated: cat.allocated } });
    }
    res.json({ success: true, message: 'Budget updated' });
  } catch (error) { next(error); }
});

// ── PACKING LISTS ──
router.get('/:tripId/packing', async (req: any, res: any, next: any) => {
  try {
    const lists = await prisma.packingList.findMany({
      where: { tripId: req.params.tripId },
      include: { items: true }
    });
    res.json({ success: true, data: lists });
  } catch (error) { next(error); }
});

router.post('/:tripId/packing', async (req: any, res: any, next: any) => {
  try {
    const { name } = req.body;
    const list = await prisma.packingList.create({
      data: { tripId: req.params.tripId, name: name || 'My Packing List' },
      include: { items: true }
    });
    res.status(201).json({ success: true, data: list });
  } catch (error) { next(error); }
});

router.post('/:tripId/packing/:listId/items', async (req: any, res: any, next: any) => {
  try {
    const { name, category, quantity } = req.body;
    const item = await prisma.packingItem.create({
      data: { listId: req.params.listId, name, category: category || 'General', quantity: quantity || 1 }
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
});

router.patch('/:tripId/packing/:listId/items/:itemId', async (req: any, res: any, next: any) => {
  try {
    const { isPacked, name, category } = req.body;
    const data: any = {};
    if (isPacked !== undefined) data.isPacked = isPacked;
    if (name) data.name = name;
    if (category) data.category = category;
    const item = await prisma.packingItem.update({ where: { id: req.params.itemId }, data });
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});

router.delete('/:tripId/packing/:listId/items/:itemId', async (req: any, res: any, next: any) => {
  try {
    await prisma.packingItem.delete({ where: { id: req.params.itemId } });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) { next(error); }
});

// ── JOURNAL / NOTES ──
router.get('/:tripId/journal', async (req: any, res: any, next: any) => {
  try {
    const notes = await prisma.note.findMany({
      where: { tripId: req.params.tripId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: notes });
  } catch (error) { next(error); }
});

router.post('/:tripId/journal', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req) || req.body.userId;
    const { title, body, mood, energy, day, imageUrl } = req.body;
    const note = await prisma.note.create({
      data: { tripId: req.params.tripId, userId, title, body, mood, energy, day, imageUrl }
    });
    res.status(201).json({ success: true, data: note });
  } catch (error) { next(error); }
});

router.delete('/:tripId/journal/:noteId', async (req: any, res: any, next: any) => {
  try {
    await prisma.note.delete({ where: { id: req.params.noteId } });
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) { next(error); }
});

// ── CARBON FOOTPRINT ──
router.get('/:tripId/carbon', async (req: any, res: any, next: any) => {
  try {
    const emissions = await prisma.carbonEmission.findMany({ where: { tripId: req.params.tripId } });
    const totalKg = emissions.reduce((s: number, e: any) => s + e.kgCo2, 0);
    res.json({ success: true, data: { emissions, totalKgCo2: totalKg } });
  } catch (error) { next(error); }
});

router.post('/:tripId/carbon', async (req: any, res: any, next: any) => {
  try {
    const { mode, kgCo2 } = req.body;
    // Auto-calculate based on mode if kgCo2 not provided
    const co2Map: any = { flight: 255, car: 170, train: 41, bus: 89, ferry: 120 };
    const calculatedCo2 = kgCo2 || co2Map[mode?.toLowerCase()] || 100;

    const emission = await prisma.carbonEmission.create({
      data: { tripId: req.params.tripId, mode, kgCo2: calculatedCo2 }
    });
    res.status(201).json({ success: true, data: emission });
  } catch (error) { next(error); }
});

// ── PHOTO/VIDEO ALBUM ──
router.get('/:tripId/album', async (req: any, res: any, next: any) => {
  try {
    const photos = await prisma.tripAlbumPhoto.findMany({
      where: { tripId: req.params.tripId },
      orderBy: { timestamp: 'desc' }
    });
    const cover = photos.find((p: any) => p.isCover) || photos[0] || null;
    res.json({ success: true, data: { photos, cover } });
  } catch (error) { next(error); }
});

router.post('/:tripId/album', async (req: any, res: any, next: any) => {
  try {
    const { mediaUrl, mediaType, caption, timestamp, isCover } = req.body;
    
    // If setting as cover, unset any existing cover
    if (isCover) {
      await prisma.tripAlbumPhoto.updateMany({
        where: { tripId: req.params.tripId, isCover: true },
        data: { isCover: false }
      });
    }

    const photo = await prisma.tripAlbumPhoto.create({
      data: {
        tripId: req.params.tripId,
        mediaUrl,
        mediaType: mediaType || 'photo',
        caption,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        isCover: isCover || false
      }
    });
    res.status(201).json({ success: true, data: photo });
  } catch (error) { next(error); }
});

router.delete('/:tripId/album/:photoId', async (req: any, res: any, next: any) => {
  try {
    await prisma.tripAlbumPhoto.delete({ where: { id: req.params.photoId } });
    res.json({ success: true, message: 'Photo deleted' });
  } catch (error) { next(error); }
});

router.patch('/:tripId/album/:photoId/cover', async (req: any, res: any, next: any) => {
  try {
    // Unset all covers first
    await prisma.tripAlbumPhoto.updateMany({
      where: { tripId: req.params.tripId, isCover: true },
      data: { isCover: false }
    });
    const photo = await prisma.tripAlbumPhoto.update({
      where: { id: req.params.photoId },
      data: { isCover: true }
    });
    res.json({ success: true, data: photo });
  } catch (error) { next(error); }
});

export default router;

