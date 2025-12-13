import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0; // لا تخزين مؤقت - ديناميكي تماماً

// دالة لتحويل البيانات إلى XML sitemap
function generateSitemapXML(
  urls: Array<{
    url: string;
    lastModified?: Date | string;
    changeFrequency?: string;
    priority?: number;
  }>
): string {
  const urlsXML = urls
    .map((item) => {
      const lastMod = item.lastModified
        ? new Date(item.lastModified).toISOString()
        : new Date().toISOString();
      const changeFreq = item.changeFrequency || "weekly";
      const priority = item.priority || 0.5;

      return `  <url>
    <loc>${escapeXML(item.url)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXML}
</urlset>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://murabaat.com";

    // الصفحات الثابتة
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
    ];

    // جلب جميع البيانات الديناميكية بشكل موازي
    const [
      countries,
      cities,
      subAreas,
      categories,
      subCategories,
      companies,
      rankingPages,
    ] = await Promise.all([
      // الدول
      prisma.country.findMany({
        where: { isActive: true },
        select: { code: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),

      // المدن
      prisma.city.findMany({
        where: { isActive: true },
        select: { slug: true, countryCode: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),

      // المناطق الفرعية
      prisma.subArea.findMany({
        where: { isActive: true },
        include: {
          city: {
            select: { slug: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),

      // الفئات
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),

      // الفئات الفرعية
      prisma.subCategory.findMany({
        where: { isActive: true },
        include: {
          category: {
            select: { slug: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),

      // الشركات
      prisma.company.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      }),

      // صفحات التصنيف
      prisma.rankingPage.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    // صفحات الدول
    const countryPages = countries.map((country) => ({
      url: `${baseUrl}/country/${country.code}`,
      lastModified: country.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // صفحات المدن
    const cityPages = cities.map((city) => ({
      url: `${baseUrl}/country/${city.countryCode}/city/${city.slug}`,
      lastModified: city.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // صفحات المناطق الفرعية
    const subAreaPages = subAreas.map((subArea) => ({
      url: `${baseUrl}/country/${subArea.countryCode}/city/${subArea.city.slug}/sub-area/${subArea.slug}`,
      lastModified: subArea.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // صفحات الفئات (مع كل دولة)
    const categoryPages: Array<{
      url: string;
      lastModified: Date;
      changeFrequency: string;
      priority: number;
    }> = [];
    for (const country of countries) {
      for (const category of categories) {
        categoryPages.push({
          url: `${baseUrl}/country/${country.code}/category/${category.slug}`,
          lastModified: category.updatedAt,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }

    // صفحات الفئات الفرعية
    const subCategoryPages: Array<{
      url: string;
      lastModified: Date;
      changeFrequency: string;
      priority: number;
    }> = [];
    for (const country of countries) {
      for (const subCategory of subCategories) {
        subCategoryPages.push({
          url: `${baseUrl}/country/${country.code}/category/${subCategory.category.slug}/${subCategory.slug}`,
          lastModified: subCategory.updatedAt,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }

    // صفحات الشركات
    const companyPages = companies.map((company) => ({
      url: `${baseUrl}/${company.slug}`,
      lastModified: company.updatedAt,
      changeFrequency: "daily",
      priority: 0.9,
    }));

    // صفحات التصنيف (معلقة حالياً)
    // const rankingPagesMap = rankingPages.map((page) => ({
    //   url: `${baseUrl}/ranking/${page.slug}`,
    //   lastModified: page.updatedAt,
    //   changeFrequency: 'daily',
    //   priority: 0.9,
    // }))

    // دمج جميع الصفحات
    const allPages = [
      ...staticPages,
      ...countryPages,
      ...cityPages,
      ...subAreaPages,
      ...categoryPages,
      ...subCategoryPages,
      ...companyPages,
      // ...rankingPagesMap,
    ];

    // توليد XML
    const xml = generateSitemapXML(allPages);

    // إرجاع الرد مع headers لمنع التخزين المؤقت
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("خطأ في توليد sitemap:", error);

    // في حالة الخطأ، نعيد الصفحات الثابتة فقط
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://murabaat.com";
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];

    const xml = generateSitemapXML(staticPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      },
    });
  }
}
