import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ba Comesa Marketplace',
  description: 'Discover fashion and accessories from local sellers.',
  other: {
    'google-site-verification': 'iVyrYBU9sQXO3rCvd5GvWIJ8zah3W6ksvr6OqEL2kdM',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="iVyrYBU9sQXO3rCvd5GvWIJ8zah3W6ksvr6OqEL2kdM" />
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}