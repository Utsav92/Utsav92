import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  listingId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  totalPrice: z.number().positive(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where: { userId: (session.user as any).id },
    include: {
      listing: {
        select: { title: true, imageUrls: true, location: true, price: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(
    bookings.map((b) => ({
      ...b,
      listing: { ...b.listing, imageUrls: JSON.parse(b.listing.imageUrls) },
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { listingId, startDate, endDate, totalPrice } = schema.parse(body)

    const start = new Date(startDate)
    const end = new Date(endDate)

    const conflict = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ['confirmed', 'pending'] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    })

    if (conflict) {
      return NextResponse.json({ error: 'Dates are not available' }, { status: 409 })
    }

    const booking = await prisma.booking.create({
      data: {
        listingId,
        userId: (session.user as any).id,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'pending',
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
