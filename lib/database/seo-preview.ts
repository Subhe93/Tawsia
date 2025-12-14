import prisma from "@/lib/prisma";
import { applySeoOverride } from "@/lib/seo/overrides";
import { generateCountryMetadata } from "@/lib/services/country.service";

type SeoTargetTypeLocal =
  | "COMPANY"
  | "CATEGORY"
  | "SUBCATEGORY"
  | "COUNTRY"
  | "CITY"
  | "SUBAREA"
  | "RANKING_PAGE";

/**
 * هذه الدالة تحاكي تماماً ما يحدث في صفحات الفرونت
 * لضمان التطابق الكامل بين النصوص في الفرونت والداشبورد
 */
export async function getLiveSeoForTarget(
  type: SeoTargetTypeLocal,
  id: string
): Promise<{ title: string; description: string; url: string } | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://twsia.com";

  try {
    switch (type) {
      case "COMPANY": {
        const company = await prisma.company.findUnique({
          where: { id },
          include: {
            country: true,
            city: true,
            category: true,
            subArea: true,
          },
        });
        if (!company) return null;

        // نفس المنطق المستخدم في app/(frontend)/[company]/page.tsx
        const titleParts = [
          company.name,
          company.country.name,
          company.city.name,
        ];

        if (company.subArea) {
          titleParts.push(company.subArea.name);
        }

        const defaultTitle = `${titleParts.join("، ")} | توصية`;
        const defaultDescription =
          company.shortDescription ||
          company.description ||
          `${company.name} - شركة ${company.category.name} في ${company.city.name}، ${company.country.name}. تقييم ${company.rating}/5 من ${company.reviewsCount} مراجعة.`;

        const overridden = await applySeoOverride(
          {
            title: defaultTitle,
            description: defaultDescription,
          },
          `/${company.slug}`,
          { targetType: "COMPANY", targetId: company.id }
        );

        const url = `${baseUrl}/${company.slug}`;
        return {
          title: overridden.title,
          description: overridden.description,
          url,
        };
      }

      case "CATEGORY": {
        const category = await prisma.category.findUnique({
          where: { id },
        });
        if (!category) return null;

        // نفس المنطق المستخدم في app/(frontend)/category/[category]/page.tsx
        const defaultTitle = `${category.name} | توصية`;
        const defaultDescription =
          category.description ||
          `اكتشف أفضل شركات ${category.name} في جميع الدول العربية`;

        const overridden = await applySeoOverride(
          {
            title: defaultTitle,
            description: defaultDescription,
          },
          `/category/${category.slug}`,
          { targetType: "CATEGORY", targetId: category.id }
        );

        const url = `${baseUrl}/category/${category.slug}`;
        return {
          title: overridden.title,
          description: overridden.description,
          url,
        };
      }

      case "SUBCATEGORY": {
        const subcategory = await prisma.subCategory.findUnique({
          where: { id },
          include: { category: true },
        });
        if (!subcategory) return null;

        // نفس المنطق المستخدم في app/(frontend)/category/[category]/[subcategory]/page.tsx
        const defaultTitle = `${subcategory.name} | ${subcategory.category.name} | توصية`;
        const defaultDescription =
          subcategory.description ||
          `اكتشف أفضل شركات ${subcategory.name} في ${subcategory.category.name} في توصية`;

        const overridden = await applySeoOverride(
          {
            title: defaultTitle,
            description: defaultDescription,
          },
          `/category/${subcategory.category.slug}/${subcategory.slug}`,
          { targetType: "SUBCATEGORY", targetId: subcategory.id }
        );

        const url = `${baseUrl}/category/${subcategory.category.slug}/${subcategory.slug}`;
        return {
          title: overridden.title,
          description: overridden.description,
          url,
        };
      }

      case "COUNTRY": {
        const country = await prisma.country.findUnique({
          where: { id },
        });
        if (!country) return null;

        // نفس المنطق المستخدم في app/(frontend)/country/[country]/page.tsx
        // يستخدم generateCountryMetadata من country.service.ts
        const base = await generateCountryMetadata(country.code);
        const overridden = await applySeoOverride(
          {
            title: typeof base.title === "string" ? base.title : undefined,
            description:
              typeof base.description === "string"
                ? base.description
                : undefined,
          },
          `/country/${country.code}`,
          { targetType: "COUNTRY", targetId: country.id }
        );

        const url = `${baseUrl}/country/${country.code}`;
        return {
          title: overridden.title || (base.title as string),
          description: overridden.description || (base.description as string),
          url,
        };
      }

      case "CITY": {
        const city = await prisma.city.findUnique({
          where: { id },
          include: { country: true },
        });
        if (!city) return null;

        // نفس المنطق المستخدم في app/(frontend)/country/[country]/city/[city]/page.tsx
        const countryName = city.country?.name || "";
        const cityName = city.name;

        const defaultTitle = `دليل الشركات في ${cityName}, ${countryName} | توصية`;
        const defaultDescription = `اكتشف أفضل الشركات والخدمات في ${cityName}, ${countryName}. دليل شامل للشركات المحلية مع تقييمات العملاء.`;

        const overridden = await applySeoOverride(
          {
            title: defaultTitle,
            description: defaultDescription,
          },
          `/country/${city.countryCode}/city/${city.slug}`,
          { targetType: "CITY", targetId: city.id }
        );

        const url = `${baseUrl}/country/${city.countryCode}/city/${city.slug}`;
        return {
          title: overridden.title,
          description: overridden.description,
          url,
        };
      }

      case "SUBAREA": {
        const subArea = await prisma.subArea.findUnique({
          where: { id },
          include: {
            city: {
              include: { country: true },
            },
          },
        });
        if (!subArea) return null;

        // نفس المنطق المستخدم في app/(frontend)/country/[country]/city/[city]/sub-area/[subarea]/page.tsx
        const countryName = subArea.city?.country?.name || "";
        const cityName = subArea.city?.name || "";
        const subAreaName = subArea.name;

        const defaultTitle = `دليل الشركات في ${subAreaName}, ${cityName}, ${countryName} | توصية`;
        const defaultDescription = `اكتشف أفضل الشركات والخدمات في ${subAreaName}, ${cityName}, ${countryName}. دليل شامل للشركات المحلية مع تقييمات العملاء.`;

        const overridden = await applySeoOverride(
          {
            title: defaultTitle,
            description: defaultDescription,
          },
          `/country/${subArea.city?.countryCode}/city/${subArea.city?.slug}/sub-area/${subArea.slug}`,
          { targetType: "SUBAREA", targetId: subArea.id }
        );

        const url = `${baseUrl}/country/${subArea.city?.countryCode}/city/${subArea.city?.slug}/sub-area/${subArea.slug}`;
        return {
          title: overridden.title,
          description: overridden.description,
          url,
        };
      }

      case "RANKING_PAGE": {
        const rankingPage = await prisma.rankingPage.findUnique({
          where: { id },
        });
        if (!rankingPage) return null;

        // نفس المنطق المستخدم في app/(frontend)/ranking/[slug]/page.tsx
        const defaultTitle = rankingPage.metaTitle || rankingPage.title;
        const defaultDescription =
          rankingPage.metaDescription || rankingPage.description;

        const overridden = await applySeoOverride(
          {
            title: defaultTitle,
            description: defaultDescription,
          },
          `/ranking/${rankingPage.slug}`,
          { targetType: "RANKING_PAGE", targetId: rankingPage.id }
        );

        const url = `${baseUrl}/ranking/${rankingPage.slug}`;
        return {
          title: overridden.title,
          description: overridden.description,
          url,
        };
      }

      default:
        return null;
    }
  } catch (error) {
    console.error("خطأ في getLiveSeoForTarget:", error);
    return null;
  }
}

// دوال مساعدة للصفحات المركبة
export async function getLiveSeoForCityCategory(
  cityId: string,
  categoryId: string
): Promise<{ title: string; description: string; url: string } | null> {
  try {
    const [city, category] = await Promise.all([
      prisma.city.findUnique({
        where: { id: cityId },
        include: { country: true },
      }),
      prisma.category.findUnique({
        where: { id: categoryId },
      }),
    ]);

    if (!city || !category) return null;

    // نفس المنطق المستخدم في صفحات الفرونت المركبة
    const countryName = city.country?.name || "";
    const cityName = city.name;

    const defaultTitle = `${category.name} في ${cityName}, ${countryName} | دليل الشركات`;
    const defaultDescription = `اكتشف أفضل شركات ${category.name} في ${cityName}, ${countryName}. شركات متخصصة مع تقييمات العملاء.`;

    const overridden = await applySeoOverride(
      {
        title: defaultTitle,
        description: defaultDescription,
      },
      `/country/${city.countryCode}/city/${city.slug}/category/${category.slug}`,
      { targetType: "CATEGORY", targetId: category.id }
    );

    const url = `${
      process.env.NEXT_PUBLIC_BASE_URL || "https://twsia.com"
    }/country/${city.countryCode}/city/${city.slug}/category/${category.slug}`;
    return {
      title: overridden.title,
      description: overridden.description,
      url,
    };
  } catch (error) {
    console.error("خطأ في getLiveSeoForCityCategory:", error);
    return null;
  }
}

export async function getLiveSeoForSubAreaCategory(
  subAreaId: string,
  categoryId: string
): Promise<{ title: string; description: string; url: string } | null> {
  try {
    const [subArea, category] = await Promise.all([
      prisma.subArea.findUnique({
        where: { id: subAreaId },
        include: {
          city: { include: { country: true } },
        },
      }),
      prisma.category.findUnique({
        where: { id: categoryId },
      }),
    ]);

    if (!subArea || !category) return null;

    // نفس المنطق المستخدم في صفحات الفرونت المركبة
    const countryName = subArea.city?.country?.name || "";
    const cityName = subArea.city?.name || "";
    const subAreaName = subArea.name;

    const defaultTitle = `${category.name} في ${subAreaName}, ${cityName}, ${countryName} | دليل الشركات`;
    const defaultDescription = `اكتشف أفضل شركات ${category.name} في ${subAreaName}, ${cityName}, ${countryName}. شركات متخصصة مع تقييمات العملاء.`;

    const overridden = await applySeoOverride(
      {
        title: defaultTitle,
        description: defaultDescription,
      },
      `/country/${subArea.city?.countryCode}/city/${subArea.city?.slug}/sub-area/${subArea.slug}/category/${category.slug}`,
      { targetType: "CATEGORY", targetId: category.id }
    );

    const url = `${
      process.env.NEXT_PUBLIC_BASE_URL || "https://twsia.com"
    }/country/${subArea.city?.countryCode}/city/${
      subArea.city?.slug
    }/sub-area/${subArea.slug}/category/${category.slug}`;
    return {
      title: overridden.title,
      description: overridden.description,
      url,
    };
  } catch (error) {
    console.error("خطأ في getLiveSeoForSubAreaCategory:", error);
    return null;
  }
}

export async function getLiveSeoForSubAreaSubcategory(
  subAreaId: string,
  subcategoryId: string
): Promise<{ title: string; description: string; url: string } | null> {
  try {
    const [subArea, subcategory] = await Promise.all([
      prisma.subArea.findUnique({
        where: { id: subAreaId },
        include: {
          city: { include: { country: true } },
        },
      }),
      prisma.subCategory.findUnique({
        where: { id: subcategoryId },
        include: { category: true },
      }),
    ]);

    if (!subArea || !subcategory) return null;

    // نفس المنطق المستخدم في صفحات الفرونت المركبة
    const countryName = subArea.city?.country?.name || "";
    const cityName = subArea.city?.name || "";
    const subAreaName = subArea.name;

    const defaultTitle = `أفضل 10 ${subcategory.name} في ${subAreaName}, ${cityName}, ${countryName} | ${subcategory.category.name}`;
    const defaultDescription = `اكتشف أفضل شركات ${subcategory.name} في ${subAreaName}, ${cityName}, ${countryName}.`;

    const overridden = await applySeoOverride(
      {
        title: defaultTitle,
        description: defaultDescription,
      },
      `/country/${subArea.city?.countryCode}/city/${subArea.city?.slug}/sub-area/${subArea.slug}/category/${subcategory.category.slug}/${subcategory.slug}`,
      { targetType: "SUBCATEGORY", targetId: subcategory.id }
    );

    const url = `${
      process.env.NEXT_PUBLIC_BASE_URL || "https://twsia.com"
    }/country/${subArea.city?.countryCode}/city/${
      subArea.city?.slug
    }/sub-area/${subArea.slug}/category/${subcategory.category.slug}/${
      subcategory.slug
    }`;
    return {
      title: overridden.title,
      description: overridden.description,
      url,
    };
  } catch (error) {
    console.error("خطأ في getLiveSeoForSubAreaSubcategory:", error);
    return null;
  }
}
