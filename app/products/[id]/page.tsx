'use client'

import { useEffect, useState, useRef } from 'react'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, collection, addDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  MapPin, Pencil, Heart, ShoppingBag, ChevronLeft, ChevronRight,
  X, ZoomIn, ZoomOut, Truck, Camera, CheckCircle, AlertTriangle, User
} from 'lucide-react'
import LocationPicker from '@/components/LocationPicker'

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
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null)
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null)

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
      deliveryLat, deliveryLng,
      price: product.price, deliveryRequested: true,
      deliveryStatus: 'pending', status: 'pending',
      createdAt: new Date().toISOString(),
    })
    setDeliveryRequested(true)
    setShowDeliveryForm(false)
    setTimeout(() => setDeliveryRequested(false), 3000)
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
      {/* Top Bar */}
      <div style={{ backgroundColor: '#e33124', color: 'white', fontSize: '12px', padding: '6px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ChevronLeft size={14} /> Back to Marketplace
        </Link>
        <span>{product.category || 'Fashion'}</span>
      </div>

      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e8e8e8', padding: '10px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/"><img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '24px' }} /></Link>
        </div>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>

          {/* Image Gallery */}
          <div style={{ display: 'flex', gap: '12px', flex: 1, backgroundColor: '#fafafa', padding: '16px' }}>
            {images.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '400px' }}>
                {images.map((img: string, i: number) => (
                  <div key={i} onClick={() => setCurrentImage(i)}
                    style={{ width: '56px', height: '56px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', border: currentImage === i ? '2px solid #e33124' : '2px solid transparent', opacity: currentImage === i ? 1 : 0.5, transition: 'all 0.2s' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
            <div onClick={() => { if (images.length > 0) { setFullscreenImage(currentImage); setFullscreen(true) } }}
              style={{ flex: 1, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: images.length > 0 ? 'zoom-in' : 'default', backgroundColor: 'white', borderRadius: '8px', position: 'relative' }}>
              {images.length > 0 ? (
                <>
                  <img src={images[currentImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Camera size={12} /> {currentImage + 1}/{images.length}
                  </div>
                  {images.length > 1 && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setCurrentImage(prev => (prev - 1 + images.length) % images.length) }}
                        style={{ position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setCurrentImage(prev => (prev + 1) % images.length) }}
                        style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <ShoppingBag size={48} color="#ddd" />
              )}
            </div>
          </div>

          {/* Product Info */}
          <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '12px', color: '#e33124', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{product.category || 'Fashion'}</p>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#333', marginBottom: '12px', lineHeight: 1.3 }}>{product.name}</h1>

            {product.status === 'sold' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e33124', fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>
                <AlertTriangle size={16} /> This item has been sold
              </div>
            )}

            {product.showPrice !== false && product.price ? (
              <div style={{ marginBottom: '16px' }}><span style={{ fontSize: '28px', fontWeight: 700, color: '#e33124' }}>K{Number(product.price).toLocaleString()}</span></div>
            ) : <p style={{ color: '#999', marginBottom: '16px' }}>Contact seller for price</p>}
            {product.description && <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>{product.description}</p>}

            {/* Seller info */}
            <div style={{ backgroundColor: '#fafafa', borderRadius: '10px', padding: '14px', marginBottom: '20px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="#e33124" />
              <p style={{ fontWeight: 600, color: '#333', fontSize: '14px', margin: 0 }}>{product.sellerName || 'Unknown Seller'}</p>
            </div>

            {/* Action Buttons */}
            {!isOwner && product.status === 'active' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                <button onClick={() => setShowDeliveryForm(true)}
                  style={{
                    backgroundColor: deliveryRequested ? '#00c853' : '#e33124', color: 'white', border: 'none',
                    borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}>
                  {deliveryRequested ? (
                    <><CheckCircle size={18} /> Delivery Requested!</>
                  ) : (
                    <><Heart size={18} /> Love This? Get It Delivered</>
                  )}
                </button>
              </div>
            )}

            {isOwner && (
              <Link href={`/products/edit/${product.id}`}
                style={{
                  marginTop: 'auto', textAlign: 'center', backgroundColor: '#fff5f5', border: '1px solid #e33124',
                  color: '#e33124', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 600,
                  textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                <Pencil size={16} /> Edit Product
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Form Modal with Map Location Picker */}
      {showDeliveryForm && (
        <div onClick={() => setShowDeliveryForm(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="#e33124" /> Delivery Details
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" value={deliveryName} onChange={(e) => setDeliveryName(e.target.value)} placeholder="Full Name" style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
              <input type="tel" value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} placeholder="Phone Number" style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
              {/* Location Picker Button */}
              <button type="button" onClick={() => setShowLocationPicker(true)}
                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', textAlign: 'left', color: deliveryAddress ? '#333' : '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color={deliveryAddress ? '#e33124' : '#999'} />
                {deliveryAddress || 'Tap to choose location on map'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowDeliveryForm(false)} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', color: '#666', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeliveryRequest} style={{ flex: 2, padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: '#e33124', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Truck size={16} /> Confirm Delivery Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Picker Map Modal */}
      {showLocationPicker && (
        <LocationPicker
          onClose={() => setShowLocationPicker(false)}
          onLocationSelected={(data) => {
            setDeliveryAddress(data.address)
            setDeliveryLat(data.lat)
            setDeliveryLng(data.lng)
            setShowLocationPicker(false)
          }}
        />
      )}

      {/* Fullscreen Viewer */}
      {fullscreen && (
        <div onClick={() => { setFullscreen(false); setZoom(false) }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.96)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => { setFullscreen(false); setZoom(false) }} style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 201 }}>
            <X size={20} />
          </button>
          <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '14px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 14px', borderRadius: '12px' }}>
            {fullscreenImage + 1}/{images.length}
          </div>
          <div onClick={(e) => { e.stopPropagation(); setZoom(!zoom) }}
            style={{ cursor: zoom ? 'zoom-out' : 'zoom-in', transform: zoom ? 'scale(2.5)' : 'scale(1)', transition: 'transform 0.4s cubic-bezier(0.25,0.8,0.25,1.2)', maxWidth: '90vw', maxHeight: '80vh' }}>
            <img src={images[fullscreenImage]} alt="" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setZoom(false); setFullscreenImage(prev => (prev - 1 + images.length) % images.length) }}
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setZoom(false); setFullscreenImage(prev => (prev + 1) % images.length) }}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevronRight size={24} />
              </button>
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