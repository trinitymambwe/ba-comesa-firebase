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
  const [logoDone, setLogoDone] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [windowWidth, setWindowWidth] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setLogoDone(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const unsub = onAuthStateChanged(auth, (u: any) => setUser(u))
    return () => unsub()
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(24))
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

  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1024
  const isDesktop = windowWidth >= 1024

  if (!mounted) return null

  // LOGO SPLASH SCREEN
  if (!logoDone) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa"
          style={{ width: isMobile ? '140px' : '180px', marginBottom: '20px', animation: 'pulseLogo 1.5s ease-in-out infinite' }} />
        <p style={{ color: '#e33124', fontWeight: 700, fontSize: isMobile ? '14px' : '16px', letterSpacing: '2px' }}>
          Style Meets Community
        </p>
        <style jsx>{`@keyframes pulseLogo { 0%,100% { transform:scale(1); opacity:0.9 } 50% { transform:scale(1.05); opacity:1 } }`}</style>
      </div>
    )
  }

  const gridColumns = isMobile ? 2 : isTablet ? 3 : 5

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* TOP BAR - Hidden on mobile */}
      {!isMobile && (
        <div style={{ backgroundColor: '#e33124', color: 'white', fontSize: '12px', padding: '6px 20px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Zambia's Fashion Marketplace</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            {user ? (
              <span>Welcome, {user.email?.split('@')[0]}</span>
            ) : (
              <>
                <Link href="/auth/login" style={{ color: 'white', textDecoration: 'none' }}>Sign In</Link>
                <Link href="/auth/signup" style={{ color: 'white', textDecoration: 'none' }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e8e8e8', position: 'sticky', top: 0, zIndex: 50, padding: isMobile ? '8px 12px' : '12px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '20px' }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '4px' }}>
              ☰
            </button>
          )}

          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: isMobile ? '24px' : '32px' }} />
          </Link>

          {/* Search - Full width on mobile */}
          {!isMobile && (
            <div style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..." style={{
                  width: '100%', padding: '10px 16px', borderRadius: '20px', border: '2px solid #e33124',
                  outline: 'none', fontSize: '14px', boxSizing: 'border-box',
                }} />
              <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#e33124', fontSize: '18px' }}>🔍</span>
            </div>
          )}

          {/* Desktop Nav */}
          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', whiteSpace: 'nowrap' }}>
              {user ? (
                <>
                  <Link href="/wishlist" style={{ color: '#333', textDecoration: 'none' }}>Wishlist</Link>
                  <Link href="/dashboard" style={{ backgroundColor: '#e33124', color: 'white', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>Dashboard</Link>
                </>
              ) : (
                <Link href="/auth/signup" style={{ backgroundColor: '#e33124', color: 'white', padding: '8px 20px', borderRadius: '20px', textDecoration: 'none', fontWeight: 600 }}>Join Free</Link>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Mobile Search */}
      {isMobile && (
        <div style={{ padding: '8px 12px', backgroundColor: 'white' }}>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..." style={{
              width: '100%', padding: '10px 14px', borderRadius: '20px', border: '2px solid #e33124',
              outline: 'none', fontSize: '14px', boxSizing: 'border-box',
            }} />
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {isMobile && mobileMenuOpen && (
        <div style={{ backgroundColor: 'white', padding: '12px', borderBottom: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {user ? (
            <>
              <Link href="/wishlist" style={{ color: '#333', textDecoration: 'none', padding: '8px 0' }}>♡ Wishlist</Link>
              <Link href="/dashboard" style={{ color: '#e33124', textDecoration: 'none', fontWeight: 600, padding: '8px 0' }}>Dashboard</Link>
              <button onClick={() => signOut(auth)} style={{ color: '#999', background: 'none', border: 'none', textAlign: 'left', padding: '8px 0', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ color: '#333', textDecoration: 'none', padding: '8px 0' }}>Sign In</Link>
              <Link href="/auth/signup" style={{ backgroundColor: '#e33124', color: 'white', padding: '10px', borderRadius: '20px', textDecoration: 'none', fontWeight: 600, textAlign: 'center' }}>Join Free</Link>
            </>
          )}
        </div>
      )}

      {/* HERO - Compact on mobile */}
      {!isMobile && (
        <div style={{ backgroundColor: 'white', margin: '12px 20px', borderRadius: '12px', overflow: 'hidden', maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ background: 'linear-gradient(135deg, #e33124, #ff6600)', padding: '40px', textAlign: 'center', color: 'white' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>Fashion & Accessories</h1>
            <p style={{ opacity: 0.9, fontSize: '16px' }}>Browse thousands of styles from Zambian sellers. Chat directly.</p>
          </div>
        </div>
      )}

      {/* PRODUCT GRID */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '12px' : '0 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '10px' : '16px' }}>
          <h2 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 700, color: '#333' }}>Trending Now</h2>
          {user && <Link href="/products/new" style={{ color: '#e33124', textDecoration: 'none', fontSize: isMobile ? '12px' : '14px', fontWeight: 600 }}>+ Sell</Link>}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '40px 20px' : '60px' }}>
            <img src="https://i.imgur.com/geFkr2n.png" alt="Loading" style={{ width: isMobile ? '60px' : '80px', opacity: 0.5, animation: 'pulseLogo 1.5s ease-in-out infinite' }} />
            <p style={{ color: '#999', marginTop: '12px', fontSize: isMobile ? '12px' : '14px' }}>Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '40px 20px' : '60px', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#999', fontSize: isMobile ? '14px' : '16px' }}>No products found</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            gap: isMobile ? '8px' : '12px',
          }}>
            {filtered.map((p: any) => (
              <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: 'white', borderRadius: isMobile ? '6px' : '8px', overflow: 'hidden',
                  border: '1px solid #eee',
                }}>
                  <div style={{ aspectRatio: '1', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src="https://i.imgur.com/geFkr2n.png" alt="No image" style={{ width: '50%', opacity: 0.15 }} />
                    )}
                    {p.showPrice !== false && p.price && (
                      <span style={{
                        position: 'absolute', bottom: isMobile ? '4px' : '8px', left: isMobile ? '4px' : '8px',
                        backgroundColor: 'rgba(0,0,0,0.7)', color: '#ff6600',
                        padding: isMobile ? '2px 6px' : '2px 8px', borderRadius: '4px',
                        fontSize: isMobile ? '10px' : '12px', fontWeight: 700,
                      }}>
                        K{Number(p.price).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: isMobile ? '6px' : '10px' }}>
                    <p style={{
                      fontSize: isMobile ? '10px' : '11px', color: '#e33124', fontWeight: 600,
                      textTransform: 'uppercase', marginBottom: '2px',
                    }}>{p.category || 'Fashion'}</p>
                    <p style={{
                      fontSize: isMobile ? '11px' : '13px', color: '#333', fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: '2px',
                    }}>{p.name}</p>
                    <p style={{ fontSize: isMobile ? '9px' : '11px', color: '#999' }}>{p.sellerName || 'Unknown'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && user && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white',
          borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-around',
          padding: '8px 0', zIndex: 50,
        }}>
          <Link href="/" style={{ color: '#e33124', textDecoration: 'none', textAlign: 'center', fontSize: '10px', fontWeight: 600 }}>
            <div style={{ fontSize: '20px' }}>🏠</div> Home
          </Link>
          <Link href="/wishlist" style={{ color: '#666', textDecoration: 'none', textAlign: 'center', fontSize: '10px' }}>
            <div style={{ fontSize: '20px' }}>♡</div> Wishlist
          </Link>
          <Link href="/dashboard" style={{ color: '#666', textDecoration: 'none', textAlign: 'center', fontSize: '10px' }}>
            <div style={{ fontSize: '20px' }}>👤</div> Dashboard
          </Link>
        </div>
      )}

      {/* Footer - Hide on mobile */}
      {!isMobile && (
        <footer style={{ backgroundColor: '#333', color: '#999', textAlign: 'center', padding: '24px', fontSize: '13px' }}>
          <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '24px', marginBottom: '8px' }} />
          <p>© {new Date().getFullYear()} ba Comesa Marketplace. All rights reserved.</p>
        </footer>
      )}

      {isMobile && <div style={{ height: '60px' }} />}

      <style jsx>{`
        @keyframes pulseLogo {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  )
}