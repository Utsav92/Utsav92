export interface ListingType {
  id: string
  title: string
  description: string
  imageUrls: string[]
  category: string
  roomCount: number
  bathroomCount: number
  guestCount: number
  location: string
  city: string
  country: string
  price: number
  amenities: string[]
  hostId: string
  host: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  reviews: ReviewType[]
  createdAt: string
}

export interface ReviewType {
  id: string
  rating: number
  comment: string
  userId: string
  user: {
    name: string | null
    image: string | null
  }
  createdAt: string
}

export interface BookingType {
  id: string
  listingId: string
  userId: string
  startDate: string
  endDate: string
  totalPrice: number
  status: string
  listing: {
    title: string
    imageUrls: string[]
    location: string
    price: number
  }
  createdAt: string
}
