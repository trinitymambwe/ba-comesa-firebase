'use client'

import { useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditProductPage() {
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [showPrice, setShowPrice] = useState(true)
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('active')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: any) => {
      setUser(u)
      if (!u) router.push('/auth/login')
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user || !id) return
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, 'products', id as string))
      if (snap.exists()) {
        const p = snap.data()
        if (p.sellerId !== user.uid) {
          router.push('/dashboard')
          return
        }
        setName(p.name || '')
        setDescription(p.description || '')
        setPrice(p.price?.toString() || '')
        setShowPrice(p.showPrice !== false)
        setCategory(p.category || '')
        setStatus(p.status || 'active')
      }
      setFetching(false)
    }
    fetchProduct()
  }, [user, id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await updateDoc(doc(db, 'products', id as string), {
        name,
        description,
        price: price ? parseFloat(price) : null,
        showPrice,
        category,
        status,
        updatedAt: new Date().toISOString(),
      })
      setSuccess('Product updated!')
      setTimeout(() => router.push('/dashboard'), 1000)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setLoading(true)
    try {
      await deleteDoc(doc(db, 'products', id as string))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  if (fetching) return <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-gray-200">
      <header className="bg-[#0a1628] border-b border-[#1e3a5f] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-black">
            <span className="text-orange-500">●</span> <span style={{ color: '#e0e0e0' }}>ba</span><span className="text-orange-500">Comesa</span>
          </Link>
          <Link href="/dashboard" style={{ color: '#9ca3af' }} className="hover:text-white text-sm">← Dashboard</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Edit Product</h1>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-4 text-sm">{success}</div>}

        <form onSubmit={handleUpdate} className="bg-[#0a1628] rounded-2xl border border-[#1e3a5f] p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl focus:outline-none focus:border-orange-500 text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl focus:outline-none focus:border-orange-500 text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl focus:outline-none focus:border-orange-500 text-white resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Price (K)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl focus:outline-none focus:border-orange-500 text-white" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} className="accent-orange-500" />
            <span className="text-sm text-gray-300">Show price</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-3 bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl focus:outline-none focus:border-orange-500 text-white">
              <option value="active">✅ Active</option>
              <option value="sold">💰 Sold</option>
              <option value="archived">📦 Archived</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={handleDelete} className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-bold py-3 px-6 rounded-xl transition">
              🗑️ Delete
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}