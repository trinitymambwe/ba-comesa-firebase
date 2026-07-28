'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SetupProfilePage() {
  const { user } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [hasWhatsapp, setHasWhatsapp] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (!user) { router.push('/auth/login'); return null }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await setDoc(doc(db, 'profiles', user.uid), {
      fullName: user.displayName || '',
      phoneNumber: phoneNumber || null,
      hasWhatsapp,
      whatsappNumber: hasWhatsapp ? (whatsappNumber || phoneNumber) : null,
      role: 'user',
      createdAt: new Date().toISOString(),
    }, { merge: true })
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: '#e33124', color: 'white', fontSize: '12px', padding: '6px 20px', textAlign: 'center' }}>Complete Your Profile</div>
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e8e8e8', padding: '16px 20px', textAlign: 'center' }}>
        <Link href="/"><img src="https://i.imgur.com/geFkr2n.png" alt="ba Comesa" style={{ height: '32px' }} /></Link>
      </header>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333', marginBottom: '4px', textAlign: 'center' }}>Welcome!</h2>
          <p style={{ color: '#999', fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>Add your contact details</p>

          <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone Number (optional)" style={{ padding: '12px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
            <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#333', cursor: 'pointer' }}>
                <input type="checkbox" checked={hasWhatsapp} onChange={(e) => setHasWhatsapp(e.target.checked)} style={{ accentColor: '#e33124' }} />
                I have WhatsApp
              </label>
              {hasWhatsapp && (
                <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="WhatsApp number" style={{ marginTop: '8px', width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              )}
            </div>
            <button type="submit" disabled={loading} style={{ backgroundColor: '#e33124', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}