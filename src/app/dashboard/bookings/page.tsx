'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming')

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return }
    if (status !== 'authenticated') return

    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => { setBookings(data); setLoading(false) })
  }, [status])

  const now = new Date()
  const filtered = tab === 'upcoming'
    ? bookings.filter((b) => new Date(b.startDate) >= now)
    : tab === 'past'
    ? bookings.filter((b) => new Date(b.startDate) < now)
    : bookings

  if (status === 'loading' || loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-airbnb border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-white">My Bookings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(['upcoming', 'past', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                tab === t
                  ? 'bg-airbnb text-white shadow-lg shadow-airbnb/30'
                  : 'bg-dark-card border border-dark-border text-gray-300 hover:border-gray-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-white mb-2">No {tab} bookings</h3>
            <p className="text-gray-400 mb-6">Start exploring amazing stays around the world.</p>
            <Link href="/listings" className="bg-airbnb text-white px-6 py-3 rounded-full font-semibold hover:bg-airbnb-dark transition-colors">
              Browse stays
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <div key={booking.id} className="bg-dark-card border border-dark-border rounded-2xl p-6 flex gap-6">
                <div className="relative w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  {booking.listing?.imageUrls?.[0] && (
                    <Image src={booking.listing.imageUrls[0]} alt="" fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/listings/${booking.listingId}`} className="font-semibold text-white hover:text-airbnb transition-colors">
                        {booking.listing?.title}
                      </Link>
                      <p className="text-sm text-gray-400 mt-1">{booking.listing?.location}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${
                      booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-6 mt-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Check-in</p>
                      <p className="text-white font-medium">{new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Check-out</p>
                      <p className="text-white font-medium">{new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Total paid</p>
                      <p className="text-white font-bold">${booking.totalPrice.toFixed(0)}</p>
                    </div>
                  </div>

                  {booking.status === 'pending' && (
                    <Link
                      href={`/checkout/${booking.id}`}
                      className="inline-block mt-4 text-sm bg-airbnb text-white px-4 py-2 rounded-xl font-semibold hover:bg-airbnb-dark transition-colors"
                    >
                      Complete payment
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
