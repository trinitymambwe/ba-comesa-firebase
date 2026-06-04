export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      gap: '16px'
    }}>
      <div style={{
        animation: 'bagFloat 1.2s ease-in-out infinite',
        fontSize: '50px'
      }}>
        🛍️
      </div>
      <p style={{
        color: '#f97316',
        fontSize: '14px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        {text}
      </p>
      <style jsx>{`
        @keyframes bagFloat {
          0% { transform: translateY(30px); opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}