import { Metadata } from "next";
import {
  getSafeEmail,
  getSafePhone,
  getSafeWebsiteUrl,
} from "@/lib/utils/contact-sanitizer";

export interface SiteStats {
  countriesCount: number;
  companiesCount: number;
  categoriesCount: number;
  reviewsCount: number;
}

export function generateHomePageMetadata(stats: SiteStats): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://twsia.com";

  return {
    title: "توصية - دليل الشركات والخدمات في الوطن العربي",
    description: `اكتشف أفضل ${stats.companiesCount} شركة في ${stats.countriesCount} دول عربية. دليل شامل للشركات والخدمات مع ${stats.reviewsCount} تقييم من العملاء الحقيقيين.`,
    keywords: [
      "دليل الشركات",
      "الشركات العربية",
      "خدمات محلية",
      "تقييمات الشركات",
      "دليل الأعمال",
      "شركات سوريا",
      "شركات لبنان",
      "شركات الأردن",
      "شركات مصر",
      "توصية",
    ].join(", "),

    openGraph: {
      title: "توصية - دليل الشركات والخدمات",
      description: `دليل شامل لـ ${stats.companiesCount} شركة في ${stats.countriesCount} دول عربية`,
      url: baseUrl,
      siteName: "توصية",
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "توصية - دليل الشركات",
        },
      ],
      locale: "ar_SA",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: "توصية - دليل الشركات والخدمات",
      description: `دليل شامل لـ ${stats.companiesCount} شركة في ${stats.countriesCount} دول عربية`,
      images: [`${baseUrl}/twitter-image.jpg`],
      site: "@twsia",
    },

    alternates: {
      canonical: baseUrl,
      languages: {
        "ar-SA": baseUrl,
        ar: baseUrl,
      },
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    verification: {
      google: process.env.GOOGLE_VERIFICATION,
    },

    other: {
      "arabic-content": "true",
      "content-language": "ar",
      "geo.region": "ME",
      "geo.placename": "Middle East",
    },
  };
}

export function generateJsonLd(stats: SiteStats) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://twsia.com";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "توصية",
    alternateName: "twsia",
    description: "دليل الشركات والخدمات في الوطن العربي",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: stats.companiesCount,
      itemListElement: [
        {
          "@type": "Thing",
          name: "شركات سوريا",
          description: "دليل الشركات والخدمات في سوريا",
        },
        {
          "@type": "Thing",
          name: "شركات لبنان",
          description: "دليل الشركات والخدمات في لبنان",
        },
        {
          "@type": "Thing",
          name: "شركات الأردن",
          description: "دليل الشركات والخدمات في الأردن",
        },
        {
          "@type": "Thing",
          name: "شركات مصر",
          description: "دليل الشركات والخدمات في مصر",
        },
      ],
    },
    publisher: {
      "@type": "Organization",
      name: "توصية",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    inLanguage: "ar-SA",
  };
}

export function generateCategoryMetadata(
  categoryName: string,
  categorySlug: string,
  companiesCount: number,
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://twsia.com";

  return {
    title: `${categoryName} | دليل الشركات والخدمات`,
    description: `اكتشف أفضل شركات ${categoryName} في الوطن العربي. ${companiesCount} شركة متخصصة مع تقييمات العملاء.`,
    keywords: [
      categoryName,
      `شركات ${categoryName}`,
      "دليل الشركات",
      "خدمات متخصصة",
    ].join(", "),

    openGraph: {
      title: `${categoryName} - دليل الشركات`,
      description: `${companiesCount} شركة متخصصة في ${categoryName}`,
      url: `${baseUrl}/category/${categorySlug}`,
    },

    alternates: {
      canonical: `${baseUrl}/category/${categorySlug}`,
    },
  };
}

export function generateCompanyJsonLd(company: any) {
  const safeWebsite = getSafeWebsiteUrl(company.website);
  const safePhone = getSafePhone(company.phone);
  const safeEmail = getSafeEmail(company.email);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    description: company.description,
    image: company.mainImage,
    url: safeWebsite || undefined,
    telephone: safePhone || undefined,
    email: safeEmail || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressLocality: company.city.name,
      addressCountry: company.country.name,
    },
    geo:
      company.latitude && company.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: company.latitude,
            longitude: company.longitude,
          }
        : undefined,
    aggregateRating:
      company.reviewsCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: company.rating,
            reviewCount: company.reviewsCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    priceRange: "$$",
    openingHours:
      company.workingHours
        ?.filter((wh: any) => !wh.isClosed)
        .map((wh: any) => `${wh.dayOfWeek} ${wh.openTime}-${wh.closeTime}`) ||
      [],
  };
}
