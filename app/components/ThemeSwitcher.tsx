'use client'

import { useState, useEffect } from 'react'
import { Palette } from 'lucide-react'

const themes = [
  { name: 'Dark Navy', bg: '#0d1b2a', card: '#0a1628', accent: '#e85d04', text: '#e0e0e0', muted: '#9ca3af', border: '#1e3a5f' },
  { name: 'Light AliExpress', bg: '#f5f5f5', card: '#ffffff', accent: '#e33124', text: '#333333', muted: '#999999', border: '#e8e8e8' },
  { name: 'Midnight Purple', bg: '#1a1a2e', card: '#16162a', accent: '#a855f7', text: '#e0e0e0', muted: '#9ca3af', border: '#2d2d4a' },
  { name: 'Forest Green', bg: '#0d1f0d', card: '#0a1a0a', accent: '#22c55e', text: '#e0e0e0', muted: '#9ca3af', border: '#1a3a1a' },
  { name: 'Warm Cream', bg: '#fff8f0', card: '#ffffff', accent: '#e85d04', text: '#370617', muted: '#9ca3af', border: '#faa307' },
  { name: 'Ocean Blue', bg: '#0c1929', card: '#0f1f3a', accent: '#06b6d4', text: '#e0e0e0', muted: '#9ca3af', border: '#1a3050' },
]

type Theme = typeof themes[0]

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(themes[0])

  useEffect(() => {
    const saved = localStorage.getItem('ba-comesa-theme')
    if (saved) {
      const found = themes.find(t => t.name === saved)
      if (found) setTheme(found)
    }
  }, [])

  const changeTheme = (themeName: string) => {
    const found = themes.find(t => t.name === themeName)
    if (found) {
      setTheme(found)
      localStorage.setItem('ba-comesa-theme', themeName)
    }
  }

  return { theme, changeTheme, themes }
}

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false)
  const { theme, changeTheme, themes } = useTheme()

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: '20px', left: '20px', zIndex: 100,
          backgroundColor: theme.accent, color: 'white', border: 'none',
          borderRadius: '50%', width: '44px', height: '44px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          fontSize: '18px', transition: 'transform 0.2s',
        }}
        title="Change theme"
      >
        <Palette size={20} />
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', bottom: '70px', left: '20px', zIndex: 100,
            backgroundColor: theme.card, border: `1px solid ${theme.border}`,
            borderRadius: '16px', padding: '16px', minWidth: '200px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column', gap: '8px',
          }}
        >
          <p style={{ color: theme.text, fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Choose Theme</p>
          {themes.map(t => (
            <button
              key={t.name}
              onClick={() => { changeTheme(t.name); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', border: theme.name === t.name ? `2px solid ${t.accent}` : `1px solid transparent`,
                backgroundColor: t.bg, color: t.text, cursor: 'pointer', fontSize: '13px', fontWeight: 500,
              }}
            >
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: t.accent }} />
              {t.name}
            </button>
          ))}
          <button
            onClick={() => setOpen(false)}
            style={{ marginTop: '4px', padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: theme.muted, cursor: 'pointer', fontSize: '12px' }}
          >
            Close
          </button>
        </div>
      )}
    </>
  )
}