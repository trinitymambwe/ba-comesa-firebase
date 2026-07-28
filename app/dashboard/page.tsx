'use client'

import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const router = useRouter()

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
    fetchProducts()
  }, [user])

  const markAsSold = async (productId: string) => {
    await updateDoc(doc(db, 'products', productId), { status: 'sold' })
    const snap = await getDocs(query(collection(db, 'products'), where('sellerId', '==', user.uid), orderBy('createdAt', 'desc')))
    setProducts(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })))
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: '#e33124', color: 'white', fontSize: '12px', padding: '6px 20px', display: 'flex', justifyContent: 'space-between' }}>
        <span>My Account</span>
        <button onClick={() => signOut(auth)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
      </div>

      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e8e8e8', padding: '12px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/"><img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '28px' }} /></Link>
          <Link href="/" style={{ color: '#e33124', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>← Browse Marketplace</Link>
        </div>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {/* Welcome */}
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#333', marginBottom: '4px' }}>
          Welcome, {profile?.fullName || 'User'}
        </h1>
        <p style={{ color: '#999', fontSize: '13px', marginBottom: '24px' }}>{user.email}</p>

        {/* My Products */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#333', margin: 0 }}>My Products ({products.length})</h2>
            <Link href="/products/new" style={{ backgroundColor: '#e33124', color: 'white', padding: '10px 20px', borderRadius: '20px', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>
              + Add New Product
            </Link>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p style={{ fontSize: '48px', marginBottom: '12px' }}>📦</p>
              <p>You haven't listed any products yet.</p>
              <Link href="/products/new" style={{ color: '#e33124', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>Sell your first item →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {products.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #eee' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#ccc', fontSize: '20px' }}>📷</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/products/${p.id}`} style={{ fontWeight: 600, color: '#333', textDecoration: 'none', fontSize: '14px' }}>{p.name}</Link>
                    <p style={{ color: '#999', fontSize: '12px', marginTop: '2px' }}>
                      {p.showPrice !== false && p.price ? `K${Number(p.price).toLocaleString()}` : 'Price hidden'}
                      <span style={{
                        marginLeft: '8px', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600,
                        backgroundColor: p.status === 'sold' ? '#fff0f0' : p.status === 'archived' ? '#f0f0f0' : '#f0fff0',
                        color: p.status === 'sold' ? '#e33124' : p.status === 'archived' ? '#999' : '#00c853',
                      }}>{p.status}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {p.status === 'active' && (
                      <button onClick={() => markAsSold(p.id)} style={{ padding: '6px 12px', borderRadius: '16px', border: '1px solid #ff9900', backgroundColor: '#fff8f0', color: '#ff9900', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Mark Sold</button>
                    )}
                    <Link href={`/products/edit/${p.id}`} style={{ padding: '6px 12px', borderRadius: '16px', border: '1px solid #e33124', backgroundColor: '#fff5f5', color: '#e33124', fontSize: '11px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#333', marginBottom: '16px' }}>Profile</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex' }}><span style={{ color: '#999', width: '100px' }}>Name</span><span style={{ color: '#333', fontWeight: 500 }}>{profile?.fullName || 'Not set'}</span></div>
            <div style={{ display: 'flex' }}><span style={{ color: '#999', width: '100px' }}>Email</span><span style={{ color: '#333', fontWeight: 500 }}>{user.email}</span></div>
            <div style={{ display: 'flex' }}><span style={{ color: '#999', width: '100px' }}>Phone</span><span style={{ color: '#333', fontWeight: 500 }}>{profile?.phoneNumber || 'Not set'}</span></div>
            <div style={{ display: 'flex' }}><span style={{ color: '#999', width: '100px' }}>WhatsApp</span><span style={{ color: profile?.hasWhatsapp ? '#00c853' : '#999', fontWeight: 500 }}>{profile?.hasWhatsapp ? 'Available' : 'Not set'}</span></div>
          </div>
        </div>
      </div>

      <footer style={{ backgroundColor: '#333', color: '#999', textAlign: 'center', padding: '16px', fontSize: '12px', marginTop: '40px' }}>
        <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '18px', marginBottom: '4px' }} />
        <p>© {new Date().getFullYear()} ba Comesa Marketplace</p>
      </footer>
    </div>
  )
}