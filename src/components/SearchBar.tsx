'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [guests, setGuests] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (guests) params.set('guests', guests)
    router.push(`/listings?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-0 md:gap-0 bg-dark-card border border-dark-border rounded-2xl md:rounded-full overflow-hidden shadow-2xl shadow-black/50 max-w-3xl mx-auto">
      {/* Location */}
      <div className="flex-1 px-6 py-4 border-b md:border-b-0 md:border-r border-dark-border">
        <label className="block text-xs font-semibold text-white mb-1">Where</label>
        <input
          type="text"
          placeholder="Search destinations"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-500 outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {/* Check in */}
      <div className="flex-1 px-6 py-4 border-b md:border-b-0 md:border-r border-dark-border">
        <label className="block text-xs font-semibold text-white mb-1">Check in</label>
        <input
          type="date"
          className="w-full bg-transparent text-sm text-gray-300 outline-none [color-scheme:dark]"
        />
      </div>

      {/* Check out */}
      <div className="flex-1 px-6 py-4 border-b md:border-b-0 md:border-r border-dark-border">
        <label className="block text-xs font-semibold text-white mb-1">Check out</label>
        <input
          type="date"
          className="w-full bg-transparent text-sm text-gray-300 outline-none [color-scheme:dark]"
        />
      </div>

      {/* Guests + Search button */}
      <div className="flex items-center px-4 py-4 gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-white mb-1">Who</label>
          <input
            type="number"
            placeholder="Add guests"
            min="1"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-500 outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-airbnb hover:bg-airbnb-dark text-white p-3 rounded-full transition-colors flex-shrink-0 shadow-lg shadow-airbnb/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
