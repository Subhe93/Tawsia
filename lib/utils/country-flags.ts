/**
 * Utility to get country flag emoji from country code
 * Converts country code (e.g., 'sy', 'lb') to flag emoji
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return "🏳️";
  }

  // Convert country code to uppercase
  const code = countryCode.toUpperCase();

  // Convert to regional indicator symbols (flag emoji)
  // Each letter is converted to its regional indicator symbol
  const codePoints = Array.from(code).map(
    (char) => 0x1f1e6 - 65 + char.charCodeAt(0)
  );

  return String.fromCodePoint(...codePoints);
}

/**
 * Map of country codes to their flag emojis (backup method)
 */
export const COUNTRY_FLAGS: Record<string, string> = {
  sy: "🇸🇾",
  lb: "🇱🇧",
  jo: "🇯🇴",
  eg: "🇪🇬",
  ae: "🇦🇪",
  sa: "🇸🇦",
  iq: "🇮🇶",
  kw: "🇰🇼",
  qa: "🇶🇦",
  bh: "🇧🇭",
  om: "🇴🇲",
  ye: "🇾🇪",
  ps: "🇵🇸",
};

/**
 * Get flag emoji with fallback
 */
export function getFlagEmoji(countryCodeOrFlag?: string | null): string {
  if (!countryCodeOrFlag) return "";

  // If it's already a flag emoji (check for regional indicator symbols)
  // Regional indicator symbols are in the range U+1F1E6 to U+1F1FF
  const hasRegionalIndicator = /[\uD83C][\uDDE6-\uDDFF]/.test(
    countryCodeOrFlag
  );
  if (hasRegionalIndicator) {
    return countryCodeOrFlag;
  }

  // If it's a country code
  const code = countryCodeOrFlag.toLowerCase();
  return COUNTRY_FLAGS[code] || getCountryFlag(code);
}
