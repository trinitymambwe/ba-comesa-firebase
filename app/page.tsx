'use client'

import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Link from 'next/link'
import { Search, Heart, ShoppingBag, Zap, Star, Flame, Sparkles, Truck, Crown, MapPin, User, Home, MessageCircle, TrendingUp } from 'lucide-react'
import { useGlobalTheme } from './context/ThemeContext'

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
const { theme } = useGlobalTheme()

  const bgColor = theme.bg
  const cardBg = theme.card
  const accent = theme.accent
  const textColor = theme.text
  const mutedText = theme.muted
  const borderColor = theme.border

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

  const getBadge = (index: number) => {
    const badges = [
      { text: 'Hot', color: '#ff4444', icon: Flame },
      { text: 'Top Rated', color: '#ff9900', icon: Star },
      { text: 'New', color: '#00c853', icon: Sparkles },
      { text: 'Free Delivery', color: '#2196f3', icon: Truck },
      { text: 'Premium', color: '#9c27b0', icon: Crown },
    ]
    return badges[index % badges.length]
  }

  const getStars = (index: number) => {
    const ratings = [4.8, 4.5, 4.9, 4.3, 4.7, 5.0, 4.6, 4.4]
    return ratings[index % ratings.length]
  }

  if (!mounted) return null

  if (!logoDone) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ width: isMobile ? '140px' : '180px', marginBottom: '20px', animation: 'pulseLogo 1.5s ease-in-out infinite' }} />
        <p style={{ color: accent, fontWeight: 700, fontSize: isMobile ? '14px' : '16px', letterSpacing: '2px' }}>Style Meets Community</p>
        <style jsx>{`@keyframes pulseLogo{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.05);opacity:1}}`}</style>
      </div>
    )
  }

  const flashDeals = products.slice(0, 6)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor, color: textColor }}>
      {/* TOP BAR */}
      {!isMobile && (
        <div style={{ backgroundColor: '#060f1a', fontSize: '12px', padding: '6px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: mutedText }}><MapPin size={12} color={accent} /> Zambia</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: mutedText }}><ShoppingBag size={12} color={accent} /> Marketplace</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', color: mutedText }}>
            {user ? (
              <span>Welcome, {user.email?.split('@')[0]}</span>
            ) : (
              <>
                <Link href="/auth/login" style={{ color: mutedText, textDecoration: 'none' }}>Sign In</Link>
                <Link href="/auth/signup" style={{ color: mutedText, textDecoration: 'none' }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, position: 'sticky', top: 0, zIndex: 50, padding: isMobile ? '8px 12px' : '12px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '20px' }}>
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: isMobile ? '24px' : '32px' }} />
          </Link>
          {!isMobile && (
            <div style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                style={{ width: '100%', padding: '10px 45px 10px 16px', borderRadius: '20px', border: `2px solid ${accent}`, outline: 'none', fontSize: '14px', boxSizing: 'border-box', backgroundColor: bgColor, color: textColor }} />
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: accent, color: 'white', padding: '6px 14px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Search size={14} /> Search
              </span>
            </div>
          )}
          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', whiteSpace: 'nowrap' }}>
              {user ? (
                <>
                  <Link href="/wishlist" style={{ color: mutedText, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Heart size={16} color={accent} /> Wishlist
                  </Link>
                  <Link href="/dashboard" style={{ backgroundColor: accent, color: 'white', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', fontWeight: 600, fontSize: '12px' }}>Dashboard</Link>
                </>
              ) : (
                <Link href="/auth/signup" style={{ backgroundColor: accent, color: 'white', padding: '8px 20px', borderRadius: '20px', textDecoration: 'none', fontWeight: 600, fontSize: '12px' }}>Join Free</Link>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* CATEGORY BAR */}
      <div style={{ backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}`, padding: '8px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '24px', fontSize: '13px', overflowX: 'auto' }}>
          {[{ name: 'Dresses', slug: 'dresses' }, { name: 'Shoes', slug: 'shoes' }, { name: 'Bags', slug: 'bags' }, { name: 'Accessories', slug: 'accessories' }, { name: 'Trending', slug: 'trending' }].map(cat => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} style={{ color: mutedText, textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 500 }}>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Search */}
      {isMobile && (
        <div style={{ padding: '8px 12px', backgroundColor: cardBg }}>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..." style={{ width: '100%', padding: '10px 14px', borderRadius: '20px', border: `2px solid ${accent}`, outline: 'none', fontSize: '14px', boxSizing: 'border-box', backgroundColor: bgColor, color: textColor }} />
        </div>
      )}

      {/* FLASH DEALS */}
      {!loading && flashDeals.length > 0 && !isMobile && (
        <div style={{ backgroundColor: cardBg, margin: '12px 20px', borderRadius: '12px', padding: '16px 20px', maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto', border: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Zap size={20} color={accent} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: 0 }}>Flash Deals</h3>
            <span style={{ backgroundColor: accent, color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, animation: 'pulse 1s infinite' }}>ENDING SOON</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {flashDeals.map((p: any) => (
              <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none', minWidth: '160px', flex: '0 0 auto' }}>
                <div style={{ backgroundColor: bgColor, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${borderColor}` }}>
                  <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ShoppingBag size={40} style={{ color: '#4b5563' }} />
                    )}
                  </div>
                  <div style={{ padding: '8px' }}>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: accent, margin: '0 0 2px' }}>
                      K{Number((p.price || 100) * 0.7).toLocaleString()}
                    </p>
                    {p.price && (
                      <p style={{ fontSize: '11px', color: mutedText, textDecoration: 'line-through', margin: '0' }}>
                        K{Number(p.price).toLocaleString()}
                      </p>
                    )}
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
          <h2 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 700, color: textColor, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={20} color={accent} /> Trending Now
          </h2>
          {user && <Link href="/products/new" style={{ color: accent, textDecoration: 'none', fontSize: isMobile ? '12px' : '13px', fontWeight: 600 }}>+ Sell</Link>}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <img src="https://i.imgur.com/geFkr2n.png" alt="Loading" style={{ width: '60px', opacity: 0.5, animation: 'pulseLogo 1.5s infinite' }} />
            <p style={{ color: mutedText, marginTop: '12px', fontSize: '13px' }}>Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${borderColor}` }}>
            <ShoppingBag size={48} style={{ color: '#4b5563', marginBottom: '12px' }} />
            <p style={{ color: mutedText, fontSize: '15px' }}>No products found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridColumns}, 1fr)`, gap: isMobile ? '8px' : '12px' }}>
            {filtered.map((p: any, i: number) => {
              const badge = getBadge(i)
              const stars = getStars(i)
              const isHovered = hoveredProduct === p.id

              return (
                <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none' }}
                  onMouseEnter={() => setHoveredProduct(p.id)}
                  onMouseLeave={() => setHoveredProduct(null)}>
                  <div style={{
                    backgroundColor: cardBg, borderRadius: '8px', overflow: 'hidden',
                    border: isHovered ? `1px solid ${accent}` : `1px solid ${borderColor}`,
                    boxShadow: isHovered ? `0 8px 30px ${accent}15` : 'none',
                    transition: 'all 0.3s ease', transform: isHovered ? 'translateY(-4px)' : 'none', position: 'relative',
                  }}>
                    <div style={{ aspectRatio: '1', backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', transform: isHovered ? 'scale(1.05)' : 'scale(1)' }} />
                      ) : (
                        <ShoppingBag size={40} style={{ color: '#4b5563' }} />
                      )}
                      <span style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: badge.color, color: 'white', padding: '2px 8px', borderRadius: '3px', fontSize: isMobile ? '9px' : '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <badge.icon size={10} /> {badge.text}
                      </span>
                      {p.showPrice !== false && p.price && (
                        <span style={{ position: 'absolute', bottom: '6px', right: '6px', backgroundColor: 'rgba(0,0,0,0.8)', color: accent, padding: '2px 8px', borderRadius: '4px', fontSize: isMobile ? '10px' : '12px', fontWeight: 700 }}>
                          K{Number(p.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: isMobile ? '6px 8px' : '10px 12px' }}>
                      <p style={{ fontSize: isMobile ? '9px' : '11px', color: accent, fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>{p.category || 'Fashion'}</p>
                      <p style={{ fontSize: isMobile ? '10px' : '12px', color: textColor, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', whiteSpace: isMobile ? 'normal' : 'nowrap' }}>{p.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <Star size={isMobile ? 10 : 12} color="#ff9900" fill="#ff9900" />
                        <span style={{ color: '#ff9900', fontSize: isMobile ? '9px' : '10px', fontWeight: 600 }}>{stars}</span>
                        <span style={{ color: mutedText, fontSize: isMobile ? '8px' : '10px' }}>({Math.floor(Math.random() * 500 + 50)})</span>
                      </div>
                      <p style={{ fontSize: isMobile ? '9px' : '11px', color: mutedText }}>{p.sellerName || 'Unknown Seller'}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

     {/* MOBILE BOTTOM NAV */}
{isMobile && user && logoDone && (
  <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: cardBg, borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-around', padding: '6px 0 10px', zIndex: 50 }}>
    <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: accent, textDecoration: 'none', fontSize: '10px', fontWeight: 600 }}>
      <Home size={22} color={accent} /> <span>Home</span>
    </Link>
    <Link href="/wishlist" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: mutedText, textDecoration: 'none', fontSize: '10px' }}>
      <Heart size={22} color={mutedText} /> <span>Wishlist</span>
    </Link>
    <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: mutedText, textDecoration: 'none', fontSize: '10px' }}>
      <User size={22} color={mutedText} /> <span>Account</span>
    </Link>
  </div>
)}
{isMobile && <div style={{ height: '56px' }} />}

      {!isMobile && (
        <footer style={{ backgroundColor: '#060f1a', borderTop: `1px solid ${borderColor}`, textAlign: 'center', padding: '24px', fontSize: '13px', marginTop: '40px' }}>
          <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '24px', marginBottom: '8px' }} />
          <p style={{ color: mutedText }}>© {new Date().getFullYear()} ba Comesa Marketplace. All rights reserved.</p>
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