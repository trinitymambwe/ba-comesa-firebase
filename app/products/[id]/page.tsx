'use client'

import { useEffect, useState, useRef } from 'react'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState(0)
  const [zoom, setZoom] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const unsub = onAuthStateChanged(auth, (u: any) => setUser(u))
    return () => unsub()
  }, [mounted])

  useEffect(() => {
    if (!id || !mounted) return
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, 'products', id as string))
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() })
      setLoading(false)
    }
    fetchProduct()
  }, [id, mounted])

  const handleSmsChat = () => {
    if (!product?.sellerPhone) return
    const msg = encodeURIComponent(`Hi, I'm interested in your "${product.name}" listed on ba Comesa Marketplace`)
    window.location.href = `sms:${product.sellerPhone}?body=${msg}`
  }

  const handleWhatsApp = () => {
    const num = (product?.whatsappNumber || product?.sellerPhone || '').replace(/[\+\s]/g, '')
    const msg = encodeURIComponent(`Hi, I'm interested in your "${product.name}" listed on ba Comesa Marketplace`)
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank')
  }

  const scrollToImage = (index: number) => {
    if (scrollRef.current) {
      const children = scrollRef.current.children
      if (children[index]) {
        children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        setCurrentImage(index)
      }
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft
      const itemWidth = scrollRef.current.offsetWidth
      const index = Math.round(scrollLeft / itemWidth)
      setCurrentImage(index)
    }
  }

  const openFullscreen = (index: number) => {
    setFullscreenImage(index)
    setFullscreen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeFullscreen = () => {
    setFullscreen(false)
    setZoom(false)
    document.body.style.overflow = 'auto'
  }

  const nextFullscreenImage = () => {
    setZoom(false)
    setFullscreenImage(prev => (prev + 1) % (product.images || []).length)
  }

  const prevFullscreenImage = () => {
    setZoom(false)
    const images = product.images || []
    setFullscreenImage(prev => (prev - 1 + images.length) % images.length)
  }

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom(!zoom)
  }

  // Touch handling for swipe vs tap
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent, index: number) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    // Only open fullscreen if it was a tap (minimal swipe)
    if (Math.abs(diff) < 10) {
      openFullscreen(index)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!fullscreen) return
      if (e.key === 'Escape') closeFullscreen()
      if (e.key === 'ArrowRight') nextFullscreenImage()
      if (e.key === 'ArrowLeft') prevFullscreenImage()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [fullscreen, product])

  if (!mounted || loading) return (
    <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center">
      <div style={{ textAlign: 'center' }}>
        <div style={{ animation: 'bagFloat 1.2s ease-in-out infinite', fontSize: '50px' }}>🛍️</div>
        <p style={{ color: '#f97316', fontWeight: 'bold', marginTop: '10px' }}>Loading...</p>
      </div>
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

  if (!product) return <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center text-white">Product not found</div>

  const isOwner = user?.uid === product.sellerId
  const images = product.images || []

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-gray-200">
      <header className="bg-[#0a1628] border-b border-[#1e3a5f] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-black">
            <span className="text-orange-500">●</span> <span style={{ color: '#e0e0e0' }}>ba</span><span className="text-orange-500">Comesa</span>
          </Link>
          <Link href="/" style={{ color: '#9ca3af' }} className="hover:text-white text-sm">← Back</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-0 md:px-4 py-0 md:py-8">
        <div className="bg-[#0a1628] md:rounded-2xl border-0 md:border border-[#1e3a5f] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* IMAGE GALLERY */}
            <div className="relative bg-black select-none">
              {images.length > 0 ? (
                <>
                  <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                  >
                    {images.map((img: string, index: number) => (
                      <div 
                        key={index} 
                        className="min-w-full snap-center flex items-center justify-center relative group"
                        style={{ aspectRatio: '1/1' }}
                        onClick={() => openFullscreen(index)}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={(e) => handleTouchEnd(e, index)}
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} - ${index + 1}`} 
                          className="w-full h-full object-contain pointer-events-none"
                          draggable={false}
                        />
                        {/* Tap to expand hint */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium pointer-events-none">
                            🔍 Tap to expand
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {images.length > 1 && (
                    <>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                        {images.map((_: string, index: number) => (
                          <button
                            key={index}
                            onClick={(e) => { e.stopPropagation(); scrollToImage(index) }}
                            style={{
                              width: currentImage === index ? '20px' : '8px',
                              height: '8px',
                              borderRadius: '10px',
                              backgroundColor: currentImage === index ? '#f97316' : 'rgba(255,255,255,0.4)',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                            }}
                          />
                        ))}
                      </div>

                      <button onClick={(e) => { e.stopPropagation(); scrollToImage(Math.max(0, currentImage - 1)) }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl z-10 hover:bg-black/70">
                        ‹
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); scrollToImage(Math.min(images.length - 1, currentImage + 1)) }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl z-10 hover:bg-black/70">
                        ›
                      </button>
                    </>
                  )}

                  <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                    {currentImage + 1} / {images.length}
                  </div>
                </>
              ) : (
                <div className="aspect-square flex items-center justify-center text-6xl bg-[#0d1b2a]">
                  <span style={{ color: '#4b5563' }}>📷</span>
                </div>
              )}
            </div>

            {/* PRODUCT DETAILS */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-2">{product.category || 'Fashion'}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{product.name}</h1>

                {product.status === 'sold' && (
                  <p className="text-sm text-red-400 font-bold mb-4">⚠️ This item has been sold</p>
                )}

                {product.showPrice !== false && product.price ? (
                  <p className="text-3xl font-bold text-orange-500 mb-4">K{Number(product.price).toLocaleString()}</p>
                ) : (
                  <p className="text-lg text-gray-500 mb-4">Contact seller for price</p>
                )}

                {product.description && (
                  <p className="mb-6 text-gray-400 leading-relaxed">{product.description}</p>
                )}

                <div className="bg-[#0d1b2a] rounded-xl p-4 mb-6 border border-[#1e3a5f]">
                  <p className="font-bold text-white">{product.sellerName || 'Unknown Seller'}</p>
                  {product.sellerPhone && (
                    <p className="text-sm text-gray-400 mt-1">📱 {product.sellerPhone}</p>
                  )}
                </div>
              </div>

              {!isOwner && product.status === 'active' && (
                <div className="space-y-3">
                  {product.sellerPhone && (
                    <button onClick={handleSmsChat} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition">
                      💬 Chat (SMS)
                    </button>
                  )}
                  {product.hasWhatsapp && (product.whatsappNumber || product.sellerPhone) && (
                    <button onClick={handleWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition">
                      💚 Chat on WhatsApp
                    </button>
                  )}
                </div>
              )}

              {isOwner && (
                <Link href={`/products/edit/${product.id}`} className="text-center bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold py-3 rounded-xl hover:bg-orange-500/20 transition">
                  ✏️ Edit Product
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FULLSCREEN OVERLAY */}
      {fullscreen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.96)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={closeFullscreen}
        >
          {/* Close */}
          <button onClick={closeFullscreen}
            className="absolute top-4 right-4 bg-white/10 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl z-50 hover:bg-white/20 backdrop-blur">
            ✕
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-bold z-50 backdrop-blur">
            {fullscreenImage + 1} / {images.length}
          </div>

          {/* Image */}
          <div 
            onClick={toggleZoom}
            style={{
              cursor: zoom ? 'zoom-out' : 'zoom-in',
              transform: zoom ? 'scale(2.5)' : 'scale(1)',
              transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1.2)',
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 201,
            }}
          >
            <img 
              src={images[fullscreenImage]} 
              alt={`${product.name} - ${fullscreenImage + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
              draggable={false}
            />
          </div>

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevFullscreenImage() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl z-50 hover:bg-white/20 backdrop-blur">
                ‹
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextFullscreenImage() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl z-50 hover:bg-white/20 backdrop-blur">
                ›
              </button>
            </>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-6 flex gap-2 z-50" onClick={(e) => e.stopPropagation()}>
              {images.map((img: string, i: number) => (
                <div
                  key={i}
                  onClick={() => { setZoom(false); setFullscreenImage(i) }}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: i === fullscreenImage ? '2px solid #f97316' : '2px solid transparent',
                    opacity: i === fullscreenImage ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}