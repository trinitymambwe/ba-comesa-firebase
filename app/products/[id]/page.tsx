'use client'

import { useEffect, useState, useRef } from 'react'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, collection, addDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [deliveryRequested, setDeliveryRequested] = useState(false)
  const [showDeliveryForm, setShowDeliveryForm] = useState(false)
  const [deliveryName, setDeliveryName] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryLocation, setDeliveryLocation] = useState('')
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

  const handleDeliveryRequest = async () => {
    if (!user) { router.push('/auth/login'); return }
    if (!deliveryName || !deliveryPhone || !deliveryAddress) {
      alert('Please fill in all delivery details')
      return
    }
    await addDoc(collection(db, 'orders'), {
      productId: product.id, productName: product.name,
      productImage: product.images?.[0] || '',
      sellerId: product.sellerId, sellerName: product.sellerName,
      buyerId: user.uid, buyerEmail: user.email,
      buyerName: deliveryName, buyerPhone: deliveryPhone,
      deliveryAddress, deliveryLocation,
      price: product.price, deliveryRequested: true,
      deliveryStatus: 'pending', status: 'pending',
      createdAt: new Date().toISOString(),
    })
    setDeliveryRequested(true)
    setShowDeliveryForm(false)
    setTimeout(() => setDeliveryRequested(false), 3000)
  }

  const scrollToImage = (index: number) => {
    if (scrollRef.current && scrollRef.current.children[index]) {
      scrollRef.current.children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      setCurrentImage(index)
    }
  }

  if (!mounted || loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="https://i.imgur.com/geFkr2n.png" alt="Loading" style={{ width: '60px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
    </div>
  )

  if (!product) return <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Product not found</div>

  const isOwner = user?.uid === product.sellerId
  const images = product.images || []

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ backgroundColor: '#e33124', color: 'white', fontSize: '12px', padding: '6px 20px', display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>← Back to Marketplace</Link>
        <span>{product.category || 'Fashion'}</span>
      </div>

      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e8e8e8', padding: '10px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/"><img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '24px' }} /></Link>
        </div>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
          
          <div style={{ flex: 1, backgroundColor: '#fafafa', position: 'relative' }}>
            {images.length > 0 ? (
              <>
                <div ref={scrollRef} style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
                  {images.map((img: string, i: number) => (
                    <div key={i} style={{ minWidth: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      onClick={() => { setFullscreenImage(i); setFullscreen(true) }}>
                      <img src={img} alt={`${product.name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
                {images.length > 1 && (
                  <>
                    <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                      {images.map((_: string, i: number) => (
                        <button key={i} onClick={() => scrollToImage(i)} style={{
                          width: currentImage === i ? '18px' : '7px', height: '7px', borderRadius: '10px',
                          border: 'none', cursor: 'pointer', backgroundColor: currentImage === i ? '#e33124' : '#ccc', transition: 'all 0.3s',
                        }} />
                      ))}
                    </div>
                    <button onClick={() => scrollToImage(Math.max(0, currentImage - 1))} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>‹</button>
                    <button onClick={() => scrollToImage(Math.min(images.length - 1, currentImage + 1))} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>›</button>
                  </>
                )}
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>{currentImage + 1}/{images.length}</div>
              </>
            ) : (
              <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ddd', fontSize: '48px' }}>📷</div>
            )}
          </div>

          <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '12px', color: '#e33124', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{product.category || 'Fashion'}</p>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#333', marginBottom: '12px', lineHeight: 1.3 }}>{product.name}</h1>

            {product.status === 'sold' && <p style={{ color: '#e33124', fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>⚠️ This item has been sold</p>}

            {product.showPrice !== false && product.price ? (
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#e33124' }}>K{Number(product.price).toLocaleString()}</span>
              </div>
            ) : (
              <p style={{ color: '#999', marginBottom: '16px' }}>Contact seller for price</p>
            )}

            {product.description && <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>{product.description}</p>}

            <div style={{ backgroundColor: '#fafafa', borderRadius: '10px', padding: '14px', marginBottom: '20px', border: '1px solid #eee' }}>
              <p style={{ fontWeight: 600, color: '#333', fontSize: '14px' }}>{product.sellerName || 'Unknown Seller'}</p>
            </div>

            {!isOwner && product.status === 'active' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                <button onClick={() => setShowDeliveryForm(true)}
                  style={{ backgroundColor: deliveryRequested ? '#00c853' : '#e33124', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' }}>
                  {deliveryRequested ? '✅ Delivery Requested!' : '❤️ Love This? Get It Delivered'}
                </button>
              </div>
            )}

            {isOwner && (
              <Link href={`/products/edit/${product.id}`} style={{ marginTop: 'auto', textAlign: 'center', backgroundColor: '#fff5f5', border: '1px solid #e33124', color: '#e33124', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>
                ✏️ Edit Product
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Form Modal */}
      {showDeliveryForm && (
        <div onClick={() => setShowDeliveryForm(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333', marginBottom: '20px' }}>📍 Delivery Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" value={deliveryName} onChange={(e) => setDeliveryName(e.target.value)} placeholder="Full Name" style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
              <input type="tel" value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} placeholder="Phone Number" style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
              <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Delivery Address" style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
              <select value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' }}>
                <option value="">Select Location</option>
                <option value="Lusaka CBD">Lusaka CBD</option>
                <option value="Lusaka East">Lusaka East</option>
                <option value="Lusaka West">Lusaka West</option>
                <option value="Lusaka North">Lusaka North</option>
                <option value="Lusaka South">Lusaka South</option>
                <option value="Kitwe">Kitwe</option>
                <option value="Ndola">Ndola</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowDeliveryForm(false)} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', color: '#666', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeliveryRequest} style={{ flex: 2, padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: '#e33124', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Confirm Delivery Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen */}
      {fullscreen && (
        <div onClick={() => { setFullscreen(false); setZoom(false) }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.96)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => { setFullscreen(false); setZoom(false) }} style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer', zIndex: 201 }}>✕</button>
          <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '14px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 14px', borderRadius: '12px' }}>{fullscreenImage + 1}/{images.length}</div>
          <div onClick={(e) => { e.stopPropagation(); setZoom(!zoom) }} style={{ cursor: zoom ? 'zoom-out' : 'zoom-in', transform: zoom ? 'scale(2.5)' : 'scale(1)', transition: 'transform 0.4s cubic-bezier(0.25,0.8,0.25,1.2)', maxWidth: '90vw', maxHeight: '80vh' }}>
            <img src={images[fullscreenImage]} alt="" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setZoom(false); setFullscreenImage(prev => (prev - 1 + images.length) % images.length) }} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '24px', cursor: 'pointer' }}>‹</button>
              <button onClick={(e) => { e.stopPropagation(); setZoom(false); setFullscreenImage(prev => (prev + 1) % images.length) }} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '24px', cursor: 'pointer' }}>›</button>
            </>
          )}
        </div>
      )}

      <footer style={{ backgroundColor: '#333', color: '#999', textAlign: 'center', padding: '16px', fontSize: '12px', marginTop: '40px' }}>
        <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '18px', marginBottom: '4px' }} />
        <p>© {new Date().getFullYear()} ba Comesa Marketplace</p>
      </footer>
    </div>
  )
}