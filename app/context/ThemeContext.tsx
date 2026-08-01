'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

const lightTheme = {
  mode: 'light' as const,
  bg: '#f8fafc',
  card: '#ffffff',
  accent: '#1a73e8',
  text: '#1e293b',
  muted: '#64748b',
  border: '#e2e8f0',
  navBg: '#ffffff',
  headerBg: '#1a73e8',
}

const darkTheme = {
  mode: 'dark' as const,
  bg: '#0f172a',
  card: '#1e293b',
  accent: '#3b82f6',
  text: '#e2e8f0',
  muted: '#94a3b8',
  border: '#334155',
  navBg: '#1e293b',
  headerBg: '#1e3a5f',
}

type Theme = typeof lightTheme | typeof darkTheme

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
  isDark: false,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('ba-comesa-dark-mode')
    if (saved === 'true') setIsDark(true)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('ba-comesa-dark-mode', String(next))
  }

  const theme = isDark ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useGlobalTheme() {
  return useContext(ThemeContext)
}