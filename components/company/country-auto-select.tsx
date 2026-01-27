'use client';

import { useEffect } from 'react';
import { useCountry } from '@/components/providers/country-provider';

interface CountryAutoSelectProps {
  country: {
    id: string;
    code: string;
    name: string;
    flag?: string | null;
  } | null | undefined;
}

/**
 * A component that automatically selects a country in the navbar
 * when a page is visited directly (e.g., company page, city page)
 * 
 * This component ensures that when a user visits a page with country data
 * (like a company page, city page, or country page), the navbar automatically
 * updates to show that country's flag and name.
 */
export function CountryAutoSelect({ country }: CountryAutoSelectProps) {
  const { selectedCountry, setSelectedCountry } = useCountry();

  useEffect(() => {
    // Only run when country is available
    if (!country) return;

    // Check if we need to update (different country or no country selected)
    const shouldUpdate = !selectedCountry || selectedCountry.code !== country.code;
    
    if (shouldUpdate) {
      console.log('[CountryAutoSelect] Auto-selecting country:', country.name, `(${country.code})`);
      
      const countryData = {
        id: country.id,
        code: country.code,
        name: country.name,
        flag: country.flag || undefined,
      };
      
      // Update context
      setSelectedCountry(countryData);
      
      // Force update localStorage directly to ensure persistence
      localStorage.setItem('selectedCountry', JSON.stringify(countryData));
    }
  }, [country, selectedCountry, setSelectedCountry]);

  return null;
}
