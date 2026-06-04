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
  const scrollRef = useRef<HTMLDivElement>(null)

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

  if (!mounted || loading) return <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center">
    <div style={{ textAlign: 'center' }}>
      <div style={{ animation: 'bagFloat 1.2s ease-in-out infinite', fontSize: '50px' }}>🛍️</div>
      <p style={{ color: '#f97316', fontWeight: 'bold', marginTop: '10px' }}>Loading...</p>
    </div>
  </div>

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
            
            {/* IMAGE GALLERY - Facebook Marketplace Style */}
            <div className="relative bg-black">
              {images.length > 0 ? (
                <>
                  {/* Scrollable Images */}
                  <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                  >
                    {images.map((img: string, index: number) => (
                      <div 
                        key={index} 
                        className="min-w-full snap-center flex items-center justify-center"
                        style={{ aspectRatio: '1/1' }}
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} - ${index + 1}`} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Dot Indicators */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      {images.map((_: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => scrollToImage(index)}
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: currentImage === index ? '#f97316' : 'rgba(255,255,255,0.4)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Arrow Buttons */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => scrollToImage(Math.max(0, currentImage - 1))}
                        style={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          fontSize: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => scrollToImage(Math.min(images.length - 1, currentImage + 1))}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          fontSize: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}>
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

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}