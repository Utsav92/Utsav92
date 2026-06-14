import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  imageUrls: z.array(z.string().url()).min(1),
  category: z.string(),
  roomCount: z.number().int().min(1),
  bathroomCount: z.number().int().min(1),
  guestCount: z.number().int().min(1),
  location: z.string(),
  city: z.string(),
  country: z.string(),
  price: z.number().positive(),
  amenities: z.array(z.string()),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const location = searchParams.get('location')
  const category = searchParams.get('category')
  const guests = searchParams.get('guests')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const take = parseInt(searchParams.get('take') ?? '20')
  const skip = parseInt(searchParams.get('skip') ?? '0')

  const where: any = {}
  if (location) where.OR = [
    { location: { contains: location } },
    { city: { contains: location } },
    { country: { contains: location } },
  ]
  if (category) where.category = category
  if (guests) where.guestCount = { gte: parseInt(guests) }
  if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) }
  if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        host: { select: { id: true, name: true, email: true, image: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.listing.count({ where }),
  ])

  const formatted = listings.map((l) => ({
    ...l,
    imageUrls: JSON.parse(l.imageUrls),
    amenities: JSON.parse(l.amenities),
    avgRating: l.reviews.length ? l.reviews.reduce((a, r) => a + r.rating, 0) / l.reviews.length : null,
    reviewCount: l.reviews.length,
  }))

  return NextResponse.json({ listings: formatted, total })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const listing = await prisma.listing.create({
      data: {
        ...data,
        imageUrls: JSON.stringify(data.imageUrls),
        amenities: JSON.stringify(data.amenities),
        hostId: (session.user as any).id,
      },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', issues: err.issues }, { status: 422 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
