'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: any) => setUser(u))
    return () => unsub()
  }, [])

  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, 'products', id as string))
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() })
      setLoading(false)
    }
    if (id) fetchProduct()
  }, [id])

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

  if (loading) return <div className="text-center py-20" style={{ color: '#370617' }}>Loading...</div>
  if (!product) return <div className="text-center py-20" style={{ color: '#370617' }}>Product not found</div>

  const isOwner = user?.uid === product.sellerId

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#FFF8F0', borderColor: '#FAA307' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black">
            <span style={{ color: '#E85D04' }}>ba</span> <span style={{ color: '#370617' }}>Comesa</span>
          </Link>
          <Link href="/" className="font-medium" style={{ color: '#370617' }}>← Back</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border" style={{ borderColor: '#FAA307' }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-square flex items-center justify-center text-8xl" style={{ backgroundColor: '#FFF8F0' }}>
              {product.images?.[0] ? (
                <a href={product.images[0]} target="_blank" rel="noopener noreferrer">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" />
                </a>
              ) : '👗'}
            </div>

            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#E85D04' }}>{product.category || 'Fashion'}</p>
                <h1 className="text-3xl font-black mb-4" style={{ color: '#370617' }}>{product.name}</h1>

                {product.showPrice !== false && product.price ? (
                  <p className="text-3xl font-black mb-4" style={{ color: '#E85D04' }}>K{Number(product.price).toLocaleString()}</p>
                ) : (
                  <p className="text-lg mb-4" style={{ color: '#370617', opacity: 0.5 }}>Contact seller for price</p>
                )}

                {product.description && (
                  <p className="mb-6 leading-relaxed" style={{ color: '#370617', opacity: 0.8 }}>{product.description}</p>
                )}

                <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: '#FFF8F0' }}>
                  <p className="font-bold" style={{ color: '#370617' }}>Seller: {product.sellerName || 'Unknown'}</p>
                </div>
              </div>

              {!isOwner && (
                <div className="space-y-3">
                  {product.sellerPhone && (
                    <button onClick={handleSmsChat} className="w-full text-white font-bold py-4 rounded-2xl transition" style={{ backgroundColor: '#E85D04' }}>
                      💬 Chat (SMS)
                    </button>
                  )}
                  {product.hasWhatsapp && (product.whatsappNumber || product.sellerPhone) && (
                    <button onClick={handleWhatsApp} className="w-full font-bold py-4 rounded-2xl transition" style={{ backgroundColor: '#25D366', color: 'white' }}>
                      💚 Chat on WhatsApp
                    </button>
                  )}
                </div>
              )}

              {isOwner && (
                <p className="text-center py-4 rounded-2xl" style={{ backgroundColor: '#FFF8F0', color: '#370617' }}>This is your product listing</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}