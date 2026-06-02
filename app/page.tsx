'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Link from 'next/link'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

 useEffect(() => {
   const unsub = onAuthStateChanged(auth, (u: any) => setUser(u))
    return () => unsub()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(12))
      const snap = await getDocs(q)
      const list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
      setProducts(list)
      setLoading(false)
    }
    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#FFF8F0', borderColor: '#FAA307' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-3xl font-black tracking-tight">
            <span style={{ color: '#E85D04' }}>ba</span>{' '}
            <span style={{ color: '#370617' }}>Comesa</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link href="/wishlist" className="font-medium hover:underline" style={{ color: '#370617' }}>♡ Wishlist</Link>
                <Link href="/dashboard" className="text-white px-5 py-2 rounded-full font-bold transition" style={{ backgroundColor: '#E85D04' }}>Dashboard</Link>
                <button onClick={() => signOut(auth)} className="font-medium hover:underline" style={{ color: '#370617' }}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="font-medium hover:underline" style={{ color: '#370617' }}>Sign In</Link>
                <Link href="/auth/signup" className="text-white px-5 py-2 rounded-full font-bold transition" style={{ backgroundColor: '#E85D04' }}>Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)} style={{ color: '#370617' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-3" style={{ backgroundColor: '#FFF8F0' }}>
            {user ? (
              <>
                <Link href="/wishlist" className="block font-medium" style={{ color: '#370617' }}>♡ Wishlist</Link>
                <Link href="/dashboard" className="block font-bold" style={{ color: '#E85D04' }}>Dashboard</Link>
                <button onClick={() => signOut(auth)} className="block font-medium" style={{ color: '#370617' }}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block font-medium" style={{ color: '#370617' }}>Sign In</Link>
                <Link href="/auth/signup" className="block font-bold" style={{ color: '#E85D04' }}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: '#06D6A0', color: '#370617' }}>
          🇿🇲 Zambia's Fashion Marketplace
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight" style={{ color: '#370617' }}>
          Find Your{' '}
          <span style={{ color: '#E85D04' }}>Style</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: '#370617', opacity: 0.7 }}>
          Browse outfits & accessories from local sellers. Chat directly on SMS or WhatsApp — no online payments, just real connections.
        </p>
        {!user && (
          <Link href="/auth/signup" className="inline-block text-white text-lg font-bold px-8 py-4 rounded-full transition shadow-lg" style={{ backgroundColor: '#E85D04' }}>
            Join ba Comesa — It's Free
          </Link>
        )}
        {user && (
          <Link href="/dashboard" className="inline-block text-white text-lg font-bold px-8 py-4 rounded-full transition shadow-lg" style={{ backgroundColor: '#E85D04' }}>
            Go to Dashboard
          </Link>
        )}
      </section>

      {/* PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-black" style={{ color: '#370617' }}>Latest Drops</h2>
          <Link href="/products" className="font-bold text-sm hover:underline" style={{ color: '#E85D04' }}>View All →</Link>
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ color: '#370617', opacity: 0.5 }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 rounded-3xl" style={{ backgroundColor: '#FAA307', opacity: 0.1 }}>
            <p className="text-lg" style={{ color: '#370617', opacity: 0.6 }}>No products yet. Be the first to sell!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p: any) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border" style={{ borderColor: '#FAA307', borderWidth: 1 }}>
                <div className="aspect-square flex items-center justify-center text-6xl" style={{ backgroundColor: '#FFF8F0' }}>
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    '👗'
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#E85D04' }}>{p.category || 'Fashion'}</p>
                  <h3 className="font-bold truncate" style={{ color: '#370617' }}>{p.name}</h3>
                  {p.showPrice !== false && p.price ? (
                    <p className="font-black mt-1" style={{ color: '#E85D04' }}>K{Number(p.price).toLocaleString()}</p>
                  ) : (
                    <p className="text-sm mt-1" style={{ color: '#370617', opacity: 0.4 }}>Contact for price</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section className="py-20" style={{ backgroundColor: '#370617' }}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#FAA307' }}>Chat Directly</h3>
            <p style={{ color: '#FFF8F0', opacity: 0.7 }}>SMS or WhatsApp the seller instantly. No middleman.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">🇿🇲</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#FAA307' }}>Local Sellers</h3>
            <p style={{ color: '#FFF8F0', opacity: 0.7 }}>Support Zambian vendors. Fashion from your community.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#FAA307' }}>No Online Payments</h3>
            <p style={{ color: '#FFF8F0', opacity: 0.7 }}>Browse, chat, and deal in person. Simple and safe.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-sm" style={{ backgroundColor: '#FFF8F0', color: '#370617', opacity: 0.5 }}>
        © {new Date().getFullYear()} ba Comesa Marketplace — Zambia's Fashion Hub
      </footer>
    </div>
  )
}