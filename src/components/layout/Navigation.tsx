'use client'

import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="border-b border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-headline text-accent">
            fotoluvstudio
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/gallery" className="text-text-muted hover:text-accent transition-colors">
              Gallery
            </Link>
            <Link href="/shop" className="text-text-muted hover:text-accent transition-colors">
              Shop
            </Link>
            <Link href="/fashion" className="text-text-muted hover:text-accent transition-colors">
              Fashion
            </Link>
            <Link href="/about" className="text-text-muted hover:text-accent transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-gold hover:text-gold-dark transition-colors font-medium">
              Gold
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="text-text-muted hover:text-text">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-2 px-4">
                Sign In
              </Link>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/gallery" className="block py-2 text-text-muted" onClick={() => setIsOpen(false)}>Gallery</Link>
            <Link href="/shop" className="block py-2 text-text-muted" onClick={() => setIsOpen(false)}>Shop</Link>
            <Link href="/fashion" className="block py-2 text-text-muted" onClick={() => setIsOpen(false)}>Fashion</Link>
            <Link href="/about" className="block py-2 text-text-muted" onClick={() => setIsOpen(false)}>About</Link>
            <Link href="/pricing" className="block py-2 text-gold" onClick={() => setIsOpen(false)}>Gold</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block py-2 text-accent font-medium" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <button onClick={() => { handleSignOut(); setIsOpen(false) }} className="block py-2 text-text-muted">Sign Out</button>
              </>
            ) : (
              <Link href="/login" className="block py-2 text-accent font-medium" onClick={() => setIsOpen(false)}>Sign In</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
