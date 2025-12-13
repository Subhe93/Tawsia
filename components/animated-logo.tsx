'use client';

export function AnimatedLogo() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <svg
        width="128"
        height="128"
        viewBox="0 0 128 128"
        className="animate-pulse"
      >
        {/* خلفية دائرية متحركة */}
        <circle
          cx="64"
          cy="64"
          r="60"
          fill="none"
          stroke="url(#gradient1)"
          strokeWidth="2"
          strokeDasharray="10 5"
          className="animate-spin"
          style={{ transformOrigin: '64px 64px', animationDuration: '8s' }}
        />
        
        {/* العناصر الأربعة */}
        <g className="animate-pulse" style={{ animationDelay: '0s', animationDuration: '2s' }}>
          <rect
            x="44"
            y="44"
            width="16"
            height="16"
            rx="3"
            fill="#4CAF50"
            className="animate-spin"
            style={{ transformOrigin: '52px 52px', animationDuration: '4s' }}
          />
        </g>
        
        <g style={{ animationDelay: '1s' }}>
          <rect
            x="68"
            y="44"
            width="16"
            height="16"
            rx="3"
            fill="#FFC107"
            className="animate-ping"
            style={{ animationDuration: '3s' }}
          />
        </g>
        
        <g>
          <rect
            x="44"
            y="68"
            width="16"
            height="16"
            rx="3"
            fill="#FF9800"
            style={{ 
              animation: 'float 4s ease-in-out infinite',
              animationDelay: '2s'
            }}
          />
        </g>
        
        <g>
          <rect
            x="68"
            y="68"
            width="16"
            height="16"
            rx="3"
            fill="#F44336"
            style={{ 
              animation: 'wiggle 3s ease-in-out infinite',
              animationDelay: '0.5s'
            }}
          />
        </g>
        
        {/* نقاط متحركة حول اللوغو */}
        <circle cx="32" cy="32" r="3" fill="#4CAF50" className="animate-ping" style={{ animationDelay: '1s' }} />
        <circle cx="96" cy="32" r="3" fill="#FFC107" className="animate-ping" style={{ animationDelay: '1.5s' }} />
        <circle cx="32" cy="96" r="3" fill="#FF9800" className="animate-ping" style={{ animationDelay: '2s' }} />
        <circle cx="96" cy="96" r="3" fill="#F44336" className="animate-ping" style={{ animationDelay: '2.5s' }} />
        
        {/* تدرجات لونية */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="25%" stopColor="#FFC107" />
            <stop offset="50%" stopColor="#FF9800" />
            <stop offset="100%" stopColor="#F44336" />
          </linearGradient>
        </defs>
        
        {/* إضافة الأنيميشن المخصص */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(5deg); }
            75% { transform: rotate(-5deg); }
          }
        `}</style>
      </svg>
    </div>
  );
}