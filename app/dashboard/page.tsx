'use client'

import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Settings, Package, ShoppingBag, Clock, CheckCircle, User, Bike, ChevronRight, MessageCircle } from 'lucide-react'
import { useGlobalTheme } from '../context/ThemeContext'
import { updateDoc } from 'firebase/firestore'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const router = useRouter()
  const { theme } = useGlobalTheme()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: any) => {
      if (!u) { router.push('/auth/login'); return }
      setUser(u)
      getDoc(doc(db, 'profiles', u.uid)).then((snap: any) => {
        if (snap.exists()) setProfile(snap.data())
      })
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), where('sellerId', '==', user.uid), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setProducts(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })))
    }
    const fetchOrders = async () => {
      const q = query(collection(db, 'orders'), where('buyerId', '==', user.uid), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setOrders(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })))
    }
    fetchProducts()
    fetchOrders()
  }, [user])

  const markAsSold = async (productId: string) => {
    await updateDoc(doc(db, 'products', productId), { status: 'sold' })
    const snap = await getDocs(query(collection(db, 'products'), where('sellerId', '==', user.uid), orderBy('createdAt', 'desc')))
    setProducts(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })))
  }

  if (!user) return null

  const isSeller = profile?.role === 'seller'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, color: theme.text }}>
      {/* Header */}
      <header style={{ backgroundColor: theme.card, borderBottom: `1px solid ${theme.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '20px', fontWeight: 900, color: theme.accent }}>baComesa</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
          <Link href="/" style={{ color: theme.muted, textDecoration: 'none' }}>Browse</Link>
          <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: theme.muted, textDecoration: 'none' }}>
            <Settings size={16} /> Settings
          </Link>
          <button onClick={() => signOut(auth)} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', color: theme.text }}>Welcome, {profile?.fullName || 'User'}</h1>
        <p style={{ color: theme.muted, marginBottom: '32px' }}>{isSeller ? 'Seller Dashboard' : 'Buyer Dashboard'}</p>

        {/* Buyer Orders */}
        {!isSeller && orders.length > 0 && (
          <div style={{ backgroundColor: theme.card, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: theme.text }}>
              <Package size={20} color={theme.accent} /> My Orders ({orders.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((o: any) => (
                <div key={o.id} style={{ border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontWeight: 700, color: theme.text }}>{o.productName}</p>
                      <p style={{ fontSize: '13px', color: theme.muted }}>Seller: {o.sellerName}</p>
                      {o.price && <p style={{ color: theme.accent, fontWeight: 700 }}>K{Number(o.price).toLocaleString()}</p>}
                    </div>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                      backgroundColor: o.deliveryStatus === 'delivered' ? '#dcfce7' : o.deliveryStatus === 'picked_up' ? '#fef9c3' : o.deliveryStatus === 'assigned' ? '#dbeafe' : theme.border,
                      color: o.deliveryStatus === 'delivered' ? '#166534' : o.deliveryStatus === 'picked_up' ? '#854d0e' : o.deliveryStatus === 'assigned' ? '#1e40af' : theme.muted,
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      {o.deliveryStatus === 'pending' && <Clock size={12} />}
                      {o.deliveryStatus === 'assigned' && <Bike size={12} />}
                      {o.deliveryStatus === 'picked_up' && <Package size={12} />}
                      {o.deliveryStatus === 'delivered' && <CheckCircle size={12} />}
                      {o.deliveryStatus === 'pending' ? 'Waiting' : o.deliveryStatus?.replace('_', ' ') || 'pending'}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                    {['pending', 'assigned', 'picked_up', 'delivered'].map((status, i) => {
                      const statusOrder = ['pending', 'assigned', 'picked_up', 'delivered']
                      const currentIdx = statusOrder.indexOf(o.deliveryStatus || 'pending')
                      const isComplete = i <= currentIdx
                      return (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 0, gap: '4px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            backgroundColor: isComplete ? theme.accent : theme.border,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '12px', fontWeight: 700,
                          }}>
                            {isComplete ? '✓' : i + 1}
                          </div>
                          {i < 3 && (
                            <div style={{ flex: 1, height: '3px', backgroundColor: isComplete && i < currentIdx ? theme.accent : theme.border, borderRadius: '2px' }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: theme.muted }}>
                    <span>Pending</span><span>Assigned</span><span>Picked Up</span><span>Delivered</span>
                  </div>
                  <Link href={`/chat/${o.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px', color: theme.accent, fontWeight: 600, textDecoration: 'none', fontSize: '13px' }}>
                    <MessageCircle size={14} /> Chat with {o.sellerName}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller Products */}
        {isSeller && (
          <div style={{ backgroundColor: theme.card, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={20} color={theme.accent} /> My Products ({products.length})
              </h2>
              <Link href="/products/new" style={{ backgroundColor: theme.accent, color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>+ Add Product</Link>
            </div>
            {products.length === 0 ? (
              <p style={{ color: theme.muted }}>No products yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {products.map((p: any) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: theme.bg, borderRadius: '12px' }}>
                    <Link href={`/products/${p.id}`} style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={24} color={theme.muted} />}
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/products/${p.id}`} style={{ fontWeight: 700, color: theme.text, textDecoration: 'none' }}>{p.name}</Link>
                      <p style={{ fontSize: '12px', color: theme.muted }}>
                        {p.showPrice !== false && p.price ? `K${Number(p.price).toLocaleString()}` : 'Price hidden'}
                        <span style={{
                          marginLeft: '8px', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700,
                          backgroundColor: p.status === 'sold' ? '#fee2e2' : p.status === 'archived' ? theme.border : '#dcfce7',
                          color: p.status === 'sold' ? '#dc2626' : p.status === 'archived' ? theme.muted : '#16a34a',
                        }}>{p.status}</span>
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {p.status === 'active' && (
                        <button onClick={() => markAsSold(p.id)} style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: 'none', borderRadius: '10px', padding: '4px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Mark Sold</button>
                      )}
                      <Link href={`/products/edit/${p.id}`} style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}>Edit</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

{/* Become a Seller Card */}
{!isSeller && (
  <div style={{ backgroundColor: theme.card, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
    <div style={{ width: '60px', height: '60px', borderRadius: '30px', backgroundColor: `${theme.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
      <ShoppingBag size={28} color={theme.accent} />
    </div>
    <h3 style={{ fontWeight: 700, fontSize: '18px', color: theme.text, marginBottom: '4px' }}>Start Selling on baComesa</h3>
    <p style={{ color: theme.muted, fontSize: '13px', marginBottom: '16px' }}>List your fashion items and reach customers across Zambia</p>
    <button
    onClick={async () => {
  alert('Button clicked! Converting to seller...')
  try {
    await updateDoc(doc(db, 'profiles', user.uid), { role: 'seller' })
    alert('Done! Reloading...')
    window.location.reload()
  } catch (err: any) {
    alert('Error: ' + err.message)
  }
}}

      style={{
        backgroundColor: theme.accent, color: 'white', border: 'none',
        padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'
      }}
    >
      <ShoppingBag size={16} /> Become a Seller
    </button>
  </div>
)}

        {/* Profile Card */}
        <div style={{ backgroundColor: theme.card, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: theme.text, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color={theme.accent} /> Profile
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <p style={{ margin: 0 }}><span style={{ color: theme.muted }}>Name:</span> <span style={{ color: theme.text, fontWeight: 700 }}>{profile?.fullName || 'Not set'}</span></p>
            <p style={{ margin: 0 }}><span style={{ color: theme.muted }}>Email:</span> <span style={{ color: theme.text, fontWeight: 700 }}>{user.email}</span></p>
            <p style={{ margin: 0 }}><span style={{ color: theme.muted }}>Role:</span> <span style={{ color: theme.text, fontWeight: 700, textTransform: 'capitalize' }}>{profile?.role}</span></p>
            {profile?.phoneNumber && <p style={{ margin: 0 }}><span style={{ color: theme.muted }}>Phone:</span> <span style={{ color: theme.text, fontWeight: 700 }}>{profile.phoneNumber}</span></p>}
          </div>
        </div>
      </main>
    </div>
  )
}