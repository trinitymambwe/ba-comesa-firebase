'use client'

import { useState } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { MessageCircle, X } from 'lucide-react'

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    const user = auth.currentUser
    await addDoc(collection(db, 'feedback'), {
      type: 'feedback',
      message,
      userEmail: user?.email || 'anonymous',
      userId: user?.uid || null,
      createdAt: new Date().toISOString(),
      resolved: false,
    })
    setSubmitted(true)
    setLoading(false)
    setTimeout(() => { setOpen(false); setSubmitted(false); setMessage('') }, 2000)
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 100, backgroundColor: '#e33124', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
        <MessageCircle size={24} />
      </button>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700 }}>Send Feedback</h3>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {submitted ? (
              <p style={{ color: '#22c55e', textAlign: 'center', fontWeight: 600 }}>Thank you!</p>
            ) : (
              <>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us..." rows={4} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', resize: 'none', boxSizing: 'border-box' }} />
                <button onClick={handleSubmit} disabled={loading || !message.trim()} style={{ marginTop: '12px', width: '100%', padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: '#e33124', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: loading || !message.trim() ? 0.5 : 1 }}>Send</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}