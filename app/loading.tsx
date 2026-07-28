'use client'

export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
    }}>
      <img 
        src="https://i.imgur.com/geFkr2n.png" 
        alt="ba Comesa" 
        style={{ 
          width: '100px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} 
      />
      <p style={{ 
        color: '#e33124', 
        fontWeight: 700, 
        fontSize: '14px',
        letterSpacing: '2px',
      }}>
        Style Meets Community
      </p>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  )
}