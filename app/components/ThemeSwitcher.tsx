'use client'

import { useState, useEffect } from 'react'
import { Palette } from 'lucide-react'
import { useGlobalTheme } from '@/context/ThemeContext'

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme, themes } = useGlobalTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 100, backgroundColor: theme.accent, color: 'white', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', animation: 'float 3s ease-in-out infinite', transition: 'transform 0.2s' }}
        onMouseEnter={(e: any) => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={(e: any) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Palette size={20} />
      </button>
      {open && (
        <div style={{ position: 'fixed', bottom: '70px', left: '20px', zIndex: 100, backgroundColor: theme.card, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '16px', minWidth: '200px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ color: theme.text, fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Choose Theme</p>
          {themes.map(t => (
            <button key={t.name} onClick={() => { setTheme(t); setOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: theme.name === t.name ? `2px solid ${t.accent}` : '1px solid transparent', backgroundColor: t.bg, color: t.text, cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: t.accent }} />
              {t.name}
            </button>
          ))}
          <button onClick={() => setOpen(false)} style={{ marginTop: '4px', padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: theme.muted, cursor: 'pointer', fontSize: '12px' }}>Close</button>
        </div>
      )}
      <style jsx>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </>
  )
}