import { prisma } from '@/lib/prisma';

export async function checkDatabaseContent() {
  // هذه الدالة للتطوير فقط
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    console.log('🔍 فحص قاعدة البيانات...');

    const [
      countriesCount,
      citiesCount,
      categoriesCount,
      companiesCount,
      reviewsCount,
      usersCount
    ] = await Promise.all([
      prisma.country.count(),
      prisma.city.count(),
      prisma.category.count(),
      prisma.company.count(),
      prisma.review.count(),
      prisma.user.count()
    ]);

    console.log('📊 إحصائيات قاعدة البيانات:');
    console.log(`   البلدان: ${countriesCount}`);
    console.log(`   المدن: ${citiesCount}`);
    console.log(`   الفئات: ${categoriesCount}`);
    console.log(`   الشركات: ${companiesCount}`);
    console.log(`   المراجعات: ${reviewsCount}`);
    console.log(`   المستخدمين: ${usersCount}`);

    if (companiesCount === 0) {
      console.warn('⚠️  لا توجد شركات في قاعدة البيانات. قم بتشغيل npm run db:seed');
    }

    if (categoriesCount === 0) {
      console.warn('⚠️  لا توجد فئات في قاعدة البيانات. قم بتشغيل npm run db:seed');
    }

    if (countriesCount === 0) {
      console.warn('⚠️  لا توجد بلدان في قاعدة البيانات. قم بتشغيل npm run db:seed');
    }

    console.log('✅ تم فحص قاعدة البيانات بنجاح');

  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error);
    console.log('💡 تأكد من:');
    console.log('   1. تشغيل قاعدة البيانات');
    console.log('   2. صحة متغير DATABASE_URL');
    console.log('   3. تطبيق migrations: npm run db:push');
    console.log('   4. ملء البيانات: npm run db:seed');
  }
}

export async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ اتصال قاعدة البيانات نشط');
    return true;
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

export async function seedDatabaseIfEmpty() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    const companiesCount = await prisma.company.count();
    
    if (companiesCount === 0) {
      console.log('🌱 قاعدة البيانات فارغة، سيتم ملؤها بالبيانات التجريبية...');
      
      // يمكن هنا استدعاء seed script أو إضافة بيانات أساسية
      console.log('💡 قم بتشغيل: npm run db:seed');
    }
  } catch (error) {
    console.error('خطأ في فحص البيانات:', error);
  }
}