import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all trips for a user
router.get('/', async (req, res, next) => {
  try {
    // In a real app, userId comes from the authenticated token
    // For this prototype, we'll accept it via query or header, or just return all
    const { userId } = req.query;
    
    const where: any = {};
    if (userId) {
      where.ownerId = String(userId);
    }
    
    const trips = await prisma.trip.findMany({
      where,
      include: {
        companions: {
          include: { user: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    res.json({ success: true, data: trips });
  } catch (error) {
    next(error);
  }
});

// Create a new trip
router.post('/', async (req, res, next) => {
  try {
    const { 
      name, description, startDate, endDate, tripType, 
      budget, currency, timezone, visibility, tags, ownerId 
    } = req.body;
    
    // We need an ownerId. In a real app, this is req.user.id
    // For prototype, if no ownerId is provided, let's create a default user or return error
    if (!ownerId) {
      return res.status(400).json({ success: false, message: 'ownerId is required' });
    }

    const trip = await prisma.trip.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        tripType,
        budget: parseFloat(budget || 0),
        currency: currency || "USD",
        timezone: timezone || "UTC",
        visibility: visibility || "PRIVATE",
        tags: JSON.stringify(tags || []),
        ownerId
      }
    });
    
    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
});

// Get single trip
router.get('/:id', async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        companions: {
          include: { user: true }
        }
      }
    });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    
    res.json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
});

export default router;
