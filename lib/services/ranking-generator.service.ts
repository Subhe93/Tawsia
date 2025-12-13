import prisma from "@/lib/prisma";
import {
  RankingPageGeneratorOptions,
  RankingPageGeneratorResult,
} from "@/lib/types/database";
import {
  createRankingPage,
  checkRankingPageSlugExists,
  countCompaniesByFilters,
} from "@/lib/database/ranking-queries";

/**
 * دالة مساعدة لتوليد عنوان الصفحة
 */
function generateTitle(parts: {
  country?: string;
  city?: string;
  subArea?: string;
  category?: string;
  subCategory?: string;
  limit?: number;
}): string {
  const { country, city, subArea, category, subCategory, limit = 10 } = parts;
  let title = `أفضل ${limit}`;

  if (subCategory) {
    title += ` ${subCategory}`;
  } else if (category) {
    title += ` ${category}`;
  }

  if (subArea) {
    title += ` في ${subArea}`;
  }

  if (city) {
    title += subArea ? `، ${city}` : ` في ${city}`;
  }

  if (country) {
    title += city || subArea ? `، ${country}` : ` في ${country}`;
  }

  return title;
}

/**
 * دالة مساعدة لتوليد وصف الصفحة
 */
function generateDescription(parts: {
  country?: string;
  city?: string;
  subArea?: string;
  category?: string;
  subCategory?: string;
  limit?: number;
}): string {
  const { country, city, subArea, category, subCategory, limit = 10 } = parts;
  let desc = `اكتشف أفضل ${limit}`;

  if (subCategory) {
    desc += ` ${subCategory}`;
  } else if (category) {
    desc += ` ${category}`;
  }

  let location = "";
  if (subArea) location = subArea;
  else if (city) location = city;
  else if (country) location = country;

  if (location) {
    desc += ` في ${location}`;
  }

  desc += `. تصفح قائمة الشركات الموثوقة مع التقييمات والمراجعات وتفاصيل الاتصال.`;

  return desc;
}

/**
 * دالة مساعدة لتوليد meta keywords
 */
function generateKeywords(parts: {
  country?: string;
  city?: string;
  subArea?: string;
  category?: string;
  subCategory?: string;
}): string[] {
  const { country, city, subArea, category, subCategory } = parts;
  const keywords: string[] = [];

  if (subCategory) keywords.push(subCategory);
  if (category) keywords.push(category);
  if (subArea) keywords.push(subArea);
  if (city) keywords.push(city);
  if (country) keywords.push(country);

  // إضافة كلمات مفتاحية إضافية
  keywords.push("شركات");
  keywords.push("دليل");
  keywords.push("تقييمات");

  return keywords;
}

/**
 * خدمة توليد صفحات التصنيف تلقائياً
 */
export class RankingPageGenerator {
  /**
   * توليد صفحات تصنيف بناءً على الخيارات المحددة
   */
  static async generatePages(
    options: RankingPageGeneratorOptions
  ): Promise<RankingPageGeneratorResult> {
    const {
      countries,
      cities,
      categories,
      subCategories,
      subAreas,
      minCompanies = 5,
      skipExisting = true,
      includeSubCategories = true,
      includeSubAreas = true,
    } = options;

    const result: RankingPageGeneratorResult = {
      total: 0,
      created: 0,
      skipped: 0,
      errors: [],
      skippedReasons: [],
      pages: [],
    };

    try {
      // جلب البيانات من قاعدة البيانات مع slugs
      const [
        allCountries,
        allCities,
        allCategories,
        allSubCategories,
        allSubAreas,
      ] = await Promise.all([
        countries && countries.length > 0
          ? prisma.country.findMany({
              where: { code: { in: countries }, isActive: true },
              select: { id: true, code: true, name: true },
            })
          : prisma.country.findMany({ 
              where: { isActive: true },
              select: { id: true, code: true, name: true },
            }),

        cities && cities.length > 0
          ? prisma.city.findMany({
              where: { slug: { in: cities }, isActive: true },
              include: { country: { select: { id: true, code: true, name: true } } },
            })
          : prisma.city.findMany({
              where: { isActive: true },
              include: { country: { select: { id: true, code: true, name: true } } },
            }),

        categories && categories.length > 0
          ? prisma.category.findMany({
              where: { slug: { in: categories }, isActive: true },
              select: { id: true, slug: true, name: true },
            })
          : prisma.category.findMany({ 
              where: { isActive: true },
              select: { id: true, slug: true, name: true },
            }),

        includeSubCategories &&
        subCategories &&
        subCategories.length > 0
          ? prisma.subCategory.findMany({
              where: { slug: { in: subCategories }, isActive: true },
              include: { category: { select: { id: true, slug: true, name: true } } },
            })
          : includeSubCategories
          ? prisma.subCategory.findMany({
              where: { isActive: true },
              include: { category: { select: { id: true, slug: true, name: true } } },
            })
          : [],

        includeSubAreas && subAreas && subAreas.length > 0
          ? prisma.subArea.findMany({
              where: { slug: { in: subAreas }, isActive: true },
              include: { 
                city: { select: { id: true, slug: true, name: true, countryId: true } },
                country: { select: { id: true, code: true, name: true } },
              },
            })
          : includeSubAreas
          ? prisma.subArea.findMany({
              where: { isActive: true },
              include: { 
                city: { select: { id: true, slug: true, name: true, countryId: true } },
                country: { select: { id: true, code: true, name: true } },
              },
            })
          : [],
      ]);

      // توليد الصفحات بناءً على التركيبات
      // 1. دولة + فئة
      for (const country of allCountries) {
        for (const category of allCategories) {
          await this.createPage(
            {
              countryId: country.id,
              countryCode: country.code,
              countryName: country.name,
              categoryId: category.id,
              categorySlug: category.slug,
              categoryName: category.name,
            },
            minCompanies,
            skipExisting,
            result
          );
        }
      }

      // 2. دولة + مدينة + فئة
      for (const city of allCities) {
        for (const category of allCategories) {
          await this.createPage(
            {
              countryId: city.countryId,
              countryCode: city.country.code,
              countryName: city.country.name,
              cityId: city.id,
              citySlug: city.slug,
              cityName: city.name,
              categoryId: category.id,
              categorySlug: category.slug,
              categoryName: category.name,
            },
            minCompanies,
            skipExisting,
            result
          );
        }
      }

      // 3. دولة + مدينة + فئة + فئة فرعية
      if (includeSubCategories) {
        for (const city of allCities) {
          for (const subCategory of allSubCategories) {
            await this.createPage(
              {
                countryId: city.countryId,
                countryCode: city.country.code,
                countryName: city.country.name,
                cityId: city.id,
                citySlug: city.slug,
                cityName: city.name,
                categoryId: subCategory.categoryId,
                categorySlug: subCategory.category.slug,
                categoryName: subCategory.category.name,
                subCategoryId: subCategory.id,
                subCategorySlug: subCategory.slug,
                subCategoryName: subCategory.name,
              },
              minCompanies,
              skipExisting,
              result
            );
          }
        }
      }

      // 4. دولة + مدينة + منطقة فرعية + فئة
      if (includeSubAreas) {
        for (const subArea of allSubAreas) {
          for (const category of allCategories) {
            await this.createPage(
              {
                countryId: subArea.countryId,
                countryCode: subArea.country.code,
                countryName: subArea.country.name,
                cityId: subArea.cityId,
                citySlug: subArea.city.slug,
                cityName: subArea.city.name,
                subAreaId: subArea.id,
                subAreaSlug: subArea.slug,
                subAreaName: subArea.name,
                categoryId: category.id,
                categorySlug: category.slug,
                categoryName: category.name,
              },
              minCompanies,
              skipExisting,
              result
            );
          }
        }
      }

      // 5. دولة + مدينة + منطقة فرعية + فئة + فئة فرعية
      if (includeSubAreas && includeSubCategories) {
        for (const subArea of allSubAreas) {
          for (const subCategory of allSubCategories) {
            await this.createPage(
              {
                countryId: subArea.countryId,
                countryCode: subArea.country.code,
                countryName: subArea.country.name,
                cityId: subArea.cityId,
                citySlug: subArea.city.slug,
                cityName: subArea.city.name,
                subAreaId: subArea.id,
                subAreaSlug: subArea.slug,
                subAreaName: subArea.name,
                categoryId: subCategory.categoryId,
                categorySlug: subCategory.category.slug,
                categoryName: subCategory.category.name,
                subCategoryId: subCategory.id,
                subCategorySlug: subCategory.slug,
                subCategoryName: subCategory.name,
              },
              minCompanies,
              skipExisting,
              result
            );
          }
        }
      }
    } catch (error) {
      console.error("خطأ في توليد الصفحات:", error);
      result.errors.push({
        combination: "general",
        error: error instanceof Error ? error.message : "خطأ غير معروف",
      });
    }

    return result;
  }

  /**
   * إنشاء صفحة تصنيف واحدة
   */
  private static async createPage(
    combination: {
      countryId?: string;
      countryCode?: string;
      countryName?: string;
      cityId?: string;
      citySlug?: string;
      cityName?: string;
      subAreaId?: string;
      subAreaSlug?: string;
      subAreaName?: string;
      categoryId?: string;
      categorySlug?: string;
      categoryName?: string;
      subCategoryId?: string;
      subCategorySlug?: string;
      subCategoryName?: string;
    },
    minCompanies: number,
    skipExisting: boolean,
    result: RankingPageGeneratorResult
  ) {
    try {
      result.total++;

      // توليد slug من السلوغات الموجودة
      const parts = [
        "best",
        combination.subCategorySlug || combination.categorySlug,
        combination.subAreaSlug,
        combination.citySlug,
        combination.countryCode,
      ].filter(Boolean);

      const baseSlug = parts.join("-");

      // توليد العنوان للاستخدام في رسائل التخطي
      const tempTitle = generateTitle({
        country: combination.countryName,
        city: combination.cityName,
        subArea: combination.subAreaName,
        category: combination.categoryName,
        subCategory: combination.subCategoryName,
        limit: 10,
      });

      // التحقق من وجود الصفحة
      if (skipExisting) {
        const exists = await checkRankingPageSlugExists(baseSlug);
        if (exists) {
          result.skipped++;
          result.skippedReasons.push({
            title: tempTitle,
            reason: "موجودة مسبقاً",
            details: `الصفحة بـ slug: ${baseSlug} موجودة بالفعل`,
          });
          return;
        }
      }

      // التحقق من عدد الشركات
      const companiesCount = await countCompaniesByFilters({
        countryId: combination.countryId,
        cityId: combination.cityId,
        subAreaId: combination.subAreaId,
        categoryId: combination.categoryId,
        subCategoryId: combination.subCategoryId,
      });

      if (companiesCount < minCompanies) {
        result.skipped++;
        result.skippedReasons.push({
          title: tempTitle,
          reason: "عدد شركات غير كافي",
          details: `يحتوي على ${companiesCount} شركة فقط (الحد الأدنى: ${minCompanies})`,
        });
        return;
      }

      // توليد البيانات
      const title = generateTitle({
        country: combination.countryName,
        city: combination.cityName,
        subArea: combination.subAreaName,
        category: combination.categoryName,
        subCategory: combination.subCategoryName,
        limit: 10,
      });

      const description = generateDescription({
        country: combination.countryName,
        city: combination.cityName,
        subArea: combination.subAreaName,
        category: combination.categoryName,
        subCategory: combination.subCategoryName,
        limit: 10,
      });

      const keywords = generateKeywords({
        country: combination.countryName,
        city: combination.cityName,
        subArea: combination.subAreaName,
        category: combination.categoryName,
        subCategory: combination.subCategoryName,
      });

      // إنشاء الصفحة
      const page = await createRankingPage({
        slug: baseSlug,
        title,
        description,
        metaTitle: title,
        metaDescription: description,
        metaKeywords: keywords,
        countryId: combination.countryId,
        cityId: combination.cityId,
        subAreaId: combination.subAreaId,
        categoryId: combination.categoryId,
        subCategoryId: combination.subCategoryId,
        limit: 10,
        sortBy: "rating",
        isActive: true,
        isAutoGenerated: true,
        publishedAt: new Date(),
      });

      result.created++;
      result.pages.push({
        id: page.id,
        slug: page.slug,
        title: page.title,
      });
    } catch (error) {
      result.errors.push({
        combination: JSON.stringify(combination),
        error: error instanceof Error ? error.message : "خطأ غير معروف",
      });
    }
  }
}

