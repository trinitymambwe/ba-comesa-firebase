'use client'

import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut, updateEmail, updatePassword } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User, MapPin, Settings, Globe, DollarSign, Bell, Shield, Eye,
  Trash2, Star, MessageCircle, Info, Cookie, LogOut, ChevronRight,
  Home, CreditCard, Lock
} from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

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

  if (!mounted || !user) return null

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: User, label: user.email, sublabel: 'Tap to view profile', action: () => {} },
        { icon: MapPin, label: 'Address Book', sublabel: 'Manage delivery addresses', action: () => setShowAddressModal(true) },
        { icon: Settings, label: 'Manage My Account', sublabel: 'Update email, password, phone', action: () => setShowAccountModal(true) },
      ]
    },
    {
      section: 'Preferences',
      items: [
        { icon: Globe, label: 'Location', sublabel: 'Zambia (ZM)', action: () => {} },
        { icon: DollarSign, label: 'Currency', sublabel: 'ZMW (Kwacha)', action: () => {} },
        { icon: Bell, label: 'Contact Preferences', sublabel: 'Email & push notifications', action: () => {} },
      ]
    },
    {
      section: 'Privacy & Security',
      items: [
        { icon: Shield, label: 'Blocked Contact List', sublabel: 'Manage blocked users', action: () => {} },
        { icon: Eye, label: 'Accessibility', sublabel: 'Text size & display options', action: () => {} },
      ]
    },
    {
      section: 'Data',
      items: [
        { icon: Trash2, label: 'Clear Cache', sublabel: 'Free up storage', action: () => {} },
        { icon: Cookie, label: 'Manage Cookies', sublabel: 'Control cookie preferences', action: () => {} },
      ]
    },
    {
      section: 'Support',
      items: [
        { icon: Star, label: 'Rating & Feedback', sublabel: 'Rate the app & send feedback', action: () => {} },
        { icon: MessageCircle, label: 'Connect to Us', sublabel: 'Contact support & social media', action: () => {} },
        { icon: Info, label: 'About ba Comesa', sublabel: 'Version, terms & privacy', action: () => {} },
      ]
    },
    {
      section: 'Account Actions',
      items: [
        { icon: LogOut, label: 'Sign Out', sublabel: '', action: () => signOut(auth), danger: true },
      ]
    },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#e33124', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
      <div style={{ backgroundColor: 'white', margin: '12px 16px', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '25px', backgroundColor: '#e33124', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '20px' }}>
          {(profile?.fullName || user.email)[0]?.toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#333', margin: 0 }}>{profile?.fullName || 'User'}</p>
          <p style={{ fontSize: '13px', color: '#999', margin: '2px 0 0' }}>{user.email}</p>
        </div>
      </div>

      {/* Menu Sections */}
      <div style={{ padding: '0 16px 40px' }}>
        {menuItems.map((section, si) => (
          <div key={si} style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>
              {section.section}
            </p>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              {section.items.map((item, ii) => (
                <button
                  key={ii}
                  onClick={item.action}
                  style={{
                    width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                    border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                    borderBottom: ii < section.items.length - 1 ? '1px solid #f0f0f0' : 'none',
                    color: item.danger ? '#e33124' : '#333',
                  }}
                >
                  <item.icon size={20} color={item.danger ? '#e33124' : '#666'} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ fontWeight: 500, fontSize: '14px', margin: 0, color: item.danger ? '#e33124' : '#333' }}>
                      {item.label}
                    </p>
                    {item.sublabel && (
                      <p style={{ fontSize: '12px', color: '#999', margin: '2px 0 0' }}>{item.sublabel}</p>
                    )}
                  </div>
                  {!item.danger && <ChevronRight size={16} color="#ccc" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Manage Account Modal */}
      {showAccountModal && (
        <div onClick={() => setShowAccountModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#333' }}>Manage Account</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="New Email" style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
              <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="New Phone Number" style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => setShowAccountModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleUpdateAccount} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: '#e33124', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Address Book Modal */}
      {showAddressModal && (
        <div onClick={() => setShowAddressModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#333' }}>Address Book</h3>
            <p style={{ color: '#999', fontSize: '14px' }}>Your delivery addresses will appear here. Add an address when placing an order.</p>
            <button onClick={() => setShowAddressModal(false)} style={{ marginTop: '16px', width: '100%', padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: '#e33124', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}