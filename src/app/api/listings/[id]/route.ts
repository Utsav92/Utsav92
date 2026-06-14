import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      host: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
      },
      bookings: {
        where: { status: { in: ['confirmed', 'pending'] } },
        select: { startDate: true, endDate: true },
      },
    },
  })

  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ...listing,
    imageUrls: JSON.parse(listing.imageUrls),
    amenities: JSON.parse(listing.amenities),
    avgRating: listing.reviews.length
      ? listing.reviews.reduce((a, r) => a + r.rating, 0) / listing.reviews.length
      : null,
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const listing = await prisma.listing.findUnique({ where: { id: params.id } })
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (listing.hostId !== (session.user as any).id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.listing.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
