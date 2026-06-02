'use client'

import { useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, getDoc, doc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProductPage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [showPrice, setShowPrice] = useState(true)
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sellerName, setSellerName] = useState('')
  const [sellerPhone, setSellerPhone] = useState('')
  const [hasWhatsapp, setHasWhatsapp] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: any) => {
      setUser(u)
      if (u) {
        getDoc(doc(db, 'profiles', u.uid)).then((snap: any) => {
          if (snap.exists()) {
            const p = snap.data()
            setSellerName(p.fullName || '')
            setSellerPhone(p.phoneNumber || '')
            setHasWhatsapp(p.hasWhatsapp || false)
            setWhatsappNumber(p.whatsappNumber || '')
          }
        })
      } else {
        router.push('/auth/login')
      }
    })
    return () => unsub()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'products'), {
        name,
        description,
        price: price ? parseFloat(price) : null,
        showPrice,
        category,
        images: imageUrl ? [imageUrl] : [],
        sellerId: user.uid,
        sellerName,
        sellerPhone,
        hasWhatsapp,
        whatsappNumber: hasWhatsapp ? (whatsappNumber || sellerPhone) : null,
        status: 'active',
        createdAt: new Date().toISOString(),
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#FFF8F0', borderColor: '#FAA307' }}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black"><span style={{ color: '#E85D04' }}>ba</span> <span style={{ color: '#370617' }}>Comesa</span></Link>
          <Link href="/dashboard" className="font-medium" style={{ color: '#370617' }}>← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-8" style={{ color: '#370617' }}>Add New Product</h1>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-6 md:p-8 space-y-5 border" style={{ borderColor: '#FAA307' }}>
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#370617' }}>Product Name *</label>
            <input type="text" value={name} onChange={(e: any) => setName(e.target.value)} required className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2" style={{ borderColor: '#FAA307', color: '#370617' }} placeholder="e.g., Vintage Denim Jacket" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#370617' }}>Category</label>
            <input type="text" value={category} onChange={(e: any) => setCategory(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2" style={{ borderColor: '#FAA307', color: '#370617' }} placeholder="e.g., Dresses, Shoes, Accessories" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#370617' }}>Description</label>
            <textarea value={description} onChange={(e: any) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 resize-none" style={{ borderColor: '#FAA307', color: '#370617' }} placeholder="Describe your product..." />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#370617' }}>Price (K)</label>
            <input type="number" value={price} onChange={(e: any) => setPrice(e.target.value)} min="0" step="0.01" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2" style={{ borderColor: '#FAA307', color: '#370617' }} placeholder="0.00" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showPrice} onChange={(e: any) => setShowPrice(e.target.checked)} />
            <span className="text-sm font-bold" style={{ color: '#370617' }}>Show price on product page</span>
          </label>

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#370617' }}>Image URL</label>
            <input type="url" value={imageUrl} onChange={(e: any) => setImageUrl(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2" style={{ borderColor: '#FAA307', color: '#370617' }} placeholder="https://example.com/image.jpg" />
            <p className="text-xs mt-1" style={{ color: '#370617', opacity: 0.5 }}>Paste an image URL (upload to imgur.com or similar)</p>
          </div>

          <button type="submit" disabled={loading} className="w-full text-white font-bold py-4 rounded-2xl transition" style={{ backgroundColor: '#E85D04' }}>
            {loading ? 'Listing Product...' : 'List Product'}
          </button>
        </form>
      </main>
    </div>
  )
}