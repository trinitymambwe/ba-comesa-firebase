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
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const unsub = onAuthStateChanged(auth, (u: any) => setUser(u))
    return () => unsub()
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(20))
      const snap = await getDocs(q)
      setProducts(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchProducts()
  }, [mounted])

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-gray-200">
      {/* TOP BAR */}
      <div className="bg-[#0f0f1a] text-xs text-gray-400 px-4 py-2 flex justify-between">
        <span>🇿🇲 Zambia's Fashion Marketplace</span>
        <div className="flex gap-4">
          {user ? (
            <span>Welcome, {user.email?.split('@')[0]}</span>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-orange-400">Sign In</Link>
              <Link href="/auth/signup" className="hover:text-orange-400">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      {/* HEADER */}
      <header className="bg-[#16162a] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span className="text-orange-500 text-3xl">●</span>
            <span className="text-white">ba</span><span className="text-orange-500">Comesa</span>
          </Link>

          {/* SEARCH BAR */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-[#0f0f1a] border border-gray-700 rounded-full px-5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
              <span className="absolute right-4 top-2.5 text-gray-500">🔍</span>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link href="/wishlist" className="text-gray-300 hover:text-orange-400">♡ Wishlist</Link>
                <Link href="/dashboard" className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold hover:bg-orange-600 text-xs">Dashboard</Link>
                <button onClick={() => signOut(auth)} className="text-gray-500 hover:text-red-400 text-xs">Logout</button>
              </>
            ) : (
              <Link href="/auth/signup" className="bg-orange-500 text-white px-5 py-2 rounded-full font-bold hover:bg-orange-600 text-xs">Join Free</Link>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-[#16162a] via-[#1a1a3e] to-[#16162a] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Fashion & Accessories
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Browse thousands of styles from local Zambian sellers. Chat directly, no online payments.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="bg-[#0f0f1a] border border-gray-700 px-4 py-2 rounded-full text-sm text-gray-300">👗 Dresses</span>
            <span className="bg-[#0f0f1a] border border-gray-700 px-4 py-2 rounded-full text-sm text-gray-300">👟 Shoes</span>
            <span className="bg-[#0f0f1a] border border-gray-700 px-4 py-2 rounded-full text-sm text-gray-300">👜 Bags</span>
            <span className="bg-[#0f0f1a] border border-gray-700 px-4 py-2 rounded-full text-sm text-gray-300">💍 Accessories</span>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">🔥 Trending Now</h2>
          <Link href="/products/new" className="text-orange-400 text-sm hover:underline">+ Sell Something</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-[#16162a] rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No products found</p>
            <Link href="/products/new" className="text-orange-400 mt-2 inline-block">Be the first to sell →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((p: any) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group bg-[#16162a] rounded-xl overflow-hidden border border-gray-800 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5">
                <div className="aspect-square bg-[#0f0f1a] flex items-center justify-center text-5xl relative overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  ) : (
                    <span className="text-gray-600">📷</span>
                  )}
                  {p.showPrice !== false && p.price && (
                    <span className="absolute bottom-2 left-2 bg-black/70 text-orange-400 text-xs font-bold px-2 py-1 rounded">K{Number(p.price).toLocaleString()}</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-orange-500 font-medium uppercase tracking-wide mb-1">{p.category || 'Fashion'}</p>
                  <h3 className="text-sm font-semibold text-white truncate">{p.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{p.sellerName || 'Unknown Seller'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section className="border-t border-gray-800 bg-[#0f0f1a]">
        <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-white font-bold mb-1">No Online Payments</h3>
            <p className="text-gray-500 text-sm">Chat and deal directly with sellers</p>
          </div>
          <div>
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-white font-bold mb-1">SMS & WhatsApp</h3>
            <p className="text-gray-500 text-sm">Contact sellers instantly</p>
          </div>
          <div>
            <div className="text-3xl mb-3">🇿🇲</div>
            <h3 className="text-white font-bold mb-1">Local Zambian Sellers</h3>
            <p className="text-gray-500 text-sm">Support your community</p>
          </div>
          <div>
            <div className="text-3xl mb-3">📸</div>
            <h3 className="text-white font-bold mb-1">Camera Upload</h3>
            <p className="text-gray-500 text-sm">Take photos or choose from gallery</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a0a14] border-t border-gray-800 py-10 text-center text-gray-600 text-sm">
        <p className="text-lg font-bold text-white mb-2">
          <span className="text-orange-500">●</span> ba<span className="text-orange-500">Comesa</span>
        </p>
        <p>Zambia's Fashion Marketplace</p>
        <p className="mt-4">© {new Date().getFullYear()} ba Comesa Marketplace. All rights reserved.</p>
      </footer>
    </div>
  )
}