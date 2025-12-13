'use client';

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* أشكال هندسية متحركة */}
      <svg
        className="absolute top-10 left-10 w-20 h-20 text-white/10"
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,10 90,90 10,90"
          fill="currentColor"
          className="animate-spin"
          style={{ transformOrigin: '50px 50px', animationDuration: '15s' }}
        />
      </svg>
      
      <svg
        className="absolute top-32 right-20 w-16 h-16 text-white/10"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="20 10"
          className="animate-spin"
          style={{ transformOrigin: '50px 50px', animationDuration: '12s', animationDirection: 'reverse' }}
        />
      </svg>
      
      <svg
        className="absolute bottom-20 left-32 w-12 h-12 text-white/10"
        viewBox="0 0 100 100"
      >
        <rect
          x="25"
          y="25"
          width="50"
          height="50"
          fill="currentColor"
          className="animate-pulse"
          style={{ animationDuration: '3s' }}
        />
      </svg>
      
      <svg
        className="absolute bottom-32 right-16 w-24 h-24 text-white/10"
        viewBox="0 0 100 100"
      >
        <path
          d="M50,10 L90,35 L75,85 L25,85 L10,35 Z"
          fill="currentColor"
          className="animate-bounce"
          style={{ animationDuration: '4s' }}
        />
      </svg>
      
      {/* خطوط متموجة */}
      <svg
        className="absolute top-1/2 left-0 w-full h-32 text-white/5"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,50 Q300,10 600,50 T1200,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="animate-pulse"
        />
        <path
          d="M0,60 Q300,20 600,60 T1200,60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </svg>
    </div>
  );
}