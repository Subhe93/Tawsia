'use client';

export function SearchAnimation() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* دوائر متحركة خلف البحث */}
      <svg
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96"
        viewBox="0 0 400 400"
      >
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
          strokeDasharray="5 5"
          className="animate-spin"
          style={{ animationDuration: '20s' }}
        />
        <circle
          cx="200"
          cy="200"
          r="120"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          strokeDasharray="3 3"
          className="animate-spin"
          style={{ animationDuration: '15s', animationDirection: 'reverse' }}
        />
        <circle
          cx="200"
          cy="200"
          r="90"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          strokeDasharray="2 2"
          className="animate-spin"
          style={{ animationDuration: '10s' }}
        />
      </svg>
      
      {/* نقاط متحركة */}
      <div className="absolute top-1/4 left-1/4">
        <svg width="20" height="20" className="animate-bounce" style={{ animationDelay: '0s' }}>
          <circle cx="10" cy="10" r="3" fill="rgba(255,255,255,0.3)" />
        </svg>
      </div>
      
      <div className="absolute top-1/3 right-1/4">
        <svg width="16" height="16" className="animate-bounce" style={{ animationDelay: '0.5s' }}>
          <circle cx="8" cy="8" r="2" fill="rgba(255,255,255,0.3)" />
        </svg>
      </div>
      
      <div className="absolute bottom-1/4 left-1/3">
        <svg width="24" height="24" className="animate-bounce" style={{ animationDelay: '1s' }}>
          <circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.3)" />
        </svg>
      </div>
    </div>
  );
}