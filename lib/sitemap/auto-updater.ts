/**
 * نظام التحديث التلقائي للسايت ماب
 * يتم استدعاؤه عند إضافة/تعديل الكيانات
 */

import prisma from '@/lib/prisma';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';

/**
 * تحديث أو إضافة صفحة دولة
 */
export async function updateCountryInSitemap(countryId: string) {
  try {
    const country = await prisma.country.findUnique({
      where: { id: countryId },
      select: { code: true, isActive: true },
    });

    if (!country) return;

    const url = `${baseUrl}/country/${country.code}`;

    if (!country.isActive) {
      // إلغاء تفعيل إذا غير نشط
      await prisma.sitemapEntry.updateMany({
        where: { url },
        data: { isActive: false },
      });
      return;
    }

    // تحديث أو إنشاء
    await prisma.sitemapEntry.upsert({
      where: { url },
      create: {
        entryType: 'COUNTRY',
        slug: `country/${country.code}`,
        url,
        countryId,
        priority: 0.8,
        changeFrequency: 'weekly',
        sitemapFile: 'locations',
        positionInFile: 0,
        addMethod: 'AUTO_GENERATED',
        isActive: true,
      },
      update: {
        isActive: true,
        lastModified: new Date(),
      },
    });

    // تحديث حالة الملف
    await markFileForRebuild('sitemap-locations.xml');
  } catch (error) {
    console.error('خطأ في تحديث صفحة الدولة:', error);
  }
}

/**
 * تحديث أو إضافة صفحة مدينة
 */
export async function updateCityInSitemap(cityId: string) {
  try {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: { country: { select: { code: true, id: true } } },
    });

    if (!city) return;

    const url = `${baseUrl}/country/${city.countryCode}/city/${city.slug}`;

    if (!city.isActive) {
      await prisma.sitemapEntry.updateMany({
        where: { url },
        data: { isActive: false },
      });
      return;
    }

    await prisma.sitemapEntry.upsert({
      where: { url },
      create: {
        entryType: 'CITY',
        slug: `country/${city.countryCode}/city/${city.slug}`,
        url,
        countryId: city.country.id,
        cityId,
        priority: 0.8,
        changeFrequency: 'weekly',
        sitemapFile: 'locations',
        positionInFile: 0,
        addMethod: 'AUTO_GENERATED',
        isActive: true,
      },
      update: {
        isActive: true,
        lastModified: new Date(),
      },
    });

    await markFileForRebuild('sitemap-locations.xml');
  } catch (error) {
    console.error('خطأ في تحديث صفحة المدينة:', error);
  }
}

/**
 * تحديث أو إضافة صفحة منطقة
 */
export async function updateSubAreaInSitemap(subAreaId: string) {
  try {
    const subArea = await prisma.subArea.findUnique({
      where: { id: subAreaId },
      include: {
        city: { select: { slug: true } },
        country: { select: { id: true } },
      },
    });

    if (!subArea) return;

    const url = `${baseUrl}/country/${subArea.countryCode}/city/${subArea.city.slug}/sub-area/${subArea.slug}`;

    if (!subArea.isActive) {
      await prisma.sitemapEntry.updateMany({
        where: { url },
        data: { isActive: false },
      });
      return;
    }

    await prisma.sitemapEntry.upsert({
      where: { url },
      create: {
        entryType: 'SUBAREA',
        slug: `country/${subArea.countryCode}/city/${subArea.city.slug}/sub-area/${subArea.slug}`,
        url,
        countryId: subArea.country.id,
        cityId: subArea.cityId,
        subAreaId,
        priority: 0.7,
        changeFrequency: 'weekly',
        sitemapFile: 'locations',
        positionInFile: 0,
        addMethod: 'AUTO_GENERATED',
        isActive: true,
      },
      update: {
        isActive: true,
        lastModified: new Date(),
      },
    });

    await markFileForRebuild('sitemap-locations.xml');
  } catch (error) {
    console.error('خطأ في تحديث صفحة المنطقة:', error);
  }
}

/**
 * تحديث أو إضافة صفحة فئة
 */
export async function updateCategoryInSitemap(categoryId: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) return;

    const url = `${baseUrl}/category/${category.slug}`;

    if (!category.isActive) {
      await prisma.sitemapEntry.updateMany({
        where: { url },
        data: { isActive: false },
      });
      return;
    }

    await prisma.sitemapEntry.upsert({
      where: { url },
      create: {
        entryType: 'CATEGORY',
        slug: `category/${category.slug}`,
        url,
        categoryId,
        priority: 0.8,
        changeFrequency: 'weekly',
        sitemapFile: 'categories-simple',
        positionInFile: 0,
        addMethod: 'AUTO_GENERATED',
        isActive: true,
      },
      update: {
        isActive: true,
        lastModified: new Date(),
      },
    });

    await markFileForRebuild('sitemap-categories-simple.xml');
  } catch (error) {
    console.error('خطأ في تحديث صفحة الفئة:', error);
  }
}

/**
 * تحديث معلومات شركة في السايت ماب
 */
import { distributeCompanies, updateFileStats } from '@/lib/sitemap/distributor';

/**
 * تحديث أو إضافة شركة في السايت ماب
 */
export async function updateCompanyInSitemap(companyId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { slug: true, isActive: true, updatedAt: true },
    });

    if (!company) return;

    const entry = await prisma.sitemapEntry.findFirst({
      where: { companyId },
    });

    // 1. تحديث شركة موجودة
    if (entry) {
      await prisma.sitemapEntry.update({
        where: { id: entry.id },
        data: {
          slug: company.slug,
          url: `${baseUrl}/${company.slug}`,
          isActive: company.isActive,
          lastModified: company.updatedAt,
        },
      });
      await markFileForRebuild(`sitemap-${entry.sitemapFile}.xml`);
      return;
    }

    // 2. إضافة شركة جديدة (تم إيقافها بناءً على طلب المستخدم)
    // إذا كنت تريد تفعيل الإضافة التلقائية، يمكنك إلغاء تعليق الأكواد هنا
  } catch (error) {
    console.error('خطأ في تحديث/إضافة الشركة للسايت ماب:', error);
  }
}

/**
 * تحديد ملف يحتاج إعادة بناء
 */
async function markFileForRebuild(fileName: string) {
  try {
    await prisma.sitemapFile.updateMany({
      where: { fileName },
      data: { needsRebuild: true },
    });
  } catch (error) {
    console.error('خطأ في تحديد الملف للبناء:', error);
  }
}

/**
 * إعادة بناء الملفات التي تحتاج تحديث (يمكن تشغيله بـ Cron)
 */
export async function autoRebuildFiles() {
  try {
    const filesToRebuild = await prisma.sitemapFile.findMany({
      where: { needsRebuild: true, isActive: true },
      select: { fileName: true },
    });

    if (filesToRebuild.length === 0) {
      return { rebuilt: 0, message: 'لا توجد ملفات تحتاج تحديث' };
    }

    // يمكن استدعاء rebuildModifiedFiles هنا
    console.log(`🔄 ${filesToRebuild.length} ملفات تحتاج إعادة بناء`);

    return {
      rebuilt: filesToRebuild.length,
      files: filesToRebuild.map((f) => f.fileName),
    };
  } catch (error) {
    console.error('خطأ في إعادة البناء التلقائي:', error);
    return { rebuilt: 0, message: 'فشل' };
  }
}

