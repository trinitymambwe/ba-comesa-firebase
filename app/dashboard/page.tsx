'use client'

import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Settings } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/" className="text-xl font-black text-red-600">baComesa</Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-gray-500 hover:text-red-600">Browse</Link>
<Link href="/settings" className="flex items-center gap-1 text-gray-500 hover:text-red-600">
  <Settings size={16} /> Settings
</Link>
<button onClick={() => signOut(auth)} className="text-gray-500 hover:text-red-600">Logout</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {profile?.fullName || 'User'}</h1>
        <p className="text-gray-500 mb-8">{isSeller ? 'Seller Dashboard' : 'Buyer Dashboard'}</p>

        {/* BUYER: Track Orders */}
        {!isSeller && orders.length > 0 && (
          <div className="bg-white rounded-2xl border p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📦 My Orders ({orders.length})</h2>
            <div className="space-y-4">
              {orders.map((o: any) => (
                <div key={o.id} className="border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-800">{o.productName}</p>
                      <p className="text-sm text-gray-500">Seller: {o.sellerName}</p>
                      {o.price && <p className="text-red-600 font-bold">K{Number(o.price).toLocaleString()}</p>}
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      o.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                      o.deliveryStatus === 'picked_up' ? 'bg-yellow-100 text-yellow-700' :
                      o.deliveryStatus === 'assigned' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {o.deliveryStatus === 'pending' ? '⏳ Waiting for rider' :
                       o.deliveryStatus === 'assigned' ? `🚴 ${o.riderName || 'Rider assigned'}` :
                       o.deliveryStatus === 'picked_up' ? '📦 In transit' :
                       o.deliveryStatus === 'delivered' ? '✅ Delivered' :
                       o.deliveryStatus?.replace('_', ' ') || 'pending'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                    {['pending', 'assigned', 'picked_up', 'delivered'].map((status, i) => {
                      const statusOrder = ['pending', 'assigned', 'picked_up', 'delivered']
                      const currentIdx = statusOrder.indexOf(o.deliveryStatus || 'pending')
                      const isComplete = i <= currentIdx
                      return (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 0, gap: '4px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            backgroundColor: isComplete ? '#e33124' : '#e5e7eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '12px', fontWeight: 700, flexShrink: 0,
                          }}>
                            {isComplete ? '✓' : i + 1}
                          </div>
                          {i < 3 && (
                            <div style={{ flex: 1, height: '3px', backgroundColor: isComplete && i < currentIdx ? '#e33124' : '#e5e7eb', borderRadius: '2px' }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#9ca3af' }}>
                    <span>Pending</span><span>Assigned</span><span>Picked Up</span><span>Delivered</span>
                  </div>

                  {o.orderId && (
                    <Link href={`/chat/${o.id}`} className="inline-block mt-3 text-sm text-red-600 font-bold hover:underline">
                      💬 Chat with {o.sellerName}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SELLER: My Products */}
        {isSeller && (
          <div className="bg-white rounded-2xl border p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">My Products ({products.length})</h2>
              <Link href="/products/new" className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-red-700">+ Add Product</Link>
            </div>
            {products.length === 0 ? (
              <p className="text-gray-400">No products yet.</p>
            ) : (
              <div className="space-y-3">
                {products.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Link href={`/products/${p.id}`} className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : '📷'}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${p.id}`} className="font-bold text-gray-800 hover:text-red-600">{p.name}</Link>
                      <p className="text-xs text-gray-500">
                        {p.showPrice !== false && p.price ? `K${Number(p.price).toLocaleString()}` : 'Price hidden'}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          p.status === 'sold' ? 'bg-red-100 text-red-600' :
                          p.status === 'archived' ? 'bg-gray-100 text-gray-500' :
                          'bg-green-100 text-green-600'
                        }`}>{p.status}</span>
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {p.status === 'active' && (
                        <button onClick={() => markAsSold(p.id)} className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-200">Mark Sold</button>
                      )}
                      <Link href={`/products/edit/${p.id}`} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100">Edit</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-400">Name:</span> <span className="text-gray-800 font-bold">{profile?.fullName || 'Not set'}</span></p>
            <p><span className="text-gray-400">Email:</span> <span className="text-gray-800 font-bold">{user.email}</span></p>
            <p><span className="text-gray-400">Role:</span> <span className="text-gray-800 font-bold capitalize">{profile?.role}</span></p>
            {profile?.phoneNumber && <p><span className="text-gray-400">Phone:</span> <span className="text-gray-800 font-bold">{profile.phoneNumber}</span></p>}
          </div>
        </div>
      </main>
    </div>
  )
}