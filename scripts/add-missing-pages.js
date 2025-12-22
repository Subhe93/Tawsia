/**
 * سكريبت إضافة الصفحات المفقودة للسايت ماب
 * 
 * يقوم بإضافة:
 * 1. الصفحات الثابتة المفقودة (الصفحة الرئيسية، إلخ)
 * 2. الفئات المستقلة /category/[category]
 * 3. الفئات الفرعية المستقلة /category/[category]/[subcategory]
 * 4. صفحات مدينة + فئة + فرعية المفقودة
 * 
 * الاستخدام:
 * npm run sitemap:add-missing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const baseUrl = 'https://twsia.com';

// الصفحات الثابتة المفقودة
const staticPages = [
  {
    slug: '',
    url: baseUrl,
    priority: 1.0,
    changeFrequency: 'daily',
    description: 'الصفحة الرئيسية',
  },
  {
    slug: 'search',
    url: `${baseUrl}/search`,
    priority: 0.9,
    changeFrequency: 'daily',
    description: 'صفحة البحث',
  },
  {
    slug: 'about',
    url: `${baseUrl}/about`,
    priority: 0.5,
    changeFrequency: 'monthly',
    description: 'من نحن',
  },
  {
    slug: 'services',
    url: `${baseUrl}/services`,
    priority: 0.5,
    changeFrequency: 'monthly',
    description: 'الخدمات',
  },
  {
    slug: 'privacy',
    url: `${baseUrl}/privacy`,
    priority: 0.3,
    changeFrequency: 'yearly',
    description: 'سياسة الخصوصية',
  },
  {
    slug: 'terms',
    url: `${baseUrl}/terms`,
    priority: 0.3,
    changeFrequency: 'yearly',
    description: 'الشروط والأحكام',
  },
  {
    slug: 'add-company',
    url: `${baseUrl}/add-company`,
    priority: 0.7,
    changeFrequency: 'monthly',
    description: 'إضافة شركة',
  },
];

// دالة للتحقق من وجود URL
async function urlExists(url) {
  const existing = await prisma.sitemapEntry.findUnique({
    where: { url },
  });
  return !!existing;
}

// إضافة الصفحات الثابتة
async function addStaticPages() {
  console.log('📄 إضافة الصفحات الثابتة المفقودة...\n');
  
  let added = 0;
  let skipped = 0;

  for (const page of staticPages) {
    const exists = await urlExists(page.url);
    
    if (exists) {
      console.log(`⏭️  تخطي: ${page.description} (موجودة مسبقاً)`);
      skipped++;
      continue;
    }

    try {
      await prisma.sitemapEntry.create({
        data: {
          entryType: 'STATIC',
          slug: page.slug,
          url: page.url,
          priority: page.priority,
          changeFrequency: page.changeFrequency,
          sitemapFile: 'static',
          fileIndex: null,
          positionInFile: 0,
          addMethod: 'AUTO_GENERATED',
          isActive: true,
        },
      });
      
      console.log(`✅ تمت إضافة: ${page.description}`);
      added++;
    } catch (error) {
      console.error(`❌ فشل في إضافة: ${page.description}`, error.message);
    }
  }

  return { added, skipped };
}

// إضافة الفئات المستقلة
async function addStandaloneCategories() {
  console.log('\n📂 إضافة الفئات المستقلة...\n');
  
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, name: true },
  });

  let added = 0;
  let skipped = 0;

  for (const category of categories) {
    const url = `${baseUrl}/category/${category.slug}`;
    const exists = await urlExists(url);
    
    if (exists) {
      skipped++;
      continue;
    }

    try {
      await prisma.sitemapEntry.create({
        data: {
          entryType: 'CATEGORY',
          slug: `category/${category.slug}`,
          url: url,
          categoryId: category.id,
          priority: 0.8,
          changeFrequency: 'weekly',
          sitemapFile: 'categories-simple',
          fileIndex: null,
          positionInFile: 0,
          addMethod: 'AUTO_GENERATED',
          isActive: true,
        },
      });
      
      console.log(`✅ فئة: ${category.name}`);
      added++;
    } catch (error) {
      console.error(`❌ فشل: ${category.name}`, error.message);
    }
  }

  return { added, skipped };
}

// إضافة الفئات الفرعية المستقلة
async function addStandaloneSubCategories() {
  console.log('\n📂 إضافة الفئات الفرعية المستقلة...\n');
  
  const subCategories = await prisma.subCategory.findMany({
    where: { isActive: true },
    include: {
      category: {
        select: { id: true, slug: true, name: true },
      },
    },
  });

  let added = 0;
  let skipped = 0;

  for (const subCat of subCategories) {
    const url = `${baseUrl}/category/${subCat.category.slug}/${subCat.slug}`;
    const exists = await urlExists(url);
    
    if (exists) {
      skipped++;
      continue;
    }

    try {
      await prisma.sitemapEntry.create({
        data: {
          entryType: 'CATEGORY_SUB',
          slug: `category/${subCat.category.slug}/${subCat.slug}`,
          url: url,
          categoryId: subCat.categoryId,
          subCategoryId: subCat.id,
          priority: 0.7,
          changeFrequency: 'weekly',
          sitemapFile: 'categories-simple',
          fileIndex: null,
          positionInFile: 0,
          addMethod: 'AUTO_GENERATED',
          isActive: true,
        },
      });
      
      console.log(`✅ ${subCat.category.name} > ${subCat.name}`);
      added++;
    } catch (error) {
      console.error(`❌ فشل: ${subCat.name}`, error.message);
    }
  }

  return { added, skipped };
}

// إضافة صفحات مدينة + فئة + فرعية
async function addCityCategorySubPages() {
  console.log('\n🏙️ إضافة صفحات مدينة + فئة + فرعية...\n');
  
  const countries = await prisma.country.findMany({
    where: { isActive: true },
    select: { id: true, code: true },
  });

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, countryCode: true },
  });

  const subCategories = await prisma.subCategory.findMany({
    where: { isActive: true },
    include: {
      category: {
        select: { id: true, slug: true },
      },
    },
  });

  let added = 0;
  let skipped = 0;
  let processed = 0;
  const total = cities.length * subCategories.length;

  for (const city of cities) {
    const country = countries.find(c => c.code === city.countryCode);
    if (!country) continue;

    for (const subCat of subCategories) {
      processed++;
      
      const url = `${baseUrl}/country/${city.countryCode}/city/${city.slug}/category/${subCat.category.slug}/${subCat.slug}`;
      const exists = await urlExists(url);
      
      if (exists) {
        skipped++;
        continue;
      }

      try {
        await prisma.sitemapEntry.create({
          data: {
            entryType: 'CITY_CATEGORY_SUB',
            slug: `country/${city.countryCode}/city/${city.slug}/category/${subCat.category.slug}/${subCat.slug}`,
            url: url,
            countryId: country.id,
            cityId: city.id,
            categoryId: subCat.categoryId,
            subCategoryId: subCat.id,
            priority: 0.7,
            changeFrequency: 'weekly',
            sitemapFile: 'categories-mixed',
            fileIndex: null,
            positionInFile: 0,
            addMethod: 'AUTO_GENERATED',
            isActive: true,
          },
        });
        
        added++;
        
        // طباعة التقدم كل 50 صفحة
        if (processed % 50 === 0) {
          console.log(`⏳ تم معالجة ${processed}/${total}...`);
        }
      } catch (error) {
        // تجاهل الأخطاء الصامتة
      }
    }
  }

  console.log(`✅ تمت إضافة ${added} صفحة`);
  return { added, skipped };
}

// تحديث positionInFile
async function updatePositions() {
  console.log('\n🔄 تحديث ترتيب الصفحات...');
  
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
  
  console.log('✅ تم تحديث الترتيب');
}

// تحديث أو إنشاء سجلات SitemapFile
async function updateSitemapFiles() {
  console.log('\n📁 تحديث سجلات الملفات...');
  
  const fileGroups = await prisma.sitemapEntry.groupBy({
    by: ['sitemapFile', 'fileIndex'],
    _count: true,
  });

  for (const group of fileGroups) {
    let fileType = 'STATIC';
    if (group.sitemapFile === 'static') fileType = 'STATIC';
    else if (group.sitemapFile === 'locations') fileType = 'LOCATIONS';
    else if (group.sitemapFile === 'categories-simple') fileType = 'CATEGORIES_SIMPLE';
    else if (group.sitemapFile === 'categories-mixed') fileType = 'CATEGORIES_MIXED';
    else if (group.sitemapFile.startsWith('companies-')) fileType = 'COMPANIES';

    const existing = await prisma.sitemapFile.findUnique({
      where: { fileName: `sitemap-${group.sitemapFile}.xml` },
    });

    if (existing) {
      // تحديث
      await prisma.sitemapFile.update({
        where: { id: existing.id },
        data: {
          urlsCount: group._count,
          needsRebuild: true,
        },
      });
    } else {
      // إنشاء جديد
      await prisma.sitemapFile.create({
        data: {
          fileName: `sitemap-${group.sitemapFile}.xml`,
          fileType: fileType,
          fileIndex: group.fileIndex,
          urlsCount: group._count,
          maxCapacity: fileType === 'COMPANIES' ? 10000 : 50000,
          isFull: fileType === 'COMPANIES' && group._count >= 10000,
          isActive: true,
          needsRebuild: true,
        },
      });
    }
  }
  
  console.log('✅ تم تحديث سجلات الملفات');
}

// تحديث الإحصائيات
async function updateConfig() {
  console.log('\n⚙️ تحديث الإحصائيات...');
  
  const totalUrls = await prisma.sitemapEntry.count({
    where: { isActive: true },
  });
  
  const totalFiles = await prisma.sitemapFile.count({
    where: { isActive: true },
  });

  await prisma.sitemapConfig.updateMany({
    data: {
      totalUrls,
      totalFiles,
    },
  });
  
  console.log('✅ تم تحديث الإحصائيات');
}

// الدالة الرئيسية
async function main() {
  console.log('🚀 بدء إضافة الصفحات المفقودة...\n');
  console.log('='.repeat(50) + '\n');

  const results = {
    static: { added: 0, skipped: 0 },
    categories: { added: 0, skipped: 0 },
    subCategories: { added: 0, skipped: 0 },
    citySubPages: { added: 0, skipped: 0 },
  };

  // 1. الصفحات الثابتة
  results.static = await addStaticPages();

  // 2. الفئات المستقلة
  results.categories = await addStandaloneCategories();

  // 3. الفئات الفرعية المستقلة
  results.subCategories = await addStandaloneSubCategories();

  // 4. مدينة + فئة + فرعية
  results.citySubPages = await addCityCategorySubPages();

  // 5. تحديث الترتيب
  await updatePositions();

  // 6. تحديث الملفات
  await updateSitemapFiles();

  // 7. تحديث الإحصائيات
  await updateConfig();

  // 8. عرض النتائج
  console.log('\n' + '='.repeat(50));
  console.log('✅ اكتمل إضافة الصفحات المفقودة!');
  console.log('='.repeat(50));
  console.log('\n📊 النتائج:');
  console.log(`\n📄 الصفحات الثابتة:`);
  console.log(`   - أضيف: ${results.static.added}`);
  console.log(`   - تم تخطيها: ${results.static.skipped}`);
  
  console.log(`\n📂 الفئات المستقلة:`);
  console.log(`   - أضيف: ${results.categories.added}`);
  console.log(`   - تم تخطيها: ${results.categories.skipped}`);
  
  console.log(`\n📂 الفئات الفرعية المستقلة:`);
  console.log(`   - أضيف: ${results.subCategories.added}`);
  console.log(`   - تم تخطيها: ${results.subCategories.skipped}`);
  
  console.log(`\n🏙️ مدينة + فئة + فرعية:`);
  console.log(`   - أضيف: ${results.citySubPages.added}`);
  console.log(`   - تم تخطيها: ${results.citySubPages.skipped}`);
  
  const totalAdded = results.static.added + results.categories.added + 
                     results.subCategories.added + results.citySubPages.added;
  
  console.log(`\n📈 الإجمالي:`);
  console.log(`   - إجمالي المضاف: ${totalAdded} صفحة جديدة`);
  
  const finalCount = await prisma.sitemapEntry.count({ where: { isActive: true } });
  console.log(`   - إجمالي الروابط الآن: ${finalCount}`);
  
  console.log('\n' + '='.repeat(50) + '\n');
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

