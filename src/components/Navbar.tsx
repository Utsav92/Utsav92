'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-dark-border backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <svg viewBox="0 0 32 32" className="w-8 h-8 fill-airbnb" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.172-.179h-.011l-.171.179c-2.245 2.42-4.562 3.625-6.93 3.625-3.441 0-6.327-2.432-6.327-6.478 0-1.312.26-2.298.77-3.663l.145-.353c.961-2.207 5.236-11.233 7.1-14.836l.534-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-3.065 2.392l-.577 1.11c-1.906 3.739-6.061 12.285-7.085 14.652l-.202.478c-.458 1.102-.652 1.876-.652 2.909 0 2.891 1.871 4.478 4.327 4.478 1.819 0 3.865-1.16 5.965-3.472l.328-.373c.245-.28.658-.281.904-.001l.328.374c2.05 2.301 4.107 3.472 5.965 3.472 2.443 0 4.357-1.578 4.357-4.478 0-1.018-.195-1.805-.652-2.909l-.203-.478C23.4 16.387 19.236 7.731 17.165 4.502L16.577 3.392C15.565 1.539 14.751 1 13.512 1H16z" />
            </svg>
            <span className="text-airbnb font-bold text-xl hidden sm:block">darkbnb</span>
          </Link>

          {/* Center search pill */}
          <button
            onClick={() => router.push('/listings')}
            className="hidden md:flex items-center gap-4 border border-dark-border rounded-full px-4 py-2 hover:shadow-lg hover:shadow-airbnb/10 transition-all duration-200 bg-dark-card hover:bg-dark-hover"
          >
            <span className="text-sm font-medium text-white">Anywhere</span>
            <span className="w-px h-4 bg-dark-border" />
            <span className="text-sm font-medium text-white">Any week</span>
            <span className="w-px h-4 bg-dark-border" />
            <span className="text-sm text-gray-400">Add guests</span>
            <span className="bg-airbnb text-white p-1.5 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/listings/new"
              className="hidden md:block text-sm font-medium text-white hover:text-airbnb transition-colors px-4 py-2 rounded-full hover:bg-dark-hover"
            >
              Become a Host
            </Link>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 border border-dark-border rounded-full px-3 py-2 hover:shadow-md transition-all duration-200 bg-dark-card hover:bg-dark-hover"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-airbnb flex items-center justify-center text-white text-xs font-bold">
                    {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 w-56 bg-dark-card border border-dark-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  {session ? (
                    <>
                      <div className="px-4 py-3 border-b border-dark-border">
                        <p className="text-sm font-semibold text-white">{session.user?.name}</p>
                        <p className="text-xs text-gray-400">{session.user?.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-dark-hover transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/bookings"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-dark-hover transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        My Bookings
                      </Link>
                      <Link
                        href="/listings/new"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-dark-hover transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        List Your Property
                      </Link>
                      <div className="border-t border-dark-border">
                        <button
                          onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false) }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-dark-hover transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="flex items-center px-4 py-3 text-sm font-semibold text-white hover:bg-dark-hover transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        href="/auth/register"
                        className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-dark-hover transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to close menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </nav>
  )
}
