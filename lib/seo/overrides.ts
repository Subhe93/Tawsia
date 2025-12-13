import prisma from "@/lib/prisma";

async function getOverrideByPath(path: string) {
  try {
    const delegate = (prisma as any).seoOverride;
    if (!delegate || typeof delegate.findUnique !== "function") return null;
    return await delegate.findUnique({ where: { path } });
  } catch {
    return null;
  }
}

export async function applySeoOverride(
  defaults: { title?: string; description?: string; keywords?: string | string[] },
  path: string,
  opts?: {
    targetType?:
      | "COMPANY"
      | "CATEGORY"
      | "SUBCATEGORY"
      | "COUNTRY"
      | "CITY"
      | "SUBAREA"
      | "RANKING_PAGE"
      | "CUSTOM_PATH";
    targetId?: string;
  }
): Promise<{ title?: string; description?: string; keywords?: string | string[] }> {
  let override: any = await getOverrideByPath(path);
  if (!override && opts?.targetType && opts?.targetId) {
    try {
      const delegate = (prisma as any).seoOverride;
      if (delegate && typeof delegate.findFirst === "function") {
        override = await delegate.findFirst({
          where: { targetType: opts.targetType, targetId: opts.targetId },
        });
      }
    } catch {}
  }
  // Compute keywords from defaults/title/path if override doesn't provide them
  function computeKeywordsFromInputs(): string[] {
    const set = new Set<string>();

    const pushToken = (token?: string) => {
      if (!token) return;
      const t = token.trim();
      if (!t) return;
      // ignore very short tokens
      if (t.length <= 1) return;
      // ignore some common stop words in Arabic/English
      const stop = /^(في|من|مع|و|او|أو|ال|أفضل|أفضل|دليل|شركات|اكتشف|أفضل|توصية|فيها?)$/i;
      if (stop.test(t)) return;
      set.add(t);
    };

    // From provided defaults.title
    if (defaults?.title) {
      const cleaned = defaults.title.replace(/[|،,-–—·•()\/]/g, ' ');
      cleaned.split(/\s+/).forEach(pushToken);
    }

    // From defaults.keywords if present
    if (defaults?.keywords) {
      if (Array.isArray(defaults.keywords)) {
        defaults.keywords.forEach(pushToken);
      } else if (typeof defaults.keywords === 'string') {
        defaults.keywords.split(',').forEach(pushToken);
      }
    }

    // From path segments (e.g. country, category, subcategory slugs)
    try {
      const parts = path.split('/').map(p => decodeURIComponent(p || '').replace(/[-_]/g, ' '));
      for (const p of parts) {
        if (!p) continue;
        // skip route keywords
        if (/^(country|category|city|subcategory|subarea)$/.test(p)) continue;
        p.split(/\s+/).forEach(pushToken);
      }
    } catch {}

    // From opts.targetType (useful shorthand)
    if (opts?.targetType) pushToken(String(opts.targetType));

    return Array.from(set).slice(0, 30);
  }

  // Prefer keywords coming from the override record when available
  let finalKeywords: string[] | string | undefined;
  const overrideKeywords = override?.keywords ?? override?.metaKeywords ?? override?.meta_description ?? override?.metaDescription;
  if (overrideKeywords) {
    if (Array.isArray(overrideKeywords)) finalKeywords = overrideKeywords;
    else if (typeof overrideKeywords === 'string') finalKeywords = overrideKeywords.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else {
    const generated = computeKeywordsFromInputs();
    if (generated.length > 0) finalKeywords = generated;
  }

  const result: { title?: string; description?: string; keywords?: string | string[] } = {
    title: override?.title ?? defaults.title,
    description: override?.metaDescription ?? defaults.description,
  };

  if (finalKeywords) result.keywords = finalKeywords;

  return result;
}
