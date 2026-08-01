import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import FeedbackButton from './components/FeedbackButton'
import TrackVisit from './lib/trackVisit'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kwenyu Store',
  description: 'Zambia\'s fashion marketplace — buy, sell, and deliver.',
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
        <ThemeProvider>
          <AuthProvider>
            {children}
            <FeedbackButton />
            <TrackVisit />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}