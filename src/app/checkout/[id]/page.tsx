'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' })

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return }

    fetch('/api/bookings')
      .then((r) => r.json())
      .then((bookings: any[]) => {
        const found = bookings.find((b: any) => b.id === params.id)
        setBooking(found)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id, session])

  const nights =
    booking
      ? Math.round(
          (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!card.number || !card.expiry || !card.cvc || !card.name) {
      toast.error('Please fill in all card details')
      return
    }
    setPaying(true)

    // Simulate Stripe payment (in production, use Stripe Elements)
    await new Promise((r) => setTimeout(r, 2000))
    toast.success('Payment successful! Booking confirmed!')
    router.push('/dashboard/bookings')
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-airbnb border-t-transparent rounded-full" />
    </div>
  )

  if (!booking) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      Booking not found. <Link href="/" className="text-airbnb ml-2 hover:underline">Go home</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Confirm and pay</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Payment form */}
          <div className="space-y-8">
            {/* Trip details */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Your trip</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Dates</span>
                  <span className="text-white">
                    {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white">{nights} nights</span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Payment</h2>
              <p className="text-xs text-gray-400 mb-5 flex items-center gap-1">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Secured by SSL encryption · Powered by Stripe
              </p>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Cardholder name</label>
                  <input
                    type="text"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-dark-card2 border border-dark-border text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-airbnb"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Card number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full bg-dark-card2 border border-dark-border text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-airbnb"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      <div className="w-7 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                      <div className="w-7 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Expiry date</label>
                    <input
                      type="text"
                      value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full bg-dark-card2 border border-dark-border text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-airbnb"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">CVC</label>
                    <input
                      type="text"
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                      placeholder="123"
                      maxLength={4}
                      className="w-full bg-dark-card2 border border-dark-border text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-airbnb"
                    />
                  </div>
                </div>

                {/* Test card hint */}
                <div className="bg-dark-card2 border border-dark-border rounded-xl p-3 text-xs text-gray-400">
                  <strong className="text-gray-300">Test card:</strong> 4242 4242 4242 4242 · 12/28 · 123
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full bg-gradient-to-r from-airbnb to-airbnb-dark text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-airbnb/40"
                >
                  {paying ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : `Pay $${booking.totalPrice.toFixed(0)}`}
                </button>
              </form>
            </div>

            {/* Cancellation policy */}
            <div className="text-sm text-gray-400 space-y-2">
              <p className="font-medium text-white">Cancellation policy</p>
              <p>Free cancellation for 48 hours after booking. Cancel before check-in for a partial refund.</p>
            </div>
          </div>

          {/* Right: Booking summary */}
          <div>
            <div className="sticky top-24 bg-dark-card border border-dark-border rounded-3xl p-6">
              <div className="flex gap-4 pb-6 border-b border-dark-border">
                <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  {booking.listing.imageUrls[0] && (
                    <Image src={booking.listing.imageUrls[0]} alt="" fill className="object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{booking.listing.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{booking.listing.location}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    <span className="text-sm text-white font-medium">4.9</span>
                  </div>
                </div>
              </div>

              <div className="py-6 border-b border-dark-border">
                <h3 className="font-semibold text-white mb-4">Price details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">${booking.listing.price} × {nights} nights</span>
                    <span className="text-white">${(booking.listing.price * nights).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cleaning fee</span>
                    <span className="text-white">$80</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">DarkBnb service fee</span>
                    <span className="text-white">${(booking.listing.price * nights * 0.12).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-between font-bold">
                <span className="text-white">Total (USD)</span>
                <span className="text-white text-lg">${booking.totalPrice.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
