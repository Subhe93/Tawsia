'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  delay?: number;
}

const AnimatedCounterComponent = ({ end, duration = 2000, suffix = '', delay = 0 }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, started]);

  return (
    <span className="text-2xl font-bold" suppressHydrationWarning>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const AnimatedCounter = dynamic(() => Promise.resolve(AnimatedCounterComponent), {
  ssr: false,
  loading: () => (
    <span className="text-2xl font-bold" suppressHydrationWarning>
      0
    </span>
  )
});

interface Stats {
  totalCountries: number;
  totalCompanies: number;
  totalCategories: number;
  totalReviews: number;
}

interface AnimatedStatsProps {
  stats?: Stats;
}

export function AnimatedStats({ stats }: AnimatedStatsProps) {
  // استخدام الإحصائيات الفعلية أو القيم الافتراضية
  const companies = stats?.totalCompanies || 1200;
  const countries = stats?.totalCountries || 10;
  const categories = stats?.totalCategories || 50;
  const reviews = stats?.totalReviews || 500;

  return (
    <div className="mt-12 flex flex-wrap justify-center relative z-1 gap-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 transform hover:scale-110 transition-all duration-300 hover:bg-white/20">
        <AnimatedCounter end={companies} suffix="+" delay={500} />
        <p className="text-white/90">شركة</p>
        
        {/* رسم SVG للإحصائية */}
        <svg className="w-8 h-8 mx-auto mt-2 text-white/70" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" />
        </svg>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 transform hover:scale-110 transition-all duration-300 hover:bg-white/20">
        <AnimatedCounter end={countries} suffix="+" delay={800} />
        <p className="text-white/90">دولة</p>
        
        <svg className="w-8 h-8 mx-auto mt-2 text-white/70" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2Z" />
        </svg>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 transform hover:scale-110 transition-all duration-300 hover:bg-white/20">
        <AnimatedCounter end={categories} suffix="+" delay={1100} />
        <p className="text-white/90">فئة</p>
        
        <svg className="w-8 h-8 mx-auto mt-2 text-white/70" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6M20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" />
        </svg>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 transform hover:scale-110 transition-all duration-300 hover:bg-white/20">
        <AnimatedCounter end={reviews} suffix="+" delay={1400} />
        <p className="text-white/90">تقييم</p>
        
        <svg className="w-8 h-8 mx-auto mt-2 text-white/70" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
        </svg>
      </div>
    </div>
  );
}