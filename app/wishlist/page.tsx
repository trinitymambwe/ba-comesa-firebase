'use client'

import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import Link from 'next/link'

export default function WishlistPage() {
  const [user, setUser] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: any) => setUser(u))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return
    const fetchWishlist = async () => {
      const q = query(collection(db, 'wishlists'), where('userId', '==', user.uid))
      const snap = await getDocs(q)
      setItems(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })))
    }
    fetchWishlist()
  }, [user])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#FFF8F0', borderColor: '#FAA307' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black"><span style={{ color: '#E85D04' }}>ba</span> <span style={{ color: '#370617' }}>Comesa</span></Link>
          <Link href="/dashboard" className="font-medium" style={{ color: '#370617' }}>← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-8" style={{ color: '#370617' }}>My Wishlist ({items.length})</h1>
        {items.length === 0 ? (
          <div className="text-center py-20 rounded-3xl" style={{ backgroundColor: '#FAA307', opacity: 0.1 }}>
            <p style={{ color: '#370617', opacity: 0.5 }}>Your wishlist is empty.</p>
            <Link href="/" className="inline-block mt-4 font-bold" style={{ color: '#E85D04' }}>Browse Products →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item: any) => (
              <Link key={item.id} href={`/products/${item.productId}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: '#FAA307' }}>
                <div className="aspect-square flex items-center justify-center text-5xl" style={{ backgroundColor: '#FFF8F0' }}>👗</div>
                <div className="p-4">
                  <p className="font-bold" style={{ color: '#370617' }}>{item.productName || 'Product'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}