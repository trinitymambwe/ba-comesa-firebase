'use client'

import { useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

export default function TrackVisit() {
  useEffect(() => {
    const track = async () => {
      try {
        await addDoc(collection(db, 'visits'), {
          path: window.location.pathname,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || 'direct',
        })
      } catch (e) {
        // silent
      }
    }
    track()
  }, [])

  return null
}