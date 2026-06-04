'use client'

export default function Loading() {
  return (
    <div style={{
      backgroundColor: '#0d1b2a',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px'
    }}>
      <div style={{
        animation: 'bagFloat 1.2s ease-in-out infinite',
        fontSize: '60px'
      }}>
        🛍️
      </div>

      <p style={{
        color: '#f97316',
        fontSize: '18px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        animation: 'pulseText 1.5s ease-in-out infinite'
      }}>
        Loading...
      </p>

      <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '10px' }}>
        <span style={{ color: '#f97316' }}>●</span> ba<span style={{ color: '#f97316' }}>Comesa</span>
      </p>

      <style jsx>{`
        @keyframes bagFloat {
          0% { transform: translateY(40px); opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(-40px); opacity: 0; }
        }
        @keyframes pulseText {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}