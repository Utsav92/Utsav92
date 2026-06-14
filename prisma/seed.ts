import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const listings = [
  {
    title: 'Luxury Penthouse with City Views',
    description: 'Experience the ultimate urban luxury in this stunning penthouse apartment. Floor-to-ceiling windows offer breathtaking panoramic views of the city skyline. Features a private rooftop terrace, designer furnishings, and top-of-the-line appliances. Perfect for those seeking an elevated stay in the heart of the city.',
    imageUrls: JSON.stringify([
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    ]),
    category: 'Apartment',
    roomCount: 3,
    bathroomCount: 2,
    guestCount: 6,
    location: 'Manhattan, New York',
    city: 'New York',
    country: 'United States',
    price: 450,
    amenities: JSON.stringify(['WiFi', 'Air conditioning', 'Kitchen', 'Rooftop terrace', 'Gym', 'Doorman', 'City views']),
  },
  {
    title: 'Beachfront Villa in Malibu',
    description: 'Wake up to the sound of waves in this spectacular beachfront villa. Direct beach access, private pool, and multiple outdoor entertaining spaces make this the perfect coastal retreat. The open-plan living area seamlessly connects indoor and outdoor spaces.',
    imageUrls: JSON.stringify([
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
      'https://images.unsplash.com/photo-1540541338537-1220059c3985?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    ]),
    category: 'Villa',
    roomCount: 5,
    bathroomCount: 4,
    guestCount: 10,
    location: 'Malibu, California',
    city: 'Malibu',
    country: 'United States',
    price: 1200,
    amenities: JSON.stringify(['WiFi', 'Private pool', 'Beach access', 'BBQ grill', 'Ocean views', 'Parking', 'Hot tub']),
  },
  {
    title: 'Cozy Mountain Cabin',
    description: 'Escape to this charming log cabin nestled in the Rocky Mountains. A wood-burning fireplace, rustic decor, and stunning mountain views create the perfect romantic retreat. Hiking trails start right from the doorstep.',
    imageUrls: JSON.stringify([
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
      'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800',
    ]),
    category: 'Cabin',
    roomCount: 2,
    bathroomCount: 1,
    guestCount: 4,
    location: 'Aspen, Colorado',
    city: 'Aspen',
    country: 'United States',
    price: 280,
    amenities: JSON.stringify(['WiFi', 'Fireplace', 'Mountain views', 'Hiking trails', 'Parking', 'Pet friendly', 'Kitchen']),
  },
  {
    title: 'Historic Parisian Apartment',
    description: 'Live like a true Parisian in this beautifully restored Haussmann apartment in the heart of Paris. Original parquet floors, ornate moldings, and French balconies offer an authentic Parisian experience just steps from the Eiffel Tower.',
    imageUrls: JSON.stringify([
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    ]),
    category: 'Apartment',
    roomCount: 2,
    bathroomCount: 1,
    guestCount: 4,
    location: '7th Arrondissement, Paris',
    city: 'Paris',
    country: 'France',
    price: 320,
    amenities: JSON.stringify(['WiFi', 'Balcony', 'Eiffel Tower views', 'Kitchen', 'Metro nearby', 'Air conditioning']),
  },
  {
    title: 'Tropical Overwater Bungalow',
    description: 'Indulge in paradise at this iconic overwater bungalow in the Maldives. Direct lagoon access from your private deck, a glass floor panel to watch marine life, and 24/7 butler service create an unparalleled luxury experience.',
    imageUrls: JSON.stringify([
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    ]),
    category: 'Bungalow',
    roomCount: 1,
    bathroomCount: 1,
    guestCount: 2,
    location: 'North Malé Atoll, Maldives',
    city: 'Malé',
    country: 'Maldives',
    price: 850,
    amenities: JSON.stringify(['WiFi', 'Lagoon access', 'Butler service', 'Snorkeling gear', 'Infinity pool', 'Sunset views', 'Minibar']),
  },
  {
    title: 'Modern Loft in Brooklyn',
    description: 'This converted warehouse loft in trendy Williamsburg features exposed brick, industrial-chic design, and sweeping Manhattan skyline views. Walking distance to the best restaurants, bars, and boutiques Brooklyn has to offer.',
    imageUrls: JSON.stringify([
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    ]),
    category: 'Loft',
    roomCount: 1,
    bathroomCount: 1,
    guestCount: 2,
    location: 'Williamsburg, Brooklyn',
    city: 'Brooklyn',
    country: 'United States',
    price: 185,
    amenities: JSON.stringify(['WiFi', 'Exposed brick', 'City views', 'Gym', 'Rooftop access', 'Pet friendly', 'Bike storage']),
  },
  {
    title: 'Tuscan Farmhouse Retreat',
    description: 'Nestled in the rolling hills of Tuscany, this centuries-old farmhouse has been lovingly restored while retaining all its original character. Stone walls, terracotta tiles, and a private vineyard create the quintessential Italian countryside experience.',
    imageUrls: JSON.stringify([
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800',
    ]),
    category: 'Farmhouse',
    roomCount: 4,
    bathroomCount: 3,
    guestCount: 8,
    location: 'Chianti, Tuscany',
    city: 'Florence',
    country: 'Italy',
    price: 420,
    amenities: JSON.stringify(['WiFi', 'Private vineyard', 'Pool', 'Olive grove', 'Wine cellar', 'BBQ', 'Garden', 'Panoramic views']),
  },
  {
    title: 'Santorini Cave House',
    description: 'Experience the magic of Santorini in this traditional cave house carved into the volcanic cliffs of Oia. The famous blue-domed churches and caldera views are right at your doorstep. Watch the world-famous Santorini sunset from your private terrace.',
    imageUrls: JSON.stringify([
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
      'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800',
      'https://images.unsplash.com/photo-1601581875039-e899893d520c?w=800',
    ]),
    category: 'Cave House',
    roomCount: 1,
    bathroomCount: 1,
    guestCount: 2,
    location: 'Oia, Santorini',
    city: 'Santorini',
    country: 'Greece',
    price: 380,
    amenities: JSON.stringify(['WiFi', 'Caldera views', 'Private terrace', 'Plunge pool', 'Breakfast included', 'Sunset views']),
  },
]

async function main() {
  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash('password123', 12)

  const host = await prisma.user.upsert({
    where: { email: 'host@darkbnb.com' },
    update: {},
    create: {
      email: 'host@darkbnb.com',
      name: 'Alex Johnson',
      password: hashedPassword,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    },
  })

  await prisma.user.upsert({
    where: { email: 'user@darkbnb.com' },
    update: {},
    create: {
      email: 'user@darkbnb.com',
      name: 'Sarah Williams',
      password: hashedPassword,
    },
  })

  for (const listing of listings) {
    const created = await prisma.listing.create({
      data: { ...listing, hostId: host.id },
    })

    await prisma.review.createMany({
      data: [
        {
          listingId: created.id,
          userId: host.id,
          rating: 5,
          comment: 'Absolutely stunning property! Everything was perfect from check-in to check-out.',
        },
      ],
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
