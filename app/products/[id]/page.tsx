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
  const [mounted, setMounted] = useState(false)

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

  if (!mounted || loading) return <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center text-white">Loading...</div>
  if (!product) return <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center text-white">Product not found</div>

  const isOwner = user?.uid === product.sellerId

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-gray-200">
      <header className="bg-[#16162a] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-black">
            <span className="text-orange-500">●</span> <span className="text-white">ba</span><span className="text-orange-500">Comesa</span>
          </Link>
          <Link href="/" className="text-gray-400 hover:text-white text-sm">← Back</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-[#16162a] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-square bg-[#0f0f1a] flex items-center justify-center text-6xl">
              {product.images?.[0] ? (
                <a href={product.images[0]} target="_blank" rel="noopener noreferrer">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover hover:opacity-90 transition" />
                </a>
              ) : '📷'}
            </div>

            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-2">{product.category || 'Fashion'}</p>
                <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>

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

                <div className="bg-[#0f0f1a] rounded-xl p-4 mb-6 border border-gray-700">
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
                <div className="flex gap-3">
                  <Link href={`/products/edit/${product.id}`} className="flex-1 text-center bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold py-3 rounded-xl hover:bg-orange-500/20 transition">
                    ✏️ Edit Product
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}