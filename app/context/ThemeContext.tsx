'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface Theme {
  name: string
  bg: string
  card: string
  accent: string
  text: string
  muted: string
  border: string
}

const themes: Theme[] = [
  { name: 'Dark Navy', bg: '#0d1b2a', card: '#0a1628', accent: '#e85d04', text: '#e0e0e0', muted: '#9ca3af', border: '#1e3a5f' },
  { name: 'Light AliExpress', bg: '#f5f5f5', card: '#ffffff', accent: '#e33124', text: '#333333', muted: '#999999', border: '#e8e8e8' },
  { name: 'Midnight Purple', bg: '#1a1a2e', card: '#16162a', accent: '#a855f7', text: '#e0e0e0', muted: '#9ca3af', border: '#2d2d4a' },
  { name: 'Forest Green', bg: '#0d1f0d', card: '#0a1a0a', accent: '#22c55e', text: '#e0e0e0', muted: '#9ca3af', border: '#1a3a1a' },
  { name: 'Warm Cream', bg: '#fff8f0', card: '#ffffff', accent: '#e85d04', text: '#370617', muted: '#9ca3af', border: '#faa307' },
  { name: 'Ocean Blue', bg: '#0c1929', card: '#0f1f3a', accent: '#06b6d4', text: '#e0e0e0', muted: '#9ca3af', border: '#1a3050' },
]

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes[0],
  setTheme: () => {},
  themes,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themes[0])

  useEffect(() => {
    const saved = localStorage.getItem('ba-comesa-theme')
    if (saved) {
      const found = themes.find(t => t.name === saved)
      if (found) setThemeState(found)
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('ba-comesa-theme', newTheme.name)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useGlobalTheme() {
  return useContext(ThemeContext)
}