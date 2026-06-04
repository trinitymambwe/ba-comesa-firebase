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
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#16162a] rounded-2xl border border-gray-800 p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-400 text-sm">Tell us how you want to use ba Comesa Marketplace.</p>
        </div>

        <form onSubmit={handleSetup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">I want to:</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole('buyer')} className={`py-4 px-4 rounded-xl border-2 font-bold transition-all ${role === 'buyer' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}>
                🛍️ Buy Products
              </button>
              <button type="button" onClick={() => setRole('seller')} className={`py-4 px-4 rounded-xl border-2 font-bold transition-all ${role === 'seller' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}>
                🏪 Sell Products
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number {role === 'seller' ? '(required)' : '(optional)'}</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required={role === 'seller'} className="w-full px-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 text-white placeholder-gray-500" placeholder="+260 97 1234567" />
          </div>

          {role === 'seller' && (
            <div className="bg-[#0f0f1a] rounded-xl p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hasWhatsapp} onChange={(e) => setHasWhatsapp(e.target.checked)} className="w-5 h-5 rounded border-gray-600 accent-orange-500" />
                <span className="text-sm text-gray-300">I have WhatsApp</span>
              </label>
              {hasWhatsapp && (
                <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full px-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 text-white placeholder-gray-500" placeholder="WhatsApp number (if different)" />
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  )
}