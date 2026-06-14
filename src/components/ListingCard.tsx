'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface Props {
  id: string
  title: string
  location: string
  price: number
  imageUrls: string[]
  rating?: number
  reviewCount?: number
  category: string
}

export default function ListingCard({ id, title, location, price, imageUrls, rating, reviewCount, category }: Props) {
  const [currentImage, setCurrentImage] = useState(0)
  const [liked, setLiked] = useState(false)

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentImage((prev) => (prev + 1) % imageUrls.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentImage((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
  }

  return (
    <Link href={`/listings/${id}`} className="group block">
      <div className="relative rounded-2xl overflow-hidden aspect-square bg-dark-card">
        {imageUrls[currentImage] && (
          <Image
            src={imageUrls[currentImage]}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Like button */}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked) }}
          className="absolute top-3 right-3 z-10 p-1.5 transition-transform hover:scale-110"
        >
          <svg
            className={`w-6 h-6 drop-shadow-lg transition-colors ${liked ? 'fill-airbnb stroke-airbnb' : 'fill-black/20 stroke-white'}`}
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Category badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          {category}
        </div>

        {/* Image nav buttons */}
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {imageUrls.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImage ? 'bg-white w-3' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1 flex-1">{title}</h3>
          {rating && (
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm text-white">{rating.toFixed(1)}</span>
              {reviewCount && <span className="text-sm text-gray-400">({reviewCount})</span>}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-400">{location}</p>
        <p className="text-sm text-white">
          <span className="font-semibold">${price}</span>
          <span className="text-gray-400"> /night</span>
        </p>
      </div>
    </Link>
  )
}
