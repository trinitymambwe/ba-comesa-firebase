'use client'

import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import Link from 'next/link'
import { Heart, ShoppingBag, ChevronLeft } from 'lucide-react'
import { useGlobalTheme } from '../context/ThemeContext'

export default function WishlistPage() {
  const [user, setUser] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const { theme } = useGlobalTheme()

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
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, color: theme.text }}>
      {/* Header */}
      <div style={{ backgroundColor: theme.accent, color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none', display: 'flex' }}>
          <ChevronLeft size={20} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: '18px' }}>My Wishlist ({items.length})</span>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '16px', backgroundColor: theme.card, border: `1px solid ${theme.border}` }}>
            <Heart size={48} style={{ color: theme.muted, marginBottom: '12px' }} />
            <p style={{ color: theme.muted, fontSize: '16px' }}>Your wishlist is empty.</p>
            <Link href="/" style={{ color: theme.accent, fontWeight: 600, marginTop: '8px', display: 'inline-block', textDecoration: 'none' }}>Browse Products →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {items.map((item: any) => (
              <Link key={item.id} href={`/products/${item.productId}`} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: theme.card, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${theme.border}`, transition: 'box-shadow 0.2s', cursor: 'pointer' }}>
                  <div style={{ aspectRatio: '1', backgroundColor: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={40} style={{ color: theme.muted }} />
                  </div>
                  <div style={{ padding: '10px' }}>
                    <p style={{ fontSize: '13px', color: theme.text, fontWeight: 500 }}>{item.productName || 'Product'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}