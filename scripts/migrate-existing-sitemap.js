/**
 * سكريبت ترحيل السايت ماب الحالية
 * 
 * يقوم بقراءة السايت ماب الحالية (public/sitemap.xml) وتحليلها
 * ثم إدخال جميع الروابط في جدول SitemapEntry الجديد
 * 
 * الاستخدام:
 * npm run sitemap:migrate
 * أو: tsx scripts/migrate-existing-sitemap.ts
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// تحليل URL وتحديد نوعه
function analyzeUrl(url) {
  const baseUrl = 'https://twsia.com';
  const urlPath = url.replace(baseUrl, '').replace(/^\//, '');

  let entryType = '';
  let entityIds = {};
  let sitemapFile = '';
  let fileIndex = null;
  let priority = 0.8;
  let changeFrequency = 'monthly';

  // الصفحة الرئيسية
  if (urlPath === '' || urlPath === '/') {
    entryType = 'STATIC';
    sitemapFile = 'static';
    priority = 1.0;
    changeFrequency = 'daily';
  }
  // صفحات ثابتة
  else if (['companies', 'search', 'about', 'services', 'privacy', 'terms', 'add-company'].includes(urlPath)) {
    entryType = 'STATIC';
    sitemapFile = 'static';
    if (urlPath === 'search') {
      priority = 0.9;
      changeFrequency = 'daily';
    } else {
      priority = 0.5;
      changeFrequency = 'monthly';
    }
  }
  // صفحات بنمط country/...
  else if (urlPath.startsWith('country/')) {
    const parts = urlPath.split('/');

    // /country/sy
    if (parts.length === 2) {
      entryType = 'COUNTRY';
      entityIds.countryCode = parts[1];
      sitemapFile = 'locations';
      priority = 0.8;
      changeFrequency = 'weekly';
    }
    // /country/sy/city/damascus
    else if (parts.length === 4 && parts[2] === 'city') {
      entryType = 'CITY';
      entityIds.countryCode = parts[1];
      entityIds.citySlug = parts[3];
      sitemapFile = 'locations';
      priority = 0.8;
      changeFrequency = 'weekly';
    }
    // /country/sy/category/hotels
    else if (parts.length === 4 && parts[2] === 'category') {
      entryType = 'COUNTRY_CATEGORY';
      entityIds.countryCode = parts[1];
      entityIds.categorySlug = parts[3];
      sitemapFile = 'categories-mixed';
      priority = 0.8;
      changeFrequency = 'weekly';
    }
    // /country/sy/category/hotels/luxury
    else if (parts.length === 5 && parts[2] === 'category') {
      entryType = 'COUNTRY_CATEGORY_SUB';
      entityIds.countryCode = parts[1];
      entityIds.categorySlug = parts[3];
      entityIds.subCategorySlug = parts[4];
      sitemapFile = 'categories-mixed';
      priority = 0.7;
      changeFrequency = 'weekly';
    }
    // /country/sy/city/damascus/sub-area/mezzeh
    else if (parts.length === 6 && parts[2] === 'city' && parts[4] === 'sub-area') {
      entryType = 'SUBAREA';
      entityIds.countryCode = parts[1];
      entityIds.citySlug = parts[3];
      entityIds.subAreaSlug = parts[5];
      sitemapFile = 'locations';
      priority = 0.7;
      changeFrequency = 'weekly';
    }
    // /country/sy/city/damascus/category/hotels
    else if (parts.length === 6 && parts[2] === 'city' && parts[4] === 'category') {
      entryType = 'CITY_CATEGORY';
      entityIds.countryCode = parts[1];
      entityIds.citySlug = parts[3];
      entityIds.categorySlug = parts[5];
      sitemapFile = 'categories-mixed';
      priority = 0.8;
      changeFrequency = 'weekly';
    }
    // /country/sy/city/damascus/category/hotels/luxury
    else if (parts.length === 7 && parts[2] === 'city' && parts[4] === 'category') {
      entryType = 'CITY_CATEGORY_SUB';
      entityIds.countryCode = parts[1];
      entityIds.citySlug = parts[3];
      entityIds.categorySlug = parts[5];
      entityIds.subCategorySlug = parts[6];
      sitemapFile = 'categories-mixed';
      priority = 0.7;
      changeFrequency = 'weekly';
    }
    // /country/sy/city/damascus/sub-area/mezzeh/category/hotels
    else if (parts.length === 8 && parts[2] === 'city' && parts[4] === 'sub-area' && parts[6] === 'category') {
      entryType = 'SUBAREA_CATEGORY';
      entityIds.countryCode = parts[1];
      entityIds.citySlug = parts[3];
      entityIds.subAreaSlug = parts[5];
      entityIds.categorySlug = parts[7];
      sitemapFile = 'categories-mixed';
      priority = 0.7;
      changeFrequency = 'weekly';
    }
    // /country/sy/city/damascus/sub-area/mezzeh/category/hotels/luxury
    else if (parts.length === 9 && parts[2] === 'city' && parts[4] === 'sub-area' && parts[6] === 'category') {
      entryType = 'SUBAREA_CATEGORY_SUB';
      entityIds.countryCode = parts[1];
      entityIds.citySlug = parts[3];
      entityIds.subAreaSlug = parts[5];
      entityIds.categorySlug = parts[7];
      entityIds.subCategorySlug = parts[8];
      sitemapFile = 'categories-mixed';
      priority = 0.7;
      changeFrequency = 'weekly';
    }
  }
  // صفحة شركة
  else {
    entryType = 'COMPANY';
    entityIds.companySlug = urlPath;
    sitemapFile = 'companies'; // سيتم تحديد الرقم لاحقاً
    priority = 0.9;
    changeFrequency = 'monthly';
  }

  return {
    entryType,
    slug: urlPath,
    entityIds,
    sitemapFile,
    fileIndex,
    priority,
    changeFrequency,
  };
}

// قراءة وتحليل السايت ماب XML
async function parseSitemapXml(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const urlMatches = content.match(/<loc>(.*?)<\/loc>/g);

  if (!urlMatches) {
    return [];
  }

  return urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
}

// ربط الكيانات بـ IDs من Database
async function resolveEntityIds(entityIds, entryType) {
  const result = {
    companyId: null,
    countryId: null,
    cityId: null,
    subAreaId: null,
    categoryId: null,
    subCategoryId: null,
  };

  try {
    // ربط الدولة
    if (entityIds.countryCode) {
      const country = await prisma.country.findUnique({
        where: { code: entityIds.countryCode },
        select: { id: true },
      });
      result.countryId = country?.id || null;
    }

    // ربط المدينة
    if (entityIds.citySlug) {
      const city = await prisma.city.findUnique({
        where: { slug: entityIds.citySlug },
        select: { id: true },
      });
      result.cityId = city?.id || null;
    }

    // ربط المنطقة
    if (entityIds.subAreaSlug) {
      const subArea = await prisma.subArea.findUnique({
        where: { slug: entityIds.subAreaSlug },
        select: { id: true },
      });
      result.subAreaId = subArea?.id || null;
    }

    // ربط الفئة
    if (entityIds.categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: entityIds.categorySlug },
        select: { id: true },
      });
      result.categoryId = category?.id || null;
    }

    // ربط الفئة الفرعية
    if (entityIds.subCategorySlug) {
      const subCategory = await prisma.subCategory.findUnique({
        where: { slug: entityIds.subCategorySlug },
        select: { id: true },
      });
      result.subCategoryId = subCategory?.id || null;
    }

    // ربط الشركة
    if (entityIds.companySlug && entryType === 'COMPANY') {
      const company = await prisma.company.findUnique({
        where: { slug: entityIds.companySlug },
        select: { id: true },
      });
      result.companyId = company?.id || null;
    }
  } catch (error) {
    console.error('❌ خطأ في ربط الكيانات:', error);
  }

  return result;
}

// الدالة الرئيسية
async function main() {
  console.log('🚀 بدء ترحيل السايت ماب الحالية...\n');

  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');

  // 1. قراءة السايت ماب
  console.log('📖 قراءة السايت ماب من:', sitemapPath);
  const urls = await parseSitemapXml(sitemapPath);
  console.log(`✅ تم العثور على ${urls.length} رابط\n`);

  // 2. إحصائيات
  const stats = {
    total: urls.length,
    static: 0,
    companies: 0,
    countries: 0,
    cities: 0,
    subAreas: 0,
    categories: 0,
    processed: 0,
    failed: 0,
  };

  // 3. معالجة كل URL
  let companiesCount = 0;

  for (const url of urls) {
    try {
      const analysis = analyzeUrl(url);
      const resolvedIds = await resolveEntityIds(analysis.entityIds, analysis.entryType);

      // تحديد fileIndex للشركات
      let fileIndex = null;
      if (analysis.entryType === 'COMPANY') {
        fileIndex = Math.floor(companiesCount / 10000) + 1;
        companiesCount++;
      }

      // إنشاء السجل
      await prisma.sitemapEntry.create({
        data: {
          entryType: analysis.entryType,
          slug: analysis.slug,
          url: url,
          priority: analysis.priority,
          changeFrequency: analysis.changeFrequency,
          sitemapFile: analysis.entryType === 'COMPANY' 
            ? `companies-${fileIndex}` 
            : analysis.sitemapFile,
          fileIndex: fileIndex,
          positionInFile: 0, // سنحدثه لاحقاً
          companyId: resolvedIds.companyId,
          countryId: resolvedIds.countryId,
          cityId: resolvedIds.cityId,
          subAreaId: resolvedIds.subAreaId,
          categoryId: resolvedIds.categoryId,
          subCategoryId: resolvedIds.subCategoryId,
          addedBy: null,
          batchNumber: null,
          addMethod: 'MANUAL', // Migration
          isActive: true,
        },
      });

      // تحديث الإحصائيات
      stats.processed++;
      if (analysis.entryType === 'STATIC') stats.static++;
      else if (analysis.entryType === 'COMPANY') stats.companies++;
      else if (analysis.entryType === 'COUNTRY') stats.countries++;
      else if (analysis.entryType === 'CITY') stats.cities++;
      else if (analysis.entryType === 'SUBAREA') stats.subAreas++;
      else stats.categories++;

      // طباعة التقدم كل 50 سجل
      if (stats.processed % 50 === 0) {
        console.log(`⏳ تم معالجة ${stats.processed}/${stats.total} رابط...`);
      }
    } catch (error) {
      console.error(`❌ فشل في معالجة: ${url}`, error.message);
      stats.failed++;
    }
  }

  // 4. تحديث positionInFile لكل ملف
  console.log('\n🔄 تحديث ترتيب الروابط داخل الملفات...');
  
  const files = await prisma.sitemapEntry.groupBy({
    by: ['sitemapFile'],
  });

  for (const file of files) {
    const entries = await prisma.sitemapEntry.findMany({
      where: { sitemapFile: file.sitemapFile },
      orderBy: { addedAt: 'asc' },
      select: { id: true },
    });

    for (let i = 0; i < entries.length; i++) {
      await prisma.sitemapEntry.update({
        where: { id: entries[i].id },
        data: { positionInFile: i + 1 },
      });
    }
  }

  // 5. إنشاء سجلات في SitemapFile
  console.log('\n📁 إنشاء سجلات الملفات...');
  
  const fileGroups = await prisma.sitemapEntry.groupBy({
    by: ['sitemapFile', 'fileIndex'],
    _count: true,
  });

  for (const group of fileGroups) {
    let fileType = 'STATIC';
    if (group.sitemapFile === 'static') fileType = 'STATIC';
    else if (group.sitemapFile === 'locations') fileType = 'LOCATIONS';
    else if (group.sitemapFile === 'categories-mixed') fileType = 'CATEGORIES_MIXED';
    else if (group.sitemapFile.startsWith('companies-')) fileType = 'COMPANIES';

    await prisma.sitemapFile.create({
      data: {
        fileName: `sitemap-${group.sitemapFile}.xml`,
        fileType: fileType,
        fileIndex: group.fileIndex,
        urlsCount: group._count,
        maxCapacity: fileType === 'COMPANIES' ? 10000 : 50000,
        isFull: fileType === 'COMPANIES' && group._count >= 10000,
        isActive: true,
      },
    });
  }

  // 6. إنشاء إعدادات السايت ماب
  console.log('\n⚙️ إنشاء الإعدادات...');
  await prisma.sitemapConfig.create({
    data: {
      companiesPerFile: 10000,
      maxFilesCount: 50,
      enableCompression: true,
      enableCaching: true,
      cacheTimeout: 3600,
      autoRebuild: false,
      totalUrls: stats.processed,
      totalFiles: fileGroups.length,
    },
  });

  // 7. عرض النتائج
  console.log('\n' + '='.repeat(50));
  console.log('✅ اكتمل الترحيل بنجاح!');
  console.log('='.repeat(50));
  console.log(`📊 الإحصائيات:`);
  console.log(`   - إجمالي الروابط: ${stats.total}`);
  console.log(`   - تمت معالجتها: ${stats.processed}`);
  console.log(`   - فشلت: ${stats.failed}`);
  console.log(`\n📂 التوزيع حسب النوع:`);
  console.log(`   - صفحات ثابتة: ${stats.static}`);
  console.log(`   - شركات: ${stats.companies}`);
  console.log(`   - دول: ${stats.countries}`);
  console.log(`   - مدن: ${stats.cities}`);
  console.log(`   - مناطق: ${stats.subAreas}`);
  console.log(`   - فئات: ${stats.categories}`);
  console.log(`\n📁 عدد الملفات: ${fileGroups.length}`);
  console.log('='.repeat(50) + '\n');
}

// تشغيل السكريبت
main()
  .catch((error) => {
    console.error('❌ خطأ فادح:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

