'use client'

import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Link from 'next/link'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const unsub = onAuthStateChanged(auth, (u: any) => setUser(u))
    return () => unsub()
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(12))
      const snap = await getDocs(q)
      const list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
      setProducts(list)
      setLoading(false)
    }
    fetchProducts()
  }, [mounted])

  if (!mounted) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#FFF8F0', borderColor: '#FAA307' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-3xl font-black tracking-tight">
            <span style={{ color: '#E85D04' }}>ba</span>{' '}
            <span style={{ color: '#370617' }}>Comesa</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <Link href="/wishlist" className="font-medium" style={{ color: '#370617' }}>♡ Wishlist</Link>
                <Link href="/dashboard" className="text-white px-4 py-2 rounded-full font-bold" style={{ backgroundColor: '#E85D04' }}>Dashboard</Link>
                <button onClick={() => signOut(auth)} className="font-medium" style={{ color: '#370617' }}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="font-medium" style={{ color: '#370617' }}>Sign In</Link>
                <Link href="/auth/signup" className="text-white px-5 py-2 rounded-full font-bold" style={{ backgroundColor: '#E85D04' }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: '#06D6A0', color: '#370617' }}>
          🇿🇲 Zambia's Fashion Marketplace
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6" style={{ color: '#370617' }}>
          Find Your <span style={{ color: '#E85D04' }}>Style</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: '#370617', opacity: 0.7 }}>
          Browse outfits & accessories from local sellers. Chat directly on SMS or WhatsApp.
        </p>
        {!user && (
          <Link href="/auth/signup" className="inline-block text-white text-lg font-bold px-8 py-4 rounded-full" style={{ backgroundColor: '#E85D04' }}>
            Join ba Comesa — It's Free
          </Link>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-black mb-8" style={{ color: '#370617' }}>Latest Products</h2>
        {loading ? (
          <p style={{ color: '#370617' }}>Loading...</p>
        ) : products.length === 0 ? (
          <p style={{ color: '#370617', opacity: 0.5 }}>No products yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.map((p: any) => (
              <Link key={p.id} href={`/products/${p.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: '#FAA307' }}>
                <div className="aspect-square flex items-center justify-center text-5xl" style={{ backgroundColor: '#FFF8F0' }}>
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : '👗'}
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase" style={{ color: '#E85D04' }}>{p.category || 'Fashion'}</p>
                  <h3 className="font-bold truncate" style={{ color: '#370617' }}>{p.name}</h3>
                  {p.showPrice !== false && p.price && <p className="font-black" style={{ color: '#E85D04' }}>K{Number(p.price).toLocaleString()}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}