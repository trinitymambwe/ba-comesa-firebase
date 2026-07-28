'use client'

import { useEffect, useState, useRef } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ChatPage() {
  const { orderId } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [order, setOrder] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: any) => {
      if (!u) router.push('/auth/login')
      setUser(u)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!orderId) return
    const fetchOrder = async () => {
      const snap = await getDoc(doc(db, 'orders', orderId as string))
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() })
    }
    fetchOrder()
  }, [orderId])

  useEffect(() => {
    if (!orderId) return
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snap: any) => {
      const msgs = snap.docs
        .map((d: any) => ({ id: d.id, ...d.data() }))
        .filter((m: any) => m.orderId === orderId)
      setMessages(msgs)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    })
    return () => unsub()
  }, [orderId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !user || !order) return
    await addDoc(collection(db, 'messages'), {
      orderId: orderId as string,
      text: text.trim(),
      senderId: user.uid,
      senderEmail: user.email,
      senderName: user.email?.split('@')[0] || 'User',
      createdAt: new Date().toISOString(),
    })
    setText('')
  }

  if (!user || !order) return <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>

  const otherPerson = user.uid === order.buyerId ? order.sellerName : order.buyerName || order.buyerEmail

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#e33124', color: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '20px' }}>←</Link>
        <div>
          <p style={{ fontWeight: 700, fontSize: '15px' }}>{otherPerson || 'Chat'}</p>
          <p style={{ fontSize: '11px', opacity: 0.8 }}>{order.productName}</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
            <p style={{ fontSize: '40px', marginBottom: '8px' }}>💬</p>
            <p>Start the conversation</p>
          </div>
        )}
        {messages.map((m: any) => {
          const isMe = m.senderId === user.uid
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                backgroundColor: isMe ? '#e33124' : 'white',
                color: isMe ? 'white' : '#333',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                fontSize: '14px',
                lineHeight: 1.4,
              }}>
                <p>{m.text}</p>
                <p style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{ padding: '12px', backgroundColor: 'white', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '12px 16px', border: '1px solid #ddd', borderRadius: '24px', fontSize: '14px', outline: 'none' }}
        />
        <button type="submit" style={{ backgroundColor: '#e33124', color: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ➤
        </button>
      </form>
    </div>
  )
}