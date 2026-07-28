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
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => { URL.revokeObjectURL(prev[index]); return prev.filter((_, i) => i !== index) })
  }

  const imagesToBase64 = async (files: File[]): Promise<string[]> => {
    return Promise.all(files.map(file => new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const max = 800
          let w = img.width, h = img.height
          if (w > max) { h = (max / w) * h; w = max }
          if (h > max) { w = (max / h) * w; h = max }
          canvas.width = w; canvas.height = h
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/jpeg', 0.6))
        }
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let base64Images: string[] = []
      if (images.length > 0) base64Images = await imagesToBase64(images)

      await addDoc(collection(db, 'products'), {
        name, description,
        price: price ? parseFloat(price) : null, showPrice, category,
        images: base64Images,
        sellerId: user.uid, sellerName, sellerPhone,
        hasWhatsapp, whatsappNumber: hasWhatsapp ? (whatsappNumber || sellerPhone) : null,
        status: 'active', createdAt: new Date().toISOString(),
      })
      router.push('/dashboard')
    } catch (err: any) { setError(err.message || 'Something went wrong.') }
    setLoading(false)
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: '#e33124', color: 'white', fontSize: '12px', padding: '6px 20px', display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>← Dashboard</Link>
        <span>Sell an Item</span>
      </div>

      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e8e8e8', padding: '10px 20px', textAlign: 'center' }}>
        <Link href="/"><img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '24px' }} /></Link>
      </header>

      {/* Form */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#333', marginBottom: '20px' }}>List a Product</h1>

        {error && <div style={{ backgroundColor: '#fff0f0', border: '1px solid #ffcccc', color: '#e33124', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>Product Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="e.g., Vintage Denim Jacket" style={{ width: '100%', padding: '12px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>Category</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Dresses, Shoes, Accessories" style={{ width: '100%', padding: '12px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              placeholder="Describe your product..." style={{ width: '100%', padding: '12px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>Price (K)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01"
              placeholder="0.00" style={{ width: '100%', padding: '12px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#333', cursor: 'pointer' }}>
            <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} style={{ accentColor: '#e33124' }} />
            Show price on product page
          </label>

          {/* Images */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Product Images</label>
            <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageSelect} style={{ display: 'none' }} id="img-upload" />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '2px dashed #ddd', backgroundColor: '#fafafa', color: '#666', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                📸 Choose Photos
              </button>
            </div>
            {imagePreviews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {imagePreviews.map((preview, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeImage(i)}
                      style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', fontSize: '12px', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            style={{ backgroundColor: '#e33124', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1, marginTop: '8px' }}>
            {loading ? 'Listing Product...' : 'List Product'}
          </button>
        </form>
      </div>

      <footer style={{ backgroundColor: '#333', color: '#999', textAlign: 'center', padding: '16px', fontSize: '12px', marginTop: '40px' }}>
        <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '18px', marginBottom: '4px' }} />
        <p>© {new Date().getFullYear()} ba Comesa Marketplace</p>
      </footer>
    </div>
  )
}