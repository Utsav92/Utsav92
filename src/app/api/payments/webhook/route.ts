import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig ?? '',
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    )
  } catch {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    const bookingId = intent.metadata.bookingId

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'confirmed', stripePaymentId: intent.id },
      })
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    const bookingId = intent.metadata.bookingId

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'cancelled' },
      })
    }
  }

  return NextResponse.json({ received: true })
}
