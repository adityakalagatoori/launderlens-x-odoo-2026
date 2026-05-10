const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();

  const paris = await prisma.city.create({
    data: {
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      description: 'The City of Light offers unparalleled romance, art, and fashion.',
      population: 2161000,
      currency: 'EUR',
      costLevel: 4,
      rating: 4.8,
      climate: 'Temperate',
      visaRequired: false,
      safetyScore: 85,
      bestTimeToVisit: 'April to June, October to early November',
      coverImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop',
      activities: {
        create: [
          {
            name: 'Louvre Museum VIP Access',
            description: 'Skip the line and explore the world\'s largest art museum with an expert guide.',
            category: 'Cultural',
            cost: 85.0,
            duration: 180,
            rating: 4.9,
            reviewsCount: 1240,
            accessibility: true,
            timeOfDay: 'Morning',
            weatherIdeal: 'Any',
            imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop'
          },
          {
            name: 'Seine River Twilight Cruise',
            description: 'Experience Paris illuminated at night from the glass-enclosed boats.',
            category: 'Luxury',
            cost: 45.0,
            duration: 90,
            rating: 4.7,
            reviewsCount: 890,
            accessibility: true,
            timeOfDay: 'Evening',
            weatherIdeal: 'Sunny',
            imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop'
          }
        ]
      }
    }
  });

  const kyoto = await prisma.city.create({
    data: {
      name: 'Kyoto',
      country: 'Japan',
      region: 'Asia',
      description: 'Famous for classical Buddhist temples, gardens, imperial palaces, and wooden houses.',
      population: 1475000,
      currency: 'JPY',
      costLevel: 3,
      rating: 4.9,
      climate: 'Temperate',
      visaRequired: true,
      safetyScore: 98,
      bestTimeToVisit: 'March to May (Cherry Blossoms)',
      coverImage: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2070&auto=format&fit=crop',
      activities: {
        create: [
          {
            name: 'Traditional Tea Ceremony',
            description: 'Experience a traditional Japanese matcha tea ceremony in a historic machiya.',
            category: 'Cultural',
            cost: 40.0,
            duration: 60,
            rating: 4.9,
            reviewsCount: 450,
            accessibility: false,
            timeOfDay: 'Afternoon',
            weatherIdeal: 'Indoor',
            imageUrl: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2070&auto=format&fit=crop'
          }
        ]
      }
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
