const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Seeding Traveloop database...');
  
  // Clear all tables in correct order
  await prisma.review.deleteMany();
  await prisma.carbonEmission.deleteMany();
  await prisma.safetyAlert.deleteMany();
  await prisma.note.deleteMany();
  await prisma.packingItem.deleteMany();
  await prisma.packingList.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.itineraryActivity.deleteMany();
  await prisma.itineraryStop.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.tripCompanion.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();

  // ── CITIES ──
  const paris = await prisma.city.create({
    data: {
      name: 'Paris', country: 'France', region: 'Europe',
      description: 'The City of Light offers unparalleled romance, art, fashion, and cuisine along the Seine.',
      latitude: 48.8566, longitude: 2.3522, population: 2161000, currency: 'EUR',
      costLevel: 4, rating: 4.8, climate: 'Temperate', visaRequired: false,
      safetyScore: 85, bestTimeToVisit: 'April to June, September to November',
      coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'
    }
  });

  const kyoto = await prisma.city.create({
    data: {
      name: 'Kyoto', country: 'Japan', region: 'Asia',
      description: 'Ancient capital famous for classical Buddhist temples, gardens, Shinto shrines, and geisha traditions.',
      latitude: 35.0116, longitude: 135.7681, population: 1475000, currency: 'JPY',
      costLevel: 3, rating: 4.9, climate: 'Humid subtropical', visaRequired: true,
      safetyScore: 98, bestTimeToVisit: 'March to May (Cherry Blossoms)',
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'
    }
  });

  const bali = await prisma.city.create({
    data: {
      name: 'Bali', country: 'Indonesia', region: 'Asia',
      description: 'Island paradise with volcanic mountains, iconic rice paddies, temples, and coral reefs.',
      latitude: -8.3405, longitude: 115.092, population: 4320000, currency: 'IDR',
      costLevel: 2, rating: 4.7, climate: 'Tropical', visaRequired: false,
      safetyScore: 78, bestTimeToVisit: 'April to October (Dry Season)',
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'
    }
  });

  const nyc = await prisma.city.create({
    data: {
      name: 'New York', country: 'USA', region: 'North America',
      description: 'The city that never sleeps — world-class museums, Broadway, Central Park, and iconic skyline.',
      latitude: 40.7128, longitude: -74.006, population: 8336000, currency: 'USD',
      costLevel: 5, rating: 4.6, climate: 'Humid continental', visaRequired: true,
      safetyScore: 72, bestTimeToVisit: 'April to June, September to November',
      coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'
    }
  });

  const santorini = await prisma.city.create({
    data: {
      name: 'Santorini', country: 'Greece', region: 'Europe',
      description: 'Iconic white-washed buildings with blue domes overlooking the caldera and Aegean Sea.',
      latitude: 36.3932, longitude: 25.4615, population: 15500, currency: 'EUR',
      costLevel: 4, rating: 4.9, climate: 'Mediterranean', visaRequired: false,
      safetyScore: 92, bestTimeToVisit: 'June to September',
      coverImage: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800'
    }
  });

  const marrakech = await prisma.city.create({
    data: {
      name: 'Marrakech', country: 'Morocco', region: 'Africa',
      description: 'Vibrant souks, stunning palaces, and the magical Jemaa el-Fnaa square.',
      latitude: 31.6295, longitude: -7.9811, population: 928850, currency: 'MAD',
      costLevel: 2, rating: 4.5, climate: 'Semi-arid', visaRequired: false,
      safetyScore: 68, bestTimeToVisit: 'March to May, September to November',
      coverImage: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800'
    }
  });

  // ── ACTIVITIES ──
  const activities = [
    // Paris
    { cityId: paris.id, name: 'Louvre Museum VIP Access', description: 'Skip the line and explore the world\'s largest art museum.', category: 'Cultural', cost: 85, duration: 180, rating: 4.9, reviewsCount: 1240, timeOfDay: 'Morning', weatherIdeal: 'Any', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600' },
    { cityId: paris.id, name: 'Seine River Twilight Cruise', description: 'See Paris illuminated at night from a glass-enclosed boat.', category: 'Luxury', cost: 45, duration: 90, rating: 4.7, reviewsCount: 890, timeOfDay: 'Evening', weatherIdeal: 'Sunny', imageUrl: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=600' },
    { cityId: paris.id, name: 'Montmartre Food Tour', description: 'Taste artisan cheeses, pastries, and wine in Montmartre.', category: 'Food', cost: 65, duration: 150, rating: 4.8, reviewsCount: 520, timeOfDay: 'Afternoon', weatherIdeal: 'Any', imageUrl: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=600' },
    // Kyoto
    { cityId: kyoto.id, name: 'Traditional Tea Ceremony', description: 'Experience authentic matcha preparation in a historic machiya.', category: 'Cultural', cost: 40, duration: 60, rating: 4.9, reviewsCount: 450, timeOfDay: 'Afternoon', weatherIdeal: 'Indoor', imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600' },
    { cityId: kyoto.id, name: 'Fushimi Inari Shrine Hike', description: 'Walk through 10,000 vermillion torii gates up the mountain.', category: 'Adventure', cost: 0, duration: 120, rating: 4.8, reviewsCount: 2100, timeOfDay: 'Morning', weatherIdeal: 'Sunny', imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=600' },
    // Bali
    { cityId: bali.id, name: 'Ubud Rice Terrace Walk', description: 'Explore the stunning Tegallalang rice terraces and local coffee farms.', category: 'Nature', cost: 15, duration: 120, rating: 4.6, reviewsCount: 780, timeOfDay: 'Morning', weatherIdeal: 'Sunny', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600' },
    { cityId: bali.id, name: 'Sunset Beach Yoga', description: 'Oceanfront yoga session with certified instructor on Seminyak beach.', category: 'Wellness', cost: 20, duration: 90, rating: 4.7, reviewsCount: 340, timeOfDay: 'Evening', weatherIdeal: 'Sunny', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600' },
    // NYC
    { cityId: nyc.id, name: 'Broadway Show Premium Seats', description: 'Experience a Tony Award-winning production from orchestra seats.', category: 'Entertainment', cost: 180, duration: 150, rating: 4.8, reviewsCount: 3200, timeOfDay: 'Evening', weatherIdeal: 'Indoor', imageUrl: 'https://images.unsplash.com/photo-1520264737219-57e10a8eb8a4?w=600' },
    { cityId: nyc.id, name: 'Central Park Guided Bike Tour', description: 'Discover hidden gems and iconic landmarks on a 2-hour ride.', category: 'Adventure', cost: 45, duration: 120, rating: 4.5, reviewsCount: 670, timeOfDay: 'Morning', weatherIdeal: 'Sunny', imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600' },
    // Santorini
    { cityId: santorini.id, name: 'Caldera Sunset Catamaran Cruise', description: 'Sail the volcanic caldera with BBQ dinner and wine at sunset.', category: 'Luxury', cost: 120, duration: 300, rating: 4.9, reviewsCount: 1500, timeOfDay: 'Evening', weatherIdeal: 'Sunny', imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600' },
    // Marrakech
    { cityId: marrakech.id, name: 'Medina Souk Walking Tour', description: 'Navigate the vibrant markets with a local guide and learn to haggle.', category: 'Cultural', cost: 25, duration: 180, rating: 4.6, reviewsCount: 890, timeOfDay: 'Morning', weatherIdeal: 'Any', imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600' },
  ];

  for (const act of activities) {
    await prisma.activity.create({ data: act });
  }

  // ── SAFETY ALERTS ──
  const alerts = [
    { cityId: paris.id, type: 'Pickpocket', body: 'High pickpocket risk near Eiffel Tower and metro stations. Keep valuables secure.', severity: 'MEDIUM' },
    { cityId: marrakech.id, type: 'Scam', body: 'Beware of unlicensed guides and inflated prices in the souks. Only use verified guides.', severity: 'HIGH' },
    { cityId: bali.id, type: 'Health', body: 'Drink only bottled water. Avoid ice from street vendors.', severity: 'LOW' },
    { cityId: nyc.id, type: 'Safety', body: 'Avoid walking alone in poorly lit areas late at night in certain neighborhoods.', severity: 'MEDIUM' },
  ];
  for (const a of alerts) {
    await prisma.safetyAlert.create({ data: a });
  }

  console.log('✅ Seeding completed! Cities:', 6, 'Activities:', activities.length, 'Safety Alerts:', alerts.length);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
