'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Country {
  id: string;
  code: string;
  name: string;
  flag?: string;
}

interface CountryContextType {
  selectedCountry: Country | null;
  setSelectedCountry: (country: Country | null) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // استرجاع الدولة المحفوظة عند التحميل (مرة واحدة فقط)
  useEffect(() => {
    if (isInitialized) return;
    
    const saved = localStorage.getItem('selectedCountry');
    if (saved) {
      try {
        const parsedCountry = JSON.parse(saved);
        console.log('[CountryProvider] Loaded from localStorage:', parsedCountry.name);
        setSelectedCountry(parsedCountry);
      } catch (error) {
        console.error('خطأ في استرجاع الدولة المحفوظة:', error);
      }
    }
    setIsInitialized(true);
  }, [isInitialized]);

  // حفظ الدولة المحددة في localStorage
  useEffect(() => {
    if (!isInitialized) return; // Don't save during initialization
    
    if (selectedCountry) {
      console.log('[CountryProvider] Saving to localStorage:', selectedCountry.name);
      localStorage.setItem('selectedCountry', JSON.stringify(selectedCountry));
    }
  }, [selectedCountry, isInitialized]);

  return (
    <CountryContext.Provider value={{ selectedCountry, setSelectedCountry }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}
