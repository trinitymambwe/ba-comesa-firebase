'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ShoppingBag, Search, Heart, ChevronLeft } from 'lucide-react'

const categoryMap: Record<string, string> = {
  'dresses': 'Dresses',
  'shoes': 'Shoes',
  'bags': 'Bags',
  'accessories': 'Accessories',
  'trending': 'Trending',
  'tops': 'Tops',
  'pants': 'Pants',
  'jackets': 'Jackets',
}

export default function CategoryPage() {
  const { slug } = useParams()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const categoryName = categoryMap[slug as string] || (slug as string)

  useEffect(() => {
    if (!slug) return
    const fetchProducts = async () => {
      let q
      if (slug === 'trending') {
        q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      } else {
        q = query(collection(db, 'products'), where('category', '>=', categoryName), where('category', '<=', categoryName + '\uf8ff'), orderBy('category'), orderBy('createdAt', 'desc'))
      }
      const snap = await getDocs(q)
      setProducts(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchProducts()
  }, [slug])

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#e33124', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}><ChevronLeft size={20} /></Link>
        <span style={{ fontWeight: 700, fontSize: '16px' }}>{categoryName}</span>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 20px', backgroundColor: 'white' }}>
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${categoryName.toLowerCase()}...`}
            style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
          <Search size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
        </div>
      </div>

      {/* Products */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <ShoppingBag size={40} style={{ color: '#ddd', animation: 'pulse 1.5s infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px' }}>
            <ShoppingBag size={48} style={{ color: '#ddd', marginBottom: '12px' }} />
            <p style={{ color: '#999' }}>No {categoryName.toLowerCase()} found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {filtered.map((p: any) => (
              <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee', transition: 'box-shadow 0.2s' }}>
                  <div style={{ aspectRatio: '1', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ShoppingBag size={40} style={{ color: '#ddd' }} />
                    )}
                  </div>
                  <div style={{ padding: '10px' }}>
                    <p style={{ fontSize: '12px', color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </p>
                    {p.showPrice !== false && p.price && (
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#e33124', marginTop: '4px' }}>
                        K{Number(p.price).toLocaleString()}
                      </p>
                    )}
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