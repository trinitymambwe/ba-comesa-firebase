'use client'

import { useEffect, useState, useRef } from 'react'
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
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({})

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

  const nextImage = (e: React.MouseEvent, productId: string, total: number) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveImageIndex(prev => {
      const current = prev[productId] || 0
      return { ...prev, [productId]: (current + 1) % total }
    })
  }

  const prevImage = (e: React.MouseEvent, productId: string, total: number) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveImageIndex(prev => {
      const current = prev[productId] || 0
      return { ...prev, [productId]: (current - 1 + total) % total }
    })
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1b2a', color: '#e0e0e0' }}>
      {/* TOP BAR */}
      <div style={{ backgroundColor: '#091420' }} className="text-xs px-4 py-2 flex justify-between">
        <span style={{ color: '#9ca3af' }}>🇿🇲 Zambia's Fashion Marketplace</span>
        <div className="flex gap-4">
          {user ? (
            <span style={{ color: '#9ca3af' }}>Welcome, {user.email?.split('@')[0]}</span>
          ) : (
            <>
              <Link href="/auth/login" style={{ color: '#9ca3af' }} className="hover:text-orange-400">Sign In</Link>
              <Link href="/auth/signup" style={{ color: '#9ca3af' }} className="hover:text-orange-400">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      {/* HEADER */}
      <header style={{ backgroundColor: '#0a1628', borderBottom: '1px solid #1e3a5f' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span className="text-orange-500 text-3xl">●</span>
            <span style={{ color: '#e0e0e0' }}>ba</span><span className="text-orange-500">Comesa</span>
          </Link>

          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                style={{ backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f', color: '#e0e0e0' }}
                className="w-full rounded-full px-5 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
              <span className="absolute right-4 top-2.5 text-gray-500">🔍</span>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link href="/wishlist" style={{ color: '#9ca3af' }} className="hover:text-orange-400">♡ Wishlist</Link>
                <Link href="/dashboard" className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold hover:bg-orange-600 text-xs">Dashboard</Link>
                <button onClick={() => signOut(auth)} style={{ color: '#9ca3af' }} className="hover:text-red-400 text-xs">Logout</button>
              </>
            ) : (
              <Link href="/auth/signup" className="bg-orange-500 text-white px-5 py-2 rounded-full font-bold hover:bg-orange-600 text-xs">Join Free</Link>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ backgroundColor: '#0a1628', borderBottom: '1px solid #1e3a5f' }}>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4" style={{ color: '#e0e0e0' }}>
            Fashion & Accessories
          </h1>
          <p style={{ color: '#9ca3af' }} className="max-w-xl mx-auto mb-8">
            Browse thousands of styles from local Zambian sellers. Chat directly, no online payments.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <span style={{ backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f', color: '#9ca3af' }} className="px-4 py-2 rounded-full text-sm">👗 Dresses</span>
            <span style={{ backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f', color: '#9ca3af' }} className="px-4 py-2 rounded-full text-sm">👟 Shoes</span>
            <span style={{ backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f', color: '#9ca3af' }} className="px-4 py-2 rounded-full text-sm">👜 Bags</span>
            <span style={{ backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f', color: '#9ca3af' }} className="px-4 py-2 rounded-full text-sm">💍 Accessories</span>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: '#e0e0e0' }}>🔥 Trending Now</h2>
          {user && (
            <Link href="/products/new" className="text-orange-400 text-sm hover:underline">+ Sell Something</Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ animation: 'bagFloat 1.2s ease-in-out infinite', fontSize: '50px' }}>🛍️</div>
              <p style={{ color: '#f97316', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px' }}>Loading products...</p>
              <p style={{ color: '#6b7280', fontSize: '12px' }}><span style={{ color: '#f97316' }}>●</span> ba<span style={{ color: '#f97316' }}>Comesa</span></p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: '#9ca3af' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>🛍️</div>
            <p className="text-lg">No products found</p>
            <Link href="/products/new" className="text-orange-400 mt-2 inline-block">Be the first to sell →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((p: any) => {
              const images = p.images || []
              const currentIdx = activeImageIndex[p.id] || 0
              return (
                <Link key={p.id} href={`/products/${p.id}`} className="group rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg" style={{ backgroundColor: '#0a1628', borderColor: '#1e3a5f' }}>
                  
                  {/* IMAGE SECTION */}
                  <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: '#0d1b2a' }}>
                    {images.length > 0 ? (
                      <>
                        <img src={images[currentIdx]} alt={p.name} className="w-full h-full object-cover" />
                        
                        {/* Left/Right Arrows */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => prevImage(e, p.id, images.length)}
                              style={{
                                position: 'absolute',
                                left: '4px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2,
                              }}
                            >
                              ‹
                            </button>
                            <button
                              onClick={(e) => nextImage(e, p.id, images.length)}
                              style={{
                                position: 'absolute',
                                right: '4px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2,
                              }}
                            >
                              ›
                            </button>
                            
                            {/* Dots */}
                            <div style={{
                              position: 'absolute',
                              bottom: '8px',
                              left: '0',
                              right: '0',
                              display: 'flex',
                              justifyContent: 'center',
                              gap: '5px',
                              zIndex: 2,
                            }}>
                              {images.map((_: string, i: number) => (
                                <div
                                  key={i}
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: i === currentIdx ? '#f97316' : 'rgba(255,255,255,0.5)',
                                  }}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <span style={{ color: '#4b5563', fontSize: '3rem' }}>📷</span>
                    )}

                    {/* Price Tag */}
                    {p.showPrice !== false && p.price && (
                      <span className="absolute top-2 left-2 bg-black/70 text-orange-400 text-xs font-bold px-2 py-1 rounded z-10">
                        K{Number(p.price).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="p-3">
                    <p className="text-xs text-orange-500 font-medium uppercase tracking-wide mb-1">{p.category || 'Fashion'}</p>
                    <h3 className="text-sm font-semibold truncate" style={{ color: '#e0e0e0' }}>{p.name}</h3>
                    <p style={{ color: '#9ca3af' }} className="text-xs mt-1">{p.sellerName || 'Unknown Seller'}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section style={{ backgroundColor: '#091420', borderTop: '1px solid #1e3a5f' }}>
        <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold mb-1" style={{ color: '#e0e0e0' }}>No Online Payments</h3>
            <p style={{ color: '#9ca3af' }} className="text-sm">Chat and deal directly with sellers</p>
          </div>
          <div>
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold mb-1" style={{ color: '#e0e0e0' }}>SMS & WhatsApp</h3>
            <p style={{ color: '#9ca3af' }} className="text-sm">Contact sellers instantly</p>
          </div>
          <div>
            <div className="text-3xl mb-3">🇿🇲</div>
            <h3 className="font-bold mb-1" style={{ color: '#e0e0e0' }}>Local Zambian Sellers</h3>
            <p style={{ color: '#9ca3af' }} className="text-sm">Support your community</p>
          </div>
          <div>
            <div className="text-3xl mb-3">📸</div>
            <h3 className="font-bold mb-1" style={{ color: '#e0e0e0' }}>Camera Upload</h3>
            <p style={{ color: '#9ca3af' }} className="text-sm">Take photos or choose from gallery</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#060f1a', borderTop: '1px solid #1e3a5f' }} className="py-10 text-center text-sm">
        <p className="text-lg font-bold mb-2" style={{ color: '#e0e0e0' }}>
          <span className="text-orange-500">●</span> ba<span className="text-orange-500">Comesa</span>
        </p>
        <p style={{ color: '#6b7280' }}>Zambia's Fashion Marketplace</p>
        <p style={{ color: '#6b7280' }} className="mt-4">© {new Date().getFullYear()} ba Comesa Marketplace. All rights reserved.</p>
      </footer>

      <style jsx>{`
        @keyframes bagFloat {
          0% { transform: translateY(30px); opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}