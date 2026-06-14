'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [myListings, setMyListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return }
    if (status !== 'authenticated') return

    Promise.all([
      fetch('/api/bookings').then((r) => r.json()),
      fetch('/api/listings').then((r) => r.json()),
    ]).then(([b, l]) => {
      setBookings(b.slice(0, 3))
      const uid = (session.user as any)?.id
      if (uid) setMyListings(l.listings?.filter((li: any) => li.hostId === uid).slice(0, 3) ?? [])
      setLoading(false)
    })
  }, [status, session])

  if (status === 'loading' || loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-airbnb border-t-transparent rounded-full" />
    </div>
  )

  if (!session) return null

  const upcoming = bookings.filter((b) => new Date(b.startDate) >= new Date())
  const past = bookings.filter((b) => new Date(b.startDate) < new Date())

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-full bg-airbnb flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {session.user?.image ? (
              <Image src={session.user.image} alt="" width={64} height={64} className="rounded-full" />
            ) : (
              session.user?.name?.[0]?.toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {session.user?.name?.split(' ')[0]}!</h1>
            <p className="text-gray-400">{session.user?.email}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total bookings', value: bookings.length, icon: '📅' },
            { label: 'Upcoming trips', value: upcoming.length, icon: '✈️' },
            { label: 'Past trips', value: past.length, icon: '🗺️' },
            { label: 'My listings', value: myListings.length, icon: '🏠' },
          ].map((stat) => (
            <div key={stat.label} className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bookings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Recent bookings</h2>
              <Link href="/dashboard/bookings" className="text-sm text-airbnb hover:underline">View all</Link>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-dark-card border border-dark-border rounded-2xl p-10 text-center">
                <div className="text-5xl mb-4">🌍</div>
                <h3 className="font-semibold text-white mb-2">No bookings yet</h3>
                <p className="text-gray-400 mb-4 text-sm">Your adventures await! Browse thousands of unique stays.</p>
                <Link href="/listings" className="inline-block bg-airbnb text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-airbnb-dark transition-colors">
                  Explore stays
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-dark-card border border-dark-border rounded-2xl p-4 flex gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      {booking.listing?.imageUrls?.[0] && (
                        <Image src={booking.listing.imageUrls[0]} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{booking.listing?.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{booking.listing?.location}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span className="text-sm font-semibold text-white">${booking.totalPrice.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <h2 className="font-semibold text-white mb-4">Quick actions</h2>
              <div className="space-y-2">
                <Link href="/listings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-hover transition-colors text-sm text-gray-300">
                  <span>🔍</span> Browse listings
                </Link>
                <Link href="/listings/new" className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-hover transition-colors text-sm text-gray-300">
                  <span>➕</span> List a property
                </Link>
                <Link href="/dashboard/bookings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-hover transition-colors text-sm text-gray-300">
                  <span>📅</span> My bookings
                </Link>
              </div>
            </div>

            {/* My listings */}
            {myListings.length > 0 && (
              <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
                <h2 className="font-semibold text-white mb-4">My listings</h2>
                <div className="space-y-3">
                  {myListings.map((listing) => (
                    <Link key={listing.id} href={`/listings/${listing.id}`} className="flex items-center gap-3 hover:bg-dark-hover rounded-xl p-2 transition-colors">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        {listing.imageUrls?.[0] && (
                          <Image src={listing.imageUrls[0]} alt="" fill className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{listing.title}</p>
                        <p className="text-xs text-gray-400">${listing.price}/night</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
