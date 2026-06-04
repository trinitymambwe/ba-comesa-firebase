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
    <div className="min-h-screen bg-[#1a1a2e] text-gray-200">
      <header className="bg-[#16162a] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-black">
            <span className="text-orange-500">●</span> <span className="text-white">ba</span><span className="text-orange-500">Comesa</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white">Browse</Link>
            <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-400">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome, {profile?.fullName || 'User'}</h1>
        <p className="text-gray-500 mb-8">{isSeller ? 'Seller Dashboard' : 'Buyer Dashboard'}</p>

        {isSeller && (
          <div className="bg-[#16162a] rounded-2xl border border-gray-800 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">My Products ({products.length})</h2>
              <Link href="/products/new" className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-orange-600">+ Add Product</Link>
            </div>
            {products.length === 0 ? (
              <p className="text-gray-500">No products yet.</p>
            ) : (
              <div className="space-y-3">
                {products.map((p: any) => (
                  <Link key={p.id} href={`/products/${p.id}`} className="flex items-center gap-4 p-4 bg-[#0f0f1a] rounded-xl hover:border-gray-600 border border-gray-800 transition">
                    <div className="w-14 h-14 rounded-lg bg-[#1a1a2e] flex items-center justify-center text-2xl overflow-hidden">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : '📷'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.showPrice !== false && p.price ? `K${Number(p.price).toLocaleString()}` : 'Price hidden'} · {p.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-[#16162a] rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Profile</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Name:</span> <span className="text-white font-bold">{profile?.fullName || 'Not set'}</span></p>
            <p><span className="text-gray-500">Email:</span> <span className="text-white font-bold">{user.email}</span></p>
            <p><span className="text-gray-500">Role:</span> <span className="text-white font-bold capitalize">{profile?.role}</span></p>
            {profile?.phoneNumber && <p><span className="text-gray-500">Phone:</span> <span className="text-white font-bold">{profile.phoneNumber}</span></p>}
          </div>
        </div>
      </main>
    </div>
  )
}