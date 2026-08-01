'use client'

export default function Logo({ height = 40 }: { height?: number }) {
  const scale = height / 40 // base size

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: 'Poppins, sans-serif',
      animation: 'float 4s ease-in-out infinite',
    }}>
      {/* Shopping Bag Icon */}
      <div style={{
        position: 'relative',
        width: 36 * scale,
        height: 32 * scale,
        borderRadius: 6 * scale,
        background: 'linear-gradient(145deg, #111, #2b2b2b)',
        boxShadow: '0 0 10px rgba(255,115,0,.35), 0 6px 12px rgba(0,0,0,.4)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Shine */}
        <div style={{
          position: 'absolute',
          width: 16 * scale,
          height: '220%',
          background: 'rgba(255,255,255,.15)',
          transform: 'rotate(25deg)',
          left: -30 * scale,
          top: -15 * scale,
          animation: 'shine 3s linear infinite',
        }} />
        {/* Handle */}
        <div style={{
          position: 'absolute',
          width: 20 * scale,
          height: 12 * scale,
          border: `${2 * scale}px solid #ff7300`,
          borderBottom: 'none',
          borderRadius: `${16 * scale}px ${16 * scale}px 0 0`,
          left: '50%',
          transform: 'translateX(-50%)',
          top: -7 * scale,
        }} />
        {/* K */}
        <div style={{
          position: 'absolute',
          width: '100%',
          textAlign: 'center',
          fontSize: 22 * scale,
          fontWeight: 900,
          color: 'white',
          top: 4 * scale,
          textShadow: '0 0 4px rgba(255,255,255,.5)',
        }}>
          K<span style={{ color: '#ff7300', animation: 'pulse 2s infinite' }}>✓</span>
        </div>
      </div>

      {/* Text */}
      <div style={{ lineHeight: 1.1 }}>
        <div style={{
          fontSize: 14 * scale,
          fontWeight: 900,
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ color: '#ffffff' }}>KWENYU</span>
          <span style={{ color: '#ff7300' }}>STORE</span>
        </div>
        <div style={{
          color: '#ddd',
          letterSpacing: 3 * scale,
          fontSize: 4 * scale,
          whiteSpace: 'nowrap',
        }}>
          MARKETPLACE
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes shine {
          100% { left: 200%; }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; text-shadow: 0 0 6px #ff7300; }
          50% { opacity: .6; text-shadow: 0 0 16px #ff7300; }
        }
      `}</style>
    </div>
  )
}