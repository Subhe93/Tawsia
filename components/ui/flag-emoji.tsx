import { getFlagEmoji } from '@/lib/utils/country-flags';
import Image from 'next/image';

interface FlagEmojiProps {
  countryCode?: string;
  flag?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: { w: 16, h: 12, class: 'w-4 h-3' },
  md: { w: 20, h: 15, class: 'w-5 h-4' },
  lg: { w: 24, h: 18, class: 'w-6 h-[18px]' },
  xl: { w: 32, h: 24, class: 'w-8 h-6' },
};

export function FlagEmoji({ countryCode, flag, className = '', size = 'md' }: FlagEmojiProps) {
  // Prefer image if country code is available (better cross-platform support)
  if (countryCode) {
    const code = countryCode.toLowerCase();
    // Using flagcdn.com for reliable flag images
    const src = `https://flagcdn.com/w40/${code}.png`;
    const dims = sizeMap[size];
    
    return (
      <span className={`inline-flex items-center justify-center ${className}`}>
        <img 
          src={src}
          alt={`Flag of ${code}`}
          className={`object-cover rounded-sm ${dims.class}`}
          loading="lazy"
        />
      </span>
    );
  }

  // Fallback to emoji if no code provided
  if (!flag) return null;
  
  return (
    <span 
      className={`flag-emoji inline-block leading-none ${className} ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}
      role="img"
      aria-label="Flag"
      style={{ 
        fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif',
      }}
    >
      {flag}
    </span>
  );
}
