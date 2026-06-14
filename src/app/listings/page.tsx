'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ListingCard from '@/components/ListingCard'

const CATEGORIES = ['All', 'Apartment', 'Villa', 'Cabin', 'Loft', 'Bungalow', 'Cave House', 'Farmhouse', 'Beach House']
const AMENITIES = ['WiFi', 'Pool', 'Kitchen', 'Parking', 'Pet friendly', 'Air conditioning', 'Fireplace', 'Hot tub']

function ListingsContent() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') ?? 'All',
    minPrice: '',
    maxPrice: '',
    guests: searchParams.get('guests') ?? '',
    location: searchParams.get('location') ?? '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchListings = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.location) params.set('location', filters.location)
    if (filters.category !== 'All') params.set('category', filters.category)
    if (filters.guests) params.set('guests', filters.guests)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)

    const res = await fetch(`/api/listings?${params}`)
    const data = await res.json()
    setListings(data.listings ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }

  useEffect(() => { fetchListings() }, [filters.category, filters.location])

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {filters.location ? `Stays in ${filters.location}` : 'All properties'}
            </h1>
            <p className="text-gray-400 mt-1">{total} properties found</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-dark-border px-4 py-2.5 rounded-full text-sm text-white hover:bg-dark-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilters({ ...filters, category: cat })}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filters.category === cat
                  ? 'bg-airbnb text-white shadow-lg shadow-airbnb/30'
                  : 'bg-dark-card border border-dark-border text-gray-300 hover:border-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-white mb-4">Filters</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Location</label>
                <input
                  type="text"
                  placeholder="City, country..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full bg-dark-card2 border border-dark-border text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-airbnb"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Min price / night</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full bg-dark-card2 border border-dark-border text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-airbnb"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Max price / night</label>
                <input
                  type="number"
                  placeholder="$5000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full bg-dark-card2 border border-dark-border text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-airbnb"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Min guests</label>
                <input
                  type="number"
                  placeholder="1"
                  value={filters.guests}
                  onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
                  className="w-full bg-dark-card2 border border-dark-border text-white placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-airbnb"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={fetchListings}
                className="bg-airbnb text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-airbnb-dark transition-colors"
              >
                Apply filters
              </button>
              <button
                onClick={() => { setFilters({ category: 'All', minPrice: '', maxPrice: '', guests: '', location: '' }); setShowFilters(false) }}
                className="border border-dark-border text-gray-300 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-dark-hover transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Listings grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-dark-card rounded-2xl mb-3" />
                <div className="h-4 bg-dark-card rounded w-3/4 mb-2" />
                <div className="h-3 bg-dark-card rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                location={listing.location}
                price={listing.price}
                imageUrls={listing.imageUrls}
                rating={listing.avgRating}
                reviewCount={listing.reviewCount}
                category={listing.category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No listings found</h3>
            <p className="text-gray-400">Try adjusting your filters or search in a different area.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense>
      <ListingsContent />
    </Suspense>
  )
}
