import { prisma } from '@/lib/prisma';
import { sanitizeSlug } from '@/lib/utils/banned-slug-words';

// دالة لتحديث إحصائيات البلدان
export async function updateCountryStats() {
  try {
    const countries = await prisma.country.findMany();
    
    for (const country of countries) {
      const companiesCount = await prisma.company.count({
        where: {
          countryId: country.id,
          isActive: true
        }
      });
      
      await prisma.country.update({
        where: { id: country.id },
        data: { companiesCount }
      });
    }
    
    console.log('✅ تم تحديث إحصائيات البلدان');
  } catch (error) {
    console.error('❌ خطأ في تحديث إحصائيات البلدان:', error);
  }
}

// دالة لتحديث إحصائيات المدن
export async function updateCityStats() {
  try {
    const cities = await prisma.city.findMany();
    
    for (const city of cities) {
      const companiesCount = await prisma.company.count({
        where: {
          cityId: city.id,
          isActive: true
        }
      });
      
      await prisma.city.update({
        where: { id: city.id },
        data: { companiesCount }
      });
    }
    
    console.log('✅ تم تحديث إحصائيات المدن');
  } catch (error) {
    console.error('❌ خطأ في تحديث إحصائيات المدن:', error);
  }
}

// دالة لتحديث إحصائيات الفئات
export async function updateCategoryStats() {
  try {
    const categories = await prisma.category.findMany();
    
    for (const category of categories) {
      const companiesCount = await prisma.company.count({
        where: {
          categoryId: category.id,
          isActive: true
        }
      });
      
      await prisma.category.update({
        where: { id: category.id },
        data: { companiesCount }
      });
    }
    
    console.log('✅ تم تحديث إحصائيات الفئات');
  } catch (error) {
    console.error('❌ خطأ في تحديث إحصائيات الفئات:', error);
  }
}

// دالة لتحديث جميع الإحصائيات
export async function updateAllStats() {
  console.log('🔄 بدء تحديث الإحصائيات...');
  
  await Promise.all([
    updateCountryStats(),
    updateCityStats(),
    updateCategoryStats()
  ]);
  
  console.log('✅ تم تحديث جميع الإحصائيات');
}

// دالة لإنشاء slug فريد (الإصدار القديم - يدعم العربية)
export function createSlug(text: string, suffix?: string): string {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[\s\u0600-\u06FF]+/g, '-') // استبدال الأحرف العربية والمسافات
    .replace(/[^\w\-]+/g, '') // إزالة الأحرف الخاصة
    .replace(/\-\-+/g, '-') // استبدال عدة شرطات بشرطة واحدة
    .replace(/^-+/, '') // إزالة الشرطات من البداية
    .replace(/-+$/, ''); // إزالة الشرطات من النهاية
  
  if (suffix) {
    slug += `-${suffix}`;
  }
  
  return slug || 'item';
}

// دالة لتحويل النص العربي إلى إنجليزي للسلوغ
function transliterateArabicToEnglish(text: string): string {
  const arabicToEnglish: { [key: string]: string } = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
    'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
    'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
    'ة': 'h', 'ء': 'a', 'ئ': 'e', 'ؤ': 'o',
    'لا': 'la', 'ال': 'al'
  };

  let result = text;
  
  // تحويل "ال" التعريف أولاً
  result = result.replace(/ال/g, 'al-');
  
  // تحويل باقي الأحرف
  for (const [arabic, english] of Object.entries(arabicToEnglish)) {
    if (arabic !== 'ال') { // تجنب إعادة معالجة "ال"
      const regex = new RegExp(arabic, 'g');
      result = result.replace(regex, english);
    }
  }
  
  return result;
}

// دالة لإنشاء slug بالإنجليزية فقط
export function createEnglishSlug(text: string, suffix?: string): string {
  let slug = text
    .toLowerCase()
    .trim();
  
  // تحويل الأحرف العربية إلى إنجليزية
  slug = transliterateArabicToEnglish(slug);
  
  // معالجة النص
  slug = slug
    .replace(/\s+/g, '-') // استبدال المسافات بشرطات
    .replace(/[^\w\-]/g, '') // إزالة جميع الأحرف غير الإنجليزية والأرقام والشرطات
    .replace(/\-\-+/g, '-') // استبدال عدة شرطات بشرطة واحدة
    .replace(/^-+/, '') // إزالة الشرطات من البداية
    .replace(/-+$/, ''); // إزالة الشرطات من النهاية
  
  if (suffix) {
    slug += `-${suffix}`;
  }

  slug = sanitizeSlug(slug);

  return slug || 'company';
}

// دالة للتحقق من وجود slug وإنشاء بديل
export async function createUniqueSlug(
  table: 'company' | 'city' | 'category',
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await (prisma as any)[table].findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    });
    
    if (!existing) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// دالة للتحقق من وجود slug وإنشاء بديل باستخدام الدالة الإنجليزية
export async function createUniqueEnglishSlug(
  table: 'company' | 'city' | 'category',
  text: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = createEnglishSlug(text);
  return await createUniqueSlug(table, baseSlug, excludeId);
}

// دالة لتنظيف البيانات
export async function cleanupData() {
  try {
    // حذف الشركات غير النشطة القديمة
    const oldInactiveCompanies = await prisma.company.deleteMany({
      where: {
        isActive: false,
        updatedAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // أقدم من 30 يوم
        }
      }
    });
    
    // حذف المراجعات غير المعتمدة القديمة
    const oldPendingReviews = await prisma.review.deleteMany({
      where: {
        isApproved: false,
        createdAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // أقدم من 7 أيام
        }
      }
    });
    
    console.log(`✅ تم حذف ${oldInactiveCompanies.count} شركة غير نشطة`);
    console.log(`✅ تم حذف ${oldPendingReviews.count} مراجعة معلقة قديمة`);
    
  } catch (error) {
    console.error('❌ خطأ في تنظيف البيانات:', error);
  }
}

// دالة لإعادة فهرسة البحث
export async function reindexSearch() {
  try {
    // يمكن هنا إضافة منطق إعادة الفهرسة إذا كنا نستخدم محرك بحث خارجي
    console.log('🔍 إعادة فهرسة البحث...');
    
    // مؤقتاً، سنقوم بتحديث تواريخ التعديل للشركات لإعادة الفهرسة
    await prisma.company.updateMany({
      where: { isActive: true },
      data: { updatedAt: new Date() }
    });
    
    console.log('✅ تم إعادة فهرسة البحث');
  } catch (error) {
    console.error('❌ خطأ في إعادة فهرسة البحث:', error);
  }
}

// دالة للنسخ الاحتياطي للبيانات الحيوية
export async function backupCriticalData() {
  try {
    const criticalData = {
      companies: await prisma.company.count(),
      reviews: await prisma.review.count(),
      users: await prisma.user.count(),
      timestamp: new Date().toISOString()
    };
    
    console.log('💾 النسخ الاحتياطي للبيانات الحيوية:', criticalData);
    
    // هنا يمكن حفظ البيانات في ملف أو خدمة خارجية
    
    return criticalData;
  } catch (error) {
    console.error('❌ خطأ في النسخ الاحتياطي:', error);
    return null;
  }
}