import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  listingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { listingId, rating, comment } = schema.parse(body)

    const review = await prisma.review.create({
      data: {
        listingId,
        userId: (session.user as any).id,
        rating,
        comment,
      },
      include: { user: { select: { name: true, image: true } } },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
