'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sellerName, setSellerName] = useState('')
  const [sellerPhone, setSellerPhone] = useState('')
  const [hasWhatsapp, setHasWhatsapp] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setImages(prev => [...prev, ...files])

    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const imagesToBase64 = async (files: File[]): Promise<string[]> => {
    const promises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const maxWidth = 800
            const maxHeight = 800
            let width = img.width
            let height = img.height

            if (width > maxWidth) {
              height = (maxWidth / width) * height
              width = maxWidth
            }
            if (height > maxHeight) {
              width = (maxHeight / height) * width
              height = maxHeight
            }

            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', 0.6))
          }
          img.src = e.target?.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    })
    return Promise.all(promises)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let base64Images: string[] = []

      if (images.length > 0) {
        base64Images = await imagesToBase64(images)
      }

      await addDoc(collection(db, 'products'), {
        name,
        description,
        price: price ? parseFloat(price) : null,
        showPrice,
        category,
        images: base64Images,
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
      setError(err.message || 'Something went wrong. Try smaller images.')
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
            <label className="block text-sm font-bold mb-2" style={{ color: '#370617' }}>Product Images</label>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />

            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute('capture', 'environment')
                    fileInputRef.current.click()
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition"
                style={{ borderColor: '#E85D04', color: '#E85D04' }}
              >
                📸 Take Photo
              </button>

              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture')
                    fileInputRef.current.click()
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition"
                style={{ borderColor: '#370617', color: '#370617' }}
              >
                🖼️ Choose from Device
              </button>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full text-white font-bold py-4 rounded-2xl transition" style={{ backgroundColor: '#E85D04' }}>
            {loading ? 'Listing Product...' : 'List Product'}
          </button>
        </form>
      </main>
    </div>
  )
}