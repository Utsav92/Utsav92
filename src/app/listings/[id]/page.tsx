'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const AMENITY_ICONS: Record<string, string> = {
  WiFi: '📶', Pool: '🏊', Kitchen: '🍳', Parking: '🚗',
  'Pet friendly': '🐾', 'Air conditioning': '❄️', Fireplace: '🔥',
  'Hot tub': '🛁', 'City views': '🏙️', 'Ocean views': '🌊',
  'Mountain views': '⛰️', BBQ: '🍖', Gym: '💪', Breakfast: '🥐',
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [showAllImages, setShowAllImages] = useState(false)
  const [booking, setBooking] = useState({ startDate: '', endDate: '', guests: 1 })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/listings/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setListing(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  const nights =
    booking.startDate && booking.endDate
      ? Math.max(
          0,
          Math.round(
            (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0

  const totalPrice = nights * (listing?.price ?? 0)
  const serviceFee = totalPrice * 0.12
  const cleaningFee = 80

  const handleBook = async () => {
    if (!session) {
      toast.error('Please log in to make a booking')
      router.push('/auth/login')
      return
    }
    if (!booking.startDate || !booking.endDate) {
      toast.error('Please select check-in and check-out dates')
      return
    }
    if (nights < 1) {
      toast.error('Check-out must be after check-in')
      return
    }
    if (booking.guests > listing.guestCount) {
      toast.error(`Max ${listing.guestCount} guests allowed`)
      return
    }

    setBookingLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: totalPrice + serviceFee + cleaningFee,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }

      const newBooking = await res.json()
      toast.success('Booking created!')
      router.push(`/checkout/${newBooking.id}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) { toast.error('Log in to leave a review'); return }
    setReviewLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, ...review }),
      })
      if (!res.ok) throw new Error('Failed to submit review')
      const newReview = await res.json()
      setListing((prev: any) => ({ ...prev, reviews: [newReview, ...prev.reviews] }))
      setReview({ rating: 5, comment: '' })
      toast.success('Review submitted!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-airbnb border-t-transparent rounded-full" />
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-white mb-2">Listing not found</h2>
        <Link href="/listings" className="text-airbnb hover:underline">Browse all listings</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/listings" className="hover:text-white transition-colors">Listings</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{listing.title}</span>
        </nav>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {listing.avgRating && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <span className="font-semibold text-white">{listing.avgRating.toFixed(1)}</span>
              <span className="text-gray-400">· {listing.reviews.length} reviews</span>
            </div>
          )}
          <span className="text-gray-400">·</span>
          <span className="text-gray-300">{listing.location}</span>
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-2 text-sm text-white hover:text-airbnb transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Share
            </button>
            <button className="flex items-center gap-2 text-sm text-white hover:text-airbnb transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              Save
            </button>
          </div>
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-3xl overflow-hidden h-96 md:h-[500px] mb-10">
          <div className="col-span-2 row-span-2 relative">
            <Image
              src={listing.imageUrls[0]}
              alt={listing.title}
              fill
              className="object-cover hover:brightness-90 transition-all cursor-pointer"
              onClick={() => setShowAllImages(true)}
            />
          </div>
          {listing.imageUrls.slice(1, 5).map((url: string, i: number) => (
            <div key={i} className="relative">
              <Image
                src={url}
                alt=""
                fill
                className="object-cover hover:brightness-90 transition-all cursor-pointer"
                onClick={() => { setActiveImage(i + 1); setShowAllImages(true) }}
              />
            </div>
          ))}
          <button
            onClick={() => setShowAllImages(true)}
            className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors border border-gray-200 shadow-lg"
            style={{ position: 'absolute' }}
          >
            Show all photos
          </button>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Host info */}
            <div className="flex items-center justify-between pb-8 border-b border-dark-border">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {listing.category} hosted by {listing.host.name}
                </h2>
                <p className="text-gray-400 mt-1">
                  {listing.guestCount} guests · {listing.roomCount} rooms · {listing.bathroomCount} baths
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-airbnb flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0">
                {listing.host.image ? (
                  <Image src={listing.host.image} alt="" width={56} height={56} className="rounded-full" />
                ) : (
                  listing.host.name?.[0]?.toUpperCase()
                )}
              </div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 gap-6 pb-8 border-b border-dark-border">
              {[
                { icon: '🏆', title: 'Superhost', desc: 'Alex is a Superhost with years of experience.' },
                { icon: '📍', title: 'Great location', desc: '95% of guests gave the location a 5-star rating.' },
                { icon: '🔑', title: 'Great check-in', desc: '100% of guests gave the check-in process 5 stars.' },
              ].map((h) => (
                <div key={h.title} className="flex items-start gap-4">
                  <span className="text-2xl">{h.icon}</span>
                  <div>
                    <p className="font-medium text-white">{h.title}</p>
                    <p className="text-sm text-gray-400">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="pb-8 border-b border-dark-border">
              <h2 className="text-xl font-semibold text-white mb-4">About this place</h2>
              <p className="text-gray-300 leading-relaxed">{listing.description}</p>
            </div>

            {/* Amenities */}
            <div className="pb-8 border-b border-dark-border">
              <h2 className="text-xl font-semibold text-white mb-6">What this place offers</h2>
              <div className="grid grid-cols-2 gap-4">
                {listing.amenities.map((amenity: string) => (
                  <div key={amenity} className="flex items-center gap-3 text-gray-300">
                    <span className="text-xl">{AMENITY_ICONS[amenity] ?? '✓'}</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                <h2 className="text-xl font-semibold text-white">
                  {listing.avgRating?.toFixed(1)} · {listing.reviews.length} reviews
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {listing.reviews.slice(0, 6).map((review: any) => (
                  <div key={review.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-airbnb flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                        {review.user?.image ? (
                          <Image src={review.user.image} alt="" width={40} height={40} className="rounded-full" />
                        ) : (
                          review.user?.name?.[0]?.toUpperCase() ?? '?'
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{review.user?.name ?? 'Anonymous'}</p>
                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <svg key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-white' : 'fill-gray-600'}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>

              {/* Write a review */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4">Leave a review</h3>
                <form onSubmit={handleReview} className="space-y-4">
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReview({ ...review, rating: s })}
                        className="transition-transform hover:scale-110"
                      >
                        <svg className={`w-7 h-7 ${s <= review.rating ? 'fill-airbnb' : 'fill-gray-600'}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={review.comment}
                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                    placeholder="Share your experience..."
                    rows={3}
                    required
                    className="w-full bg-dark-card2 border border-dark-border text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-airbnb resize-none"
                  />
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="bg-airbnb text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-airbnb-dark transition-colors disabled:opacity-50"
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit review'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-dark-card border border-dark-border rounded-3xl p-6 shadow-2xl shadow-black/50">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-bold text-white">${listing.price}</span>
                <span className="text-gray-400">/ night</span>
              </div>

              <div className="border border-dark-border rounded-2xl overflow-hidden mb-4">
                <div className="grid grid-cols-2">
                  <div className="p-3 border-r border-dark-border">
                    <label className="block text-xs font-semibold text-white mb-1">CHECK-IN</label>
                    <input
                      type="date"
                      value={booking.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBooking({ ...booking, startDate: e.target.value })}
                      className="w-full bg-transparent text-sm text-gray-300 outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div className="p-3">
                    <label className="block text-xs font-semibold text-white mb-1">CHECK-OUT</label>
                    <input
                      type="date"
                      value={booking.endDate}
                      min={booking.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBooking({ ...booking, endDate: e.target.value })}
                      className="w-full bg-transparent text-sm text-gray-300 outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="border-t border-dark-border p-3">
                  <label className="block text-xs font-semibold text-white mb-1">GUESTS</label>
                  <select
                    value={booking.guests}
                    onChange={(e) => setBooking({ ...booking, guests: parseInt(e.target.value) })}
                    className="w-full bg-transparent text-sm text-gray-300 outline-none"
                  >
                    {[...Array(listing.guestCount)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-dark-card">{i + 1} guest{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={bookingLoading}
                className="w-full bg-gradient-to-r from-airbnb to-airbnb-dark text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-airbnb/40"
              >
                {bookingLoading ? 'Booking...' : 'Reserve'}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">You won't be charged yet</p>

              {nights > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 underline">${listing.price} × {nights} nights</span>
                    <span className="text-white">${totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 underline">Cleaning fee</span>
                    <span className="text-white">${cleaningFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 underline">DarkBnb service fee</span>
                    <span className="text-white">${serviceFee.toFixed(0)}</span>
                  </div>
                  <div className="border-t border-dark-border pt-3 flex justify-between font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-white">${(totalPrice + cleaningFee + serviceFee).toFixed(0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full image modal */}
      {showAllImages && (
        <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <button
              onClick={() => setShowAllImages(false)}
              className="flex items-center gap-2 text-white mb-6 hover:text-airbnb transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <div className="space-y-4">
              {listing.imageUrls.map((url: string, i: number) => (
                <div key={i} className="relative w-full aspect-video rounded-2xl overflow-hidden">
                  <Image src={url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
