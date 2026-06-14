'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'

const CATEGORIES = ['Apartment', 'Villa', 'Cabin', 'Loft', 'Bungalow', 'Cave House', 'Farmhouse', 'Beach House', 'Treehouse', 'Boat']
const AMENITIES_LIST = ['WiFi', 'Pool', 'Kitchen', 'Parking', 'Pet friendly', 'Air conditioning', 'Fireplace', 'Hot tub', 'Gym', 'Breakfast', 'Ocean views', 'Mountain views', 'City views', 'BBQ', 'Washer', 'Dryer']

export default function NewListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrls: [''],
    category: '',
    roomCount: 1,
    bathroomCount: 1,
    guestCount: 1,
    location: '',
    city: '',
    country: '',
    price: 0,
    amenities: [] as string[],
  })

  if (status === 'loading') return <div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-airbnb border-t-transparent rounded-full" /></div>

  if (!session) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-2">Sign in required</h2>
        <p className="text-gray-400 mb-6">You need to be logged in to list a property.</p>
        <Link href="/auth/login" className="bg-airbnb text-white px-6 py-3 rounded-full font-semibold hover:bg-airbnb-dark transition-colors">Sign in</Link>
      </div>
    </div>
  )

  const handleToggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleAddImage = () => setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }))
  const handleImageChange = (i: number, url: string) => {
    const urls = [...form.imageUrls]
    urls[i] = url
    setForm({ ...form, imageUrls: urls })
  }

  const handleSubmit = async () => {
    const validImages = form.imageUrls.filter((u) => u.trim())
    if (!form.title || !form.description || !form.category || !form.location || !form.city || !form.country) {
      toast.error('Please fill in all required fields')
      return
    }
    if (validImages.length === 0) {
      toast.error('Add at least one image URL')
      return
    }
    if (form.price <= 0) {
      toast.error('Price must be greater than 0')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrls: validImages }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to create listing')
      }

      const listing = await res.json()
      toast.success('Listing created!')
      router.push(`/listings/${listing.id}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-airbnb' : 'bg-dark-border'}`}
            />
          ))}
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">List your property</h1>
        <p className="text-gray-400 mb-8">Step {step} of 3</p>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Basic info</h2>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Property type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`p-3 border rounded-xl text-sm font-medium transition-all ${
                      form.category === cat
                        ? 'border-airbnb bg-airbnb/10 text-white'
                        : 'border-dark-border text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Stunning beachfront villa..."
                className="w-full bg-dark-card border border-dark-border text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-airbnb"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your property in detail..."
                rows={5}
                className="w-full bg-dark-card border border-dark-border text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-airbnb resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Bedrooms', key: 'roomCount' },
                { label: 'Bathrooms', key: 'bathroomCount' },
                { label: 'Max guests', key: 'guestCount' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-white mb-2">{label}</label>
                  <input
                    type="number"
                    min="1"
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) })}
                    className="w-full bg-dark-card border border-dark-border text-white rounded-xl px-4 py-3 focus:outline-none focus:border-airbnb"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Location & pricing</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="New York"
                  className="w-full bg-dark-card border border-dark-border text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-airbnb"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Country *</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="United States"
                  className="w-full bg-dark-card border border-dark-border text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-airbnb"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Full location *</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Manhattan, New York, USA"
                className="w-full bg-dark-card border border-dark-border text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-airbnb"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Price per night (USD) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  min="1"
                  value={form.price || ''}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                  placeholder="100"
                  className="w-full bg-dark-card border border-dark-border text-white placeholder-gray-500 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-airbnb"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES_LIST.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={`flex items-center gap-2 p-3 border rounded-xl text-sm transition-all text-left ${
                      form.amenities.includes(amenity)
                        ? 'border-airbnb bg-airbnb/10 text-white'
                        : 'border-dark-border text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${form.amenities.includes(amenity) ? 'bg-airbnb border-airbnb' : 'border-gray-500'}`}>
                      {form.amenities.includes(amenity) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Photos</h2>
            <p className="text-gray-400 text-sm">Add Unsplash image URLs or any direct image links</p>

            {form.imageUrls.map((url, i) => (
              <div key={i} className="space-y-2">
                <label className="block text-sm font-medium text-white">Image {i + 1} {i === 0 ? '(cover) *' : ''}</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageChange(i, e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-dark-card border border-dark-border text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-airbnb text-sm"
                />
                {url && (
                  <div className="relative h-40 rounded-xl overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => ((e.target as any).style.display = 'none')} />
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddImage}
              className="w-full border border-dashed border-dark-border text-gray-400 py-3 rounded-xl hover:border-airbnb hover:text-airbnb transition-colors text-sm font-medium"
            >
              + Add another photo
            </button>

            {/* Summary */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mt-6">
              <h3 className="font-semibold text-white mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Type</span><span className="text-white">{form.category}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Location</span><span className="text-white">{form.location || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Price</span><span className="text-white">${form.price}/night</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Amenities</span><span className="text-white">{form.amenities.length} selected</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="border border-dark-border text-white px-6 py-3 rounded-xl font-semibold hover:bg-dark-hover transition-colors"
            >
              Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-airbnb text-white px-8 py-3 rounded-xl font-semibold hover:bg-airbnb-dark transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-airbnb text-white px-8 py-3 rounded-xl font-semibold hover:bg-airbnb-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
