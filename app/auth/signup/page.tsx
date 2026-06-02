'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [hasWhatsapp, setHasWhatsapp] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const saveProfile = async (userId: string) => {
    await setDoc(doc(db, 'profiles', userId), {
      fullName,
      phoneNumber: phoneNumber || null,
      hasWhatsapp: role === 'seller' ? hasWhatsapp : false,
      whatsappNumber: role === 'seller' && hasWhatsapp ? (whatsappNumber || phoneNumber) : null,
      role,
      createdAt: new Date().toISOString(),
    })
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await saveProfile(result.user.uid)
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      await saveProfile(result.user.uid)
      router.push('/auth/setup-profile')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">ba Comesa Marketplace</h1>
          <p className="text-gray-500 mt-2">Create your account to get started.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

        <button onClick={handleGoogleSignup} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all mb-4">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent" placeholder="••••••••" />
          </div>

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
              {hasWhatsapp && (
                <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent" placeholder="WhatsApp number (if different)" />
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#0f766e] hover:bg-[#115e59] text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 mt-2">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#0f766e] font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}