'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: '#e33124', color: 'white', fontSize: '12px', padding: '6px 20px', textAlign: 'center' }}>
        Welcome to ba Comesa Marketplace
      </div>

      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e8e8e8', padding: '16px 20px', textAlign: 'center' }}>
        <Link href="/">
          <img src="<Logo height={...} />." alt="ba Comesa" style={{ height: '32px' }} />
        </Link>
      </header>

      {/* Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333', marginBottom: '4px', textAlign: 'center' }}>Sign In</h2>
          <p style={{ color: '#999', fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>Welcome back to ba Comesa</p>

          {error && (
            <div style={{ backgroundColor: '#fff0f0', border: '1px solid #ffcccc', color: '#e33124', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>
          )}

          {/* Google Button */}
          <button onClick={handleGoogleLogin}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px',
              padding: '12px', cursor: 'pointer', fontSize: '14px', color: '#333', fontWeight: 500,
              marginBottom: '20px',
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e8' }} />
            <span style={{ color: '#999', fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e8' }} />
          </div>

          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="Email address" style={{
                padding: '12px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box',
              }} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="Password" style={{
                padding: '12px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box',
              }} />
            <button type="submit" disabled={loading}
              style={{
                backgroundColor: '#e33124', color: 'white', border: 'none', borderRadius: '8px',
                padding: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#666' }}>
            Don't have an account?{' '}
            <Link href="/auth/signup" style={{ color: '#e33124', textDecoration: 'none', fontWeight: 600 }}>Sign Up</Link>
          </p>
        </div>
      </div>

      <footer style={{ backgroundColor: '#333', color: '#999', textAlign: 'center', padding: '16px', fontSize: '12px' }}>
        <img src="<Logo height={...} />." alt="ba Comesa" style={{ height: '18px', marginBottom: '4px' }} />
        <p>© {new Date().getFullYear()} ba Comesa Marketplace</p>
      </footer>
    </div>
  )
}