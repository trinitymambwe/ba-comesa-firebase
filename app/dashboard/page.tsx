'use client'

import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore'
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

  if (!user) return null

  const isSeller = profile?.role === 'seller'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#FFF8F0', borderColor: '#FAA307' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black"><span style={{ color: '#E85D04' }}>ba</span> <span style={{ color: '#370617' }}>Comesa</span></Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="font-medium" style={{ color: '#370617' }}>Browse</Link>
            <button onClick={() => signOut(auth)} className="font-medium" style={{ color: '#E85D04' }}>Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: '#370617' }}>Welcome, {profile?.fullName || 'User'}</h1>
        <p className="mb-8" style={{ color: '#370617', opacity: 0.6 }}>{isSeller ? 'Seller Dashboard' : 'Buyer Dashboard'}</p>

        {isSeller && (
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-8 border" style={{ borderColor: '#FAA307' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black" style={{ color: '#370617' }}>My Products</h2>
              <Link href="/products/new" className="text-white font-bold px-5 py-2 rounded-full transition" style={{ backgroundColor: '#E85D04' }}>+ Add Product</Link>
            </div>
            {products.length === 0 ? (
              <p style={{ color: '#370617', opacity: 0.5 }}>No products yet. Start selling!</p>
            ) : (
              <div className="space-y-3">
                {products.map(p => (
                  <Link key={p.id} href={`/products/${p.id}`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition" style={{ backgroundColor: '#FFF8F0' }}>
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{ backgroundColor: '#FAA307', opacity: 0.2 }}>
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover rounded-xl" /> : '👗'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold" style={{ color: '#370617' }}>{p.name}</p>
                      <p className="text-sm" style={{ color: '#370617', opacity: 0.5 }}>
                        {p.showPrice !== false && p.price ? `K${Number(p.price).toLocaleString()}` : 'Price hidden'} · {p.status}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile card */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border" style={{ borderColor: '#FAA307' }}>
          <h2 className="text-xl font-black mb-4" style={{ color: '#370617' }}>Profile</h2>
          <div className="space-y-2 text-sm">
            <p><span style={{ color: '#370617', opacity: 0.5 }}>Name:</span> <span style={{ color: '#370617', fontWeight: 'bold' }}>{profile?.fullName || 'Not set'}</span></p>
            <p><span style={{ color: '#370617', opacity: 0.5 }}>Email:</span> <span style={{ color: '#370617', fontWeight: 'bold' }}>{user.email}</span></p>
            <p><span style={{ color: '#370617', opacity: 0.5 }}>Role:</span> <span style={{ color: '#370617', fontWeight: 'bold' }} className="capitalize">{profile?.role}</span></p>
            {profile?.phoneNumber && <p><span style={{ color: '#370617', opacity: 0.5 }}>Phone:</span> <span style={{ color: '#370617', fontWeight: 'bold' }}>{profile.phoneNumber}</span></p>}
          </div>
        </div>
      </main>
    </div>
  )
}