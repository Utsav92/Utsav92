import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'DarkBnb – Find Your Perfect Stay',
  description: 'Discover unique places to stay around the world. Book experiences unlike any other.',
  keywords: 'vacation rentals, travel, accommodation, Airbnb alternative',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-black text-white min-h-screen">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#ffffff',
                border: '1px solid #2a2a2a',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
