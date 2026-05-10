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

// GET /match/:tripId - Find travel buddies for a trip
router.get('/match/:tripId', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const trip = await prisma.trip.findUnique({
      where: { id: req.params.tripId },
      include: { owner: true, itinerary: { include: { city: true } } }
    });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // Get the user's preferences
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    // Find other trips that overlap in dates and share destinations
    const cityIds = trip.itinerary.map(s => s.cityId);

    const matchingTrips = await prisma.trip.findMany({
      where: {
        ownerId: { not: userId },
        lookingForBuddy: true,
        tripMode: 'solo',
        OR: [
          {
            startDate: { lte: trip.endDate },
            endDate: { gte: trip.startDate }
          }
        ],
        ...(cityIds.length > 0 ? {
          itinerary: { some: { cityId: { in: cityIds } } }
        } : {})
      },
      include: {
        owner: {
          select: {
            id: true, name: true, avatar: true, age: true, gender: true,
            travelStyle: true, tripVibe: true, country: true, bio: true
          }
        },
        itinerary: { include: { city: { select: { name: true, country: true } } } }
      },
      take: 20
    });

    // Score and filter by preferences
    const scored = matchingTrips.map(t => {
      let score = 0;
      const owner = t.owner as any;

      // Date overlap score
      const overlapStart = Math.max(trip.startDate.getTime(), t.startDate.getTime());
      const overlapEnd = Math.min(trip.endDate.getTime(), t.endDate.getTime());
      const overlapDays = Math.max(0, (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
      score += overlapDays * 10;

      // City match score
      const matchCities = t.itinerary.filter((s: any) => cityIds.includes(s.cityId));
      score += matchCities.length * 20;

      // Gender preference match
      if (currentUser?.buddyPrefGender && owner.gender) {
        if (currentUser.buddyPrefGender === 'any' || currentUser.buddyPrefGender === owner.gender) score += 15;
      }

      // Age preference match
      if (currentUser?.buddyPrefAgeMin && currentUser?.buddyPrefAgeMax && owner.age) {
        if (owner.age >= currentUser.buddyPrefAgeMin && owner.age <= currentUser.buddyPrefAgeMax) score += 15;
      }

      // Vibe match
      if (currentUser?.tripVibe && owner.tripVibe && currentUser.tripVibe === owner.tripVibe) score += 20;

      // Travel style match
      if (currentUser?.travelStyle && owner.travelStyle && currentUser.travelStyle === owner.travelStyle) score += 10;

      return { ...t, matchScore: score, sharedCities: matchCities.map((s: any) => s.city?.name) };
    });

    // Sort by score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, data: scored });
  } catch (error) { next(error); }
});

// PATCH /preferences - Update buddy preferences
router.patch('/preferences', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { age, gender, tripVibe, buddyPrefGender, buddyPrefAgeMin, buddyPrefAgeMax, travelStyle, preferredBudget, preferredRegions } = req.body;
    const data: any = {};
    if (age !== undefined) data.age = parseInt(age);
    if (gender !== undefined) data.gender = gender;
    if (tripVibe !== undefined) data.tripVibe = tripVibe;
    if (buddyPrefGender !== undefined) data.buddyPrefGender = buddyPrefGender;
    if (buddyPrefAgeMin !== undefined) data.buddyPrefAgeMin = parseInt(buddyPrefAgeMin);
    if (buddyPrefAgeMax !== undefined) data.buddyPrefAgeMax = parseInt(buddyPrefAgeMax);
    if (travelStyle !== undefined) data.travelStyle = travelStyle;
    if (preferredBudget !== undefined) data.preferredBudget = preferredBudget;
    if (preferredRegions !== undefined) data.preferredRegions = JSON.stringify(preferredRegions);
    if (req.body.travelPace !== undefined) data.travelPace = req.body.travelPace;
    if (req.body.dietaryRestrictions !== undefined) data.dietaryRestrictions = JSON.stringify(req.body.dietaryRestrictions);

    const user = await prisma.user.update({ where: { id: userId }, data });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

// GET /preferences - Get current user preferences
router.get('/preferences', async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        age: true, gender: true, tripVibe: true, travelStyle: true,
        buddyPrefGender: true, buddyPrefAgeMin: true, buddyPrefAgeMax: true,
        preferredBudget: true, preferredRegions: true, travelPace: true, dietaryRestrictions: true
      }
    });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

export default router;
