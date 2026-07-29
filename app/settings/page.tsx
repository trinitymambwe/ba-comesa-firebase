'use client'

import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut, updateEmail, updatePassword } from 'firebase/auth'
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User, MapPin, Settings, Globe, DollarSign, Bell, Shield, Eye,
  Trash2, Star, MessageCircle, Info, Cookie, LogOut, ChevronRight,
  Home, CreditCard, Lock, X, Lightbulb, AlertTriangle, Palette
} from 'lucide-react'
import { useGlobalTheme } from '@/context/ThemeContext'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [message, setMessage] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'complaint'>('feedback')
  const [feedbackSending, setFeedbackSending] = useState(false)
  const router = useRouter()

  const { theme, setTheme, themes } = useGlobalTheme()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const unsub = onAuthStateChanged(auth, async (u: any) => {
      if (!u) { router.push('/auth/login'); return }
      setUser(u)
      const snap = await getDoc(doc(db, 'profiles', u.uid))
      if (snap.exists()) setProfile(snap.data())
    })
    return () => unsub()
  }, [mounted])

  const handleUpdateAccount = async () => {
    try {
      if (newEmail && newEmail !== user.email) {
        await updateEmail(user, newEmail)
      }
      if (newPassword) {
        await updatePassword(user, newPassword)
      }
      if (newPhone) {
        await updateDoc(doc(db, 'profiles', user.uid), { phoneNumber: newPhone })
      }
      setMessage('Account updated successfully!')
      setShowAccountModal(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage('Error: ' + err.message)
    }
  }

  const handleClearCache = () => {
    localStorage.clear()
    sessionStorage.clear()
    setMessage('Cache cleared successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleContactUs = () => {
    window.open('https://wa.me/+260779294023?text=Hello%20ba%20Comesa%20Support', '_blank')
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return
    setFeedbackSending(true)
    try {
      await addDoc(collection(db, 'feedback'), {
        type: feedbackType,
        message: feedbackText.trim(),
        userEmail: user.email,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        resolved: false,
      })
      setMessage('Thank you for your feedback!')
      setShowFeedbackModal(false)
      setFeedbackText('')
      setFeedbackType('feedback')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      alert('Failed to send feedback: ' + err.message)
    }
    setFeedbackSending(false)
  }

  const handlePlaceholder = (feature: string) => {
    alert(feature + ' is coming soon!')
  }

  if (!mounted || !user) return null

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: User, label: user.email, sublabel: 'Tap to view profile', action: () => handlePlaceholder('Profile view') },
        { icon: MapPin, label: 'Address Book', sublabel: 'Manage delivery addresses', action: () => setShowAddressModal(true) },
        { icon: Settings, label: 'Manage My Account', sublabel: 'Update email, password, phone', action: () => setShowAccountModal(true) },
      ]
    },
    {
      section: 'Preferences',
      items: [
        { icon: Globe, label: 'Location', sublabel: 'Zambia (ZM)', action: () => handlePlaceholder('Location change') },
        { icon: DollarSign, label: 'Currency', sublabel: 'ZMW (Kwacha)', action: () => handlePlaceholder('Currency change') },
        { icon: Bell, label: 'Contact Preferences', sublabel: 'Email & push notifications', action: () => handlePlaceholder('Contact preferences') },
      ]
    },
    {
      section: 'Privacy & Security',
      items: [
        { icon: Shield, label: 'Blocked Contact List', sublabel: 'Manage blocked users', action: () => handlePlaceholder('Blocked contacts') },
        { icon: Eye, label: 'Accessibility', sublabel: 'Theme & display options', action: () => setShowThemeModal(true) },
      ]
    },
    {
      section: 'Data',
      items: [
        { icon: Trash2, label: 'Clear Cache', sublabel: 'Free up storage', action: handleClearCache },
        { icon: Cookie, label: 'Manage Cookies', sublabel: 'Control cookie preferences', action: () => handlePlaceholder('Cookie management') },
      ]
    },
    {
      section: 'Support',
      items: [
        { icon: Star, label: 'Rating & Feedback', sublabel: 'Rate the app & send feedback', action: () => setShowFeedbackModal(true) },
        { icon: MessageCircle, label: 'Connect to Us', sublabel: 'Contact support & social media', action: handleContactUs },
        { icon: Info, label: 'About ba Comesa', sublabel: 'Version, terms & privacy', action: () => setShowAboutModal(true) },
      ]
    },
    {
      section: 'Account Actions',
      items: [
        { icon: LogOut, label: 'Sign Out', sublabel: '', action: () => signOut(auth), danger: true },
      ]
    },
  ]

  const accent = theme.accent
  const bg = theme.bg
  const card = theme.card
  const text = theme.text
  const muted = theme.muted
  const border = theme.border

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg }}>
      {/* Header */}
      <div style={{ backgroundColor: accent, color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none', display: 'flex' }}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: '18px' }}>Settings</span>
      </div>

      {/* Success Message */}
      {message && (
        <div style={{ padding: '12px 20px', backgroundColor: '#22c55e', color: 'white', fontSize: '14px', textAlign: 'center' }}>
          {message}
        </div>
      )}

      {/* Profile Card */}
      <div style={{ backgroundColor: card, margin: '12px 16px', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: `1px solid ${border}` }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '25px', backgroundColor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '20px' }}>
          {(profile?.fullName || user.email)[0]?.toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 700, color: text, margin: 0 }}>{profile?.fullName || 'User'}</p>
          <p style={{ fontSize: '13px', color: muted, margin: '2px 0 0' }}>{user.email}</p>
        </div>
      </div>

      {/* Menu Sections */}
      <div style={{ padding: '0 16px 40px' }}>
        {menuItems.map((section, si) => (
          <div key={si} style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: muted, textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>
              {section.section}
            </p>
            <div style={{ backgroundColor: card, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: `1px solid ${border}` }}>
              {section.items.map((item, ii) => (
                <button
                  key={ii}
                  onClick={item.action}
                  style={{
                    width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                    border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                    borderBottom: ii < section.items.length - 1 ? `1px solid ${border}` : 'none',
                    color: (item as any).danger ? accent : text,
                  }}
                >
                  <item.icon size={20} color={(item as any).danger ? accent : muted} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ fontWeight: 500, fontSize: '14px', margin: 0, color: (item as any).danger ? accent : text }}>
                      {item.label}
                    </p>
                    {item.sublabel && (
                      <p style={{ fontSize: '12px', color: muted, margin: '2px 0 0' }}>{item.sublabel}</p>
                    )}
                  </div>
                  {!(item as any).danger && <ChevronRight size={16} color={muted} />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Theme Picker Modal (Accessibility) */}
      {showThemeModal && (
        <div onClick={() => setShowThemeModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700, color: text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={20} color={accent} /> Choose Theme
              </h3>
              <button onClick={() => setShowThemeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {themes.map(t => (
                <button
                  key={t.name}
                  onClick={() => { setTheme(t); setShowThemeModal(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '12px',
                    border: theme.name === t.name ? `2px solid ${t.accent}` : `1px solid ${border}`,
                    backgroundColor: t.bg, color: t.text,
                    cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                  }}
                >
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: t.accent, flexShrink: 0 }} />
                  {t.name}
                  {theme.name === t.name && <span style={{ marginLeft: 'auto', color: t.accent }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manage Account Modal */}
      {showAccountModal && (
        <div onClick={() => setShowAccountModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: card, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', border: `1px solid ${border}` }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px', color: text }}>Manage Account</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="New Email" style={{ padding: '12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', backgroundColor: bg, color: text }} />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" style={{ padding: '12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', backgroundColor: bg, color: text }} />
              <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="New Phone Number" style={{ padding: '12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', backgroundColor: bg, color: text }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => setShowAccountModal(false)} style={{ flex: 1, padding: '12px', border: `1px solid ${border}`, borderRadius: '8px', backgroundColor: bg, color: text, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleUpdateAccount} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: accent, color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Address Book Modal */}
      {showAddressModal && (
        <div onClick={() => setShowAddressModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: card, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', border: `1px solid ${border}` }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px', color: text }}>Address Book</h3>
            <p style={{ color: muted, fontSize: '14px' }}>Your delivery addresses will appear here. Add an address when placing an order.</p>
            <button onClick={() => setShowAddressModal(false)} style={{ marginTop: '16px', width: '100%', padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: accent, color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div onClick={() => setShowAboutModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: card, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700, color: text }}>About ba Comesa</h3>
              <button onClick={() => setShowAboutModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: '14px', color: text, marginBottom: '12px' }}>Version 1.0.0</p>
            <p style={{ fontSize: '14px', color: muted, marginBottom: '12px' }}>ba Comesa Marketplace – Zambia's fashion hub. Buy and sell fashion with local delivery.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/terms" style={{ color: accent, textDecoration: 'none', fontSize: '14px' }}>Terms of Service</Link>
              <Link href="/privacy" style={{ color: accent, textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div onClick={() => setShowFeedbackModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: card, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', border: `1px solid ${border}` }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px', color: text }}>Send Feedback</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button onClick={() => setFeedbackType('feedback')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, backgroundColor: feedbackType === 'feedback' ? accent : border, color: feedbackType === 'feedback' ? 'white' : text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Lightbulb size={16} /> Feedback
              </button>
              <button onClick={() => setFeedbackType('complaint')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, backgroundColor: feedbackType === 'complaint' ? accent : border, color: feedbackType === 'complaint' ? 'white' : text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> Complaint
              </button>
            </div>
            <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Tell us what you think..." rows={4} style={{ width: '100%', padding: '12px', border: `1px solid ${border}`, borderRadius: '8px', fontSize: '14px', resize: 'none', backgroundColor: bg, color: text, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => setShowFeedbackModal(false)} style={{ flex: 1, padding: '12px', border: `1px solid ${border}`, borderRadius: '8px', backgroundColor: bg, color: text, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmitFeedback} disabled={feedbackSending || !feedbackText.trim()} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: accent, color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', opacity: feedbackSending || !feedbackText.trim() ? 0.5 : 1 }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}