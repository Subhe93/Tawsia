const PLACEHOLDER_VALUES = new Set([
  "n/a",
  "na",
  "n\\a",
  "none",
  "null",
  "undefined",
  "-",
  "--",
  "غير متوفر",
  "لا يوجد",
]);

function cleanRawValue(value?: string | null): string | null {
  if (!value) return null;

  const cleaned = value.trim();
  if (!cleaned) return null;

  const normalized = cleaned.toLowerCase();
  if (PLACEHOLDER_VALUES.has(normalized)) return null;

  return cleaned;
}

export function getSafeWebsiteUrl(value?: string | null): string | null {
  const cleaned = cleanRawValue(value);
  if (!cleaned) return null;

  let candidate = cleaned;

  if (!candidate.startsWith("http://") && !candidate.startsWith("https://")) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    if (!parsed.hostname || parsed.hostname.includes("/")) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function getSafeEmail(value?: string | null): string | null {
  const cleaned = cleanRawValue(value);
  if (!cleaned) return null;

  const email = cleaned.toLowerCase();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return isValidEmail ? email : null;
}

export function getSafePhone(value?: string | null): string | null {
  const cleaned = cleanRawValue(value);
  if (!cleaned) return null;

  const digitsOnly = cleaned.replace(/\D/g, "");
  if (digitsOnly.length < 6) return null;

  return cleaned;
}

export function getSafeTelHref(value?: string | null): string | null {
  const phone = getSafePhone(value);
  if (!phone) return null;

  const compactPhone = phone.replace(/\s+/g, "");
  return `tel:${compactPhone}`;
}
