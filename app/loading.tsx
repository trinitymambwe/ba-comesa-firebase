'use client'

export default function Loading() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease',
    }}>
      <img 
        src="https://i.imgur.com/geFkr2n.png" 
        alt="Loading" 
        style={{ 
          width: '80px',
          animation: 'pulse 1.2s ease-in-out infinite',
        }} 
      />
      <p style={{ 
        color: '#1a73e8', 
        fontWeight: 700, 
        fontSize: '14px',
        letterSpacing: '2px',
        marginTop: '16px',
        animation: 'fadeText 1.5s ease-in-out infinite',
      }}>
        Loading...
      </p>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes fadeText {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}