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
      fullName, phoneNumber: phoneNumber || null,
      hasWhatsapp: role === 'seller' ? hasWhatsapp : false,
      whatsappNumber: role === 'seller' && hasWhatsapp ? (whatsappNumber || phoneNumber) : null,
      role, createdAt: new Date().toISOString(),
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
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      await saveProfile(result.user.uid)
      router.push('/auth/setup-profile')
    } catch (err: any) { setError(err.message) }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: '#e33124', color: 'white', fontSize: '12px', padding: '6px 20px', textAlign: 'center' }}>
        Join Zambia's Fashion Marketplace
      </div>
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e8e8e8', padding: '16px 20px', textAlign: 'center' }}>
        <Link href="/"><img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '32px' }} /></Link>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333', marginBottom: '4px', textAlign: 'center' }}>Create Account</h2>
          <p style={{ color: '#999', fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>Start buying and selling fashion</p>

          {error && <div style={{ backgroundColor: '#fff0f0', border: '1px solid #ffcccc', color: '#e33124', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

          <button onClick={handleGoogleSignup}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontSize: '14px', color: '#333', fontWeight: 500, marginBottom: '20px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e8' }} /><span style={{ color: '#999', fontSize: '12px' }}>or</span><div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e8' }} />
          </div>

          <form onSubmit={handleEmailSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Full Name" style={{ padding: '12px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address" style={{ padding: '12px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Password (min 6 characters)" style={{ padding: '12px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />

            {/* Role Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button type="button" onClick={() => setRole('buyer')}
                style={{ padding: '12px', borderRadius: '8px', border: role === 'buyer' ? '2px solid #e33124' : '1px solid #ddd', backgroundColor: role === 'buyer' ? '#fff5f5' : 'white', color: role === 'buyer' ? '#e33124' : '#666', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                🛍️ I'm a Buyer
              </button>
              <button type="button" onClick={() => setRole('seller')}
                style={{ padding: '12px', borderRadius: '8px', border: role === 'seller' ? '2px solid #e33124' : '1px solid #ddd', backgroundColor: role === 'seller' ? '#fff5f5' : 'white', color: role === 'seller' ? '#e33124' : '#666', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                🏪 I'm a Seller
              </button>
            </div>

            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required={role === 'seller'} placeholder={`Phone Number ${role === 'seller' ? '(required)' : '(optional)'}`} style={{ padding: '12px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />

            {role === 'seller' && (
              <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#333', cursor: 'pointer' }}>
                  <input type="checkbox" checked={hasWhatsapp} onChange={(e) => setHasWhatsapp(e.target.checked)} style={{ accentColor: '#e33124' }} />
                  I have WhatsApp
                </label>
                {hasWhatsapp && (
                  <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="WhatsApp number (if different)" style={{ marginTop: '8px', width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                )}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ backgroundColor: '#e33124', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1, marginTop: '4px' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#666' }}>
            Already have an account? <Link href="/auth/login" style={{ color: '#e33124', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>

      <footer style={{ backgroundColor: '#333', color: '#999', textAlign: 'center', padding: '16px', fontSize: '12px' }}>
        <img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '18px', marginBottom: '4px' }} />
        <p>© {new Date().getFullYear()} ba Comesa Marketplace</p>
      </footer>
    </div>
  )
}