import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchBar from '@/components/SearchBar'
import ListingCard from '@/components/ListingCard'
import { prisma } from '@/lib/db'

const categories = [
  { icon: '🏖️', label: 'Beach' },
  { icon: '🏔️', label: 'Mountain' },
  { icon: '🏙️', label: 'City' },
  { icon: '🌊', label: 'Lakefront' },
  { icon: '🛖', label: 'Cabin' },
  { icon: '🏰', label: 'Castle' },
  { icon: '🤿', label: 'Diving' },
  { icon: '🌋', label: 'Volcano' },
  { icon: '🌿', label: 'Farm' },
  { icon: '🎿', label: 'Ski-in/out' },
]

async function getListings() {
  try {
    const listings = await prisma.listing.findMany({
      include: {
        host: { select: { id: true, name: true, email: true, image: true } },
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    })
    return listings
  } catch {
    return []
  }
}

export default async function HomePage() {
  const listings = await getListings()

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600"
            alt="Hero"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Find your next<br />
            <span className="text-airbnb">adventure</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Discover unique homes, experiences, and places around the world.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={`/listings?category=${cat.label}`}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
            >
              <div className="w-14 h-14 bg-dark-card border border-dark-border rounded-2xl flex items-center justify-center text-2xl group-hover:border-airbnb group-hover:bg-dark-hover transition-all">
                {cat.icon}
              </div>
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors font-medium whitespace-nowrap">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Featured stays</h2>
            <p className="text-gray-400 mt-1">Handpicked homes around the world</p>
          </div>
          <Link
            href="/listings"
            className="text-sm font-semibold text-white border border-dark-border px-5 py-2.5 rounded-full hover:bg-dark-hover transition-colors"
          >
            View all
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => {
              const images = JSON.parse(listing.imageUrls) as string[]
              const avgRating = listing.reviews.length
                ? listing.reviews.reduce((a, r) => a + r.rating, 0) / listing.reviews.length
                : undefined
              return (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  location={listing.location}
                  price={listing.price}
                  imageUrls={images}
                  rating={avgRating}
                  reviewCount={listing.reviews.length}
                  category={listing.category}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No listings yet</h3>
            <p className="text-gray-400 mb-6">Be the first to list your property!</p>
            <Link
              href="/listings/new"
              className="bg-airbnb text-white px-6 py-3 rounded-full font-semibold hover:bg-airbnb-dark transition-colors"
            >
              List a property
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-dark-card border-y border-dark-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Become a host and<br />
                <span className="text-airbnb">earn extra income</span>
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Join millions of hosts who share their space and earn money doing it. You're in control of your time, prices, and rules.
              </p>
              <Link
                href="/listings/new"
                className="inline-flex items-center gap-2 bg-airbnb hover:bg-airbnb-dark text-white px-8 py-4 rounded-full font-semibold transition-colors text-lg shadow-lg shadow-airbnb/30"
              >
                Get started
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="relative h-80 rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
                alt="Hosting"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-dark-border">
                <p className="text-white font-bold text-2xl">$3,200</p>
                <p className="text-gray-400 text-sm">avg. monthly earnings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: '4M+', label: 'Properties' },
            { number: '220+', label: 'Countries' },
            { number: '1B+', label: 'Guest arrivals' },
            { number: '4.8★', label: 'Avg. rating' },
          ].map((stat) => (
            <div key={stat.label} className="space-y-2">
              <div className="text-4xl font-bold text-airbnb">{stat.number}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
