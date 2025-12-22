/**
 * مولد XML للسايت ماب
 * يقوم بتوليد ملفات XML متوافقة مع معايير sitemap.org
 */

export interface SitemapUrl {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * تنظيف وتحويل النص لـ XML
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * تنسيق التاريخ لـ ISO 8601
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * توليد XML للسايت ماب
 */
export function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlsXML = urls
    .map((item) => {
      const lastMod = item.lastModified
        ? formatDate(item.lastModified)
        : formatDate(new Date());
      const changeFreq = item.changeFrequency || 'monthly';
      const priority = item.priority !== undefined ? item.priority : 0.5;

      return `  <url>
    <loc>${escapeXML(item.url)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXML}
</urlset>`;
}

/**
 * توليد Sitemap Index
 */
export interface SitemapIndexEntry {
  loc: string;
  lastmod?: Date | string;
}

export function generateSitemapIndex(sitemaps: SitemapIndexEntry[]): string {
  const sitemapsXML = sitemaps
    .map((sitemap) => {
      const lastMod = sitemap.lastmod
        ? formatDate(sitemap.lastmod)
        : formatDate(new Date());

      return `  <sitemap>
    <loc>${escapeXML(sitemap.loc)}</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapsXML}
</sitemapindex>`;
}

/**
 * التحقق من صحة URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * التحقق من صحة أولوية السايت ماب (0.0 - 1.0)
 */
export function isValidPriority(priority: number): boolean {
  return priority >= 0 && priority <= 1.0;
}

