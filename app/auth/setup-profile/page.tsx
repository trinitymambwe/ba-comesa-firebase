'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function SetupProfilePage() {
  const { user } = useAuth()
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [hasWhatsapp, setHasWhatsapp] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (!user) {
    router.push('/auth/login')
    return null
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await setDoc(doc(db, 'profiles', user.uid), {
      fullName: user.displayName || '',
      phoneNumber: phoneNumber || null,
      hasWhatsapp: role === 'seller' ? hasWhatsapp : false,
      whatsappNumber: role === 'seller' && hasWhatsapp ? (whatsappNumber || phoneNumber) : null,
      role,
      createdAt: new Date().toISOString(),
    }, { merge: true })
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-[#1a1a2e] mb-2">Complete Your Profile</h1>
        <p className="text-center text-gray-500 mb-6">Tell us how you want to use ba Comesa Marketplace.</p>

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I want to:</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole('buyer')} className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${role === 'buyer' ? 'border-[#0f766e] bg-[#f0fdfa] text-[#0f766e]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>🛍️ Buy Products</button>
              <button type="button" onClick={() => setRole('seller')} className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${role === 'seller' ? 'border-[#0f766e] bg-[#f0fdfa] text-[#0f766e]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>🏪 Sell Products</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number {role === 'seller' ? '(required)' : '(optional)'}</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required={role === 'seller'} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent" placeholder="+260 97 1234567" />
          </div>
          {role === 'seller' && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hasWhatsapp} onChange={(e) => setHasWhatsapp(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#0f766e] focus:ring-[#0f766e]" />
                <span className="text-sm font-medium text-gray-700">I have WhatsApp</span>
              </label>
              {hasWhatsapp && <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent" placeholder="WhatsApp number (if different)" />}
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full bg-[#0f766e] hover:bg-[#115e59] text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50">{loading ? 'Saving...' : 'Complete Setup'}</button>
        </form>
      </div>
    </div>
  )
}