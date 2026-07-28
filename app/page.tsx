'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
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
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [page, setPage] = useState(1)

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
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(50))
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
  const gridColumns = isMobile ? 2 : isTablet ? 3 : 5

  // Generate random badge for demo
  const getBadge = (index: number) => {
    const badges = [
      { text: '🔥 Hot', color: '#ff4444' },
      { text: '⭐ Top Rated', color: '#ff9900' },
      { text: '🆕 New', color: '#00c853' },
      { text: '🚚 Free Delivery', color: '#2196f3' },
      { text: '💎 Premium', color: '#9c27b0' },
    ]
    return badges[index % badges.length]
  }

  // Generate fake star rating
  const getStars = (index: number) => {
    const ratings = [4.8, 4.5, 4.9, 4.3, 4.7, 5.0, 4.6, 4.4]
    return ratings[index % ratings.length]
  }

  const generateStars = (rating: number) => {
    const full = Math.floor(rating)
    const half = rating % 1 >= 0.5 ? 1 : 0
    const empty = 5 - full - half
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty)
  }

  if (!mounted) return null

  if (!logoDone) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ width: isMobile ? '140px' : '180px', marginBottom: '20px', animation: 'pulseLogo 1.5s ease-in-out infinite' }} />
        <p style={{ color: '#e33124', fontWeight: 700, fontSize: isMobile ? '14px' : '16px', letterSpacing: '2px' }}>Style Meets Community</p>
        <style jsx>{`@keyframes pulseLogo{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.05);opacity:1}}`}</style>
      </div>
    )
  }

  // Flash deals - first 6 products
  const flashDeals = products.slice(0, 6)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* TOP BAR */}
      {!isMobile && (
        <div style={{ backgroundColor: '#e33124', color: 'white', fontSize: '12px', padding: '6px 20px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>🇿🇲 Zambia</span>
            <span>📱 Download App</span>
            <span>💬 Live Chat</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {user ? (
              <span>Welcome, {user.email?.split('@')[0]}</span>
            ) : (
              <>
                <Link href="/auth/login" style={{ color: 'white', textDecoration: 'none' }}>Sign In</Link>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
                <Link href="/auth/signup" style={{ color: 'white', textDecoration: 'none' }}>Sign Up</Link>
              </>
            )}
            <Link href="/admin" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '11px' }}>Admin</Link>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e8e8e8', position: 'sticky', top: 0, zIndex: 50, padding: isMobile ? '8px 12px' : '12px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '20px' }}>
          {isMobile && (
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '4px' }}>☰</button>
          )}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: isMobile ? '24px' : '32px' }} />
          </Link>
          {!isMobile && (
            <div style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="I'm shopping for..." style={{
                  width: '100%', padding: '10px 45px 10px 16px', borderRadius: '20px', border: '2px solid #e33124',
                  outline: 'none', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fafafa',
                }} />
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: '#e33124', color: 'white', padding: '6px 14px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer' }}>Search</span>
            </div>
          )}
          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', whiteSpace: 'nowrap' }}>
              {user ? (
                <>
                  <Link href="/wishlist" style={{ color: '#333', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ♡ <span>Wishlist</span>
                  </Link>
                  <Link href="/dashboard" style={{ backgroundColor: '#e33124', color: 'white', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', fontWeight: 600, fontSize: '12px' }}>My Account</Link>
                </>
              ) : (
                <Link href="/auth/signup" style={{ backgroundColor: '#e33124', color: 'white', padding: '8px 20px', borderRadius: '20px', textDecoration: 'none', fontWeight: 600, fontSize: '12px' }}>Join Free</Link>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Mobile Search */}
      {isMobile && (
        <div style={{ padding: '8px 12px', backgroundColor: 'white' }}>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="I'm shopping for..." style={{
              width: '100%', padding: '10px 14px', borderRadius: '20px', border: '2px solid #e33124',
              outline: 'none', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fafafa',
            }} />
        </div>
      )}

      {/* Mobile Menu */}
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

      {/* FLASH DEALS BAR - AliExpress Style */}
      {!loading && flashDeals.length > 0 && !isMobile && (
        <div style={{ backgroundColor: 'white', margin: '12px 20px', borderRadius: '12px', padding: '16px 20px', maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#333', margin: 0 }}>Flash Deals</h3>
            <span style={{ backgroundColor: '#e33124', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, animation: 'pulse 1s infinite' }}>ENDING SOON</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {flashDeals.map((p: any, i: number) => (
              <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none', minWidth: '160px', flex: '0 0 auto' }}>
                <div style={{ backgroundColor: '#fafafa', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                  <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src="https://i.imgur.com/geFkr2n.png" alt="" style={{ width: '50%', opacity: 0.15 }} />
                    )}
                  </div>
                  <div style={{ padding: '8px' }}>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#e33124', margin: '0 0 2px' }}>
                      K{Number((p.price || 100) * 0.7).toLocaleString()}
                    </p>
                    {p.price && (
                      <p style={{ fontSize: '11px', color: '#999', textDecoration: 'line-through', margin: '0' }}>
                        K{Number(p.price).toLocaleString()}
                      </p>
                    )}
                    <p style={{ fontSize: '10px', color: '#e33124', fontWeight: 600, marginTop: '4px' }}>
                      {Math.floor(Math.random() * 80 + 10)}% OFF
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* MAIN PRODUCT GRID */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '12px' : '12px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '10px' : '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 700, color: '#333', margin: 0 }}>Trending Now</h2>
            <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
              {['All', 'Dresses', 'Shoes', 'Bags', 'Accessories'].map(cat => (
                <span key={cat} style={{ 
                  color: cat === 'All' ? '#e33124' : '#666', 
                  cursor: 'pointer', 
                  fontWeight: cat === 'All' ? 600 : 400,
                  borderBottom: cat === 'All' ? '2px solid #e33124' : 'none',
                  paddingBottom: '2px',
                }}>{cat}</span>
              ))}
            </div>
          </div>
          {user && <Link href="/products/new" style={{ color: '#e33124', textDecoration: 'none', fontSize: isMobile ? '12px' : '13px', fontWeight: 600 }}>+ Sell</Link>}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '40px 20px' : '60px' }}>
            <img src="https://i.imgur.com/geFkr2n.png" alt="Loading" style={{ width: isMobile ? '60px' : '80px', opacity: 0.5, animation: 'pulseLogo 1.5s ease-in-out infinite' }} />
            <p style={{ color: '#999', marginTop: '12px', fontSize: isMobile ? '12px' : '14px' }}>Discovering amazing deals...</p>
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
            {filtered.map((p: any, i: number) => {
              const badge = getBadge(i)
              const stars = getStars(i)
              const isHovered = hoveredProduct === p.id

              return (
                <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none' }}
                  onMouseEnter={() => setHoveredProduct(p.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div style={{
                    backgroundColor: 'white', borderRadius: isMobile ? '6px' : '8px', overflow: 'hidden',
                    border: isHovered ? '1px solid #e33124' : '1px solid #eee',
                    boxShadow: isHovered ? '0 8px 30px rgba(227,49,36,0.15)' : 'none',
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'translateY(-4px)' : 'none',
                    position: 'relative',
                  }}>
                    {/* Product Image */}
                    <div style={{ aspectRatio: '1', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', transform: isHovered ? 'scale(1.05)' : 'scale(1)' }} />
                      ) : (
                        <img src="https://i.imgur.com/geFkr2n.png" alt="" style={{ width: '50%', opacity: 0.15 }} />
                      )}

                      {/* Badge */}
                      <span style={{
                        position: 'absolute', top: '6px', left: '6px',
                        backgroundColor: badge.color, color: 'white',
                        padding: '2px 8px', borderRadius: '3px', fontSize: isMobile ? '9px' : '10px', fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}>{badge.text}</span>

                      {/* Quick View Overlay */}
                      {isHovered && !isMobile && (
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                          padding: '20px 8px 8px', color: 'white', textAlign: 'center',
                          fontSize: '12px', fontWeight: 600,
                        }}>
                          Quick View
                        </div>
                      )}

                      {/* Price Tag */}
                      {p.showPrice !== false && p.price && (
                        <span style={{
                          position: 'absolute', bottom: '6px', right: '6px',
                          backgroundColor: 'rgba(0,0,0,0.75)', color: '#ff6600',
                          padding: '2px 8px', borderRadius: '4px', fontSize: isMobile ? '10px' : '12px', fontWeight: 700,
                        }}>
                          K{Number(p.price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div style={{ padding: isMobile ? '6px 8px' : '10px 12px' }}>
                      <p style={{
                        fontSize: isMobile ? '9px' : '11px', color: '#e33124', fontWeight: 600,
                        textTransform: 'uppercase', marginBottom: '2px',
                      }}>{p.category || 'Fashion'}</p>
                      <p style={{
                        fontSize: isMobile ? '10px' : '12px', color: '#333', fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        marginBottom: '4px', lineHeight: '1.3',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        whiteSpace: isMobile ? 'normal' : 'nowrap',
                      }}>{p.name}</p>

                      {/* Stars */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <span style={{ color: '#ff9900', fontSize: isMobile ? '9px' : '10px' }}>
                          {generateStars(stars)}
                        </span>
                        <span style={{ color: '#999', fontSize: isMobile ? '8px' : '10px' }}>({Math.floor(Math.random() * 500 + 50)})</span>
                      </div>

                      <p style={{ fontSize: isMobile ? '9px' : '11px', color: '#999' }}>{p.sellerName || 'Unknown Seller'}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Load More */}
        {filtered.length > 20 && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button onClick={() => setPage(p => p + 1)}
              style={{
                backgroundColor: 'white', border: '1px solid #e33124', color: '#e33124',
                padding: '12px 40px', borderRadius: '24px', cursor: 'pointer',
                fontWeight: 600, fontSize: '14px',
              }}>
              Load More Products ↓
            </button>
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
            <div style={{ fontSize: '20px' }}>👤</div> Account
          </Link>
        </div>
      )}

      {!isMobile && (
        <footer style={{ backgroundColor: '#333', color: '#999', textAlign: 'center', padding: '24px', fontSize: '13px', marginTop: '40px' }}>
          <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '24px', marginBottom: '8px' }} />
          <p>© {new Date().getFullYear()} ba Comesa Marketplace. All rights reserved.</p>
        </footer>
      )}

      {isMobile && <div style={{ height: '60px' }} />}

      <style jsx>{`
        @keyframes pulseLogo { 0%,100% { transform:scale(1); opacity:.9 } 50% { transform:scale(1.05); opacity:1 } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.7 } }
      `}</style>
    </div>
  )
}