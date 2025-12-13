import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 جاري اختبار الاتصال بقاعدة البيانات...\n');
    
    // اختبار الاتصال
    await prisma.$connect();
    console.log('✅ الاتصال بقاعدة البيانات نجح!\n');
    
    // اختبار جلب البيانات
    const countriesCount = await prisma.country.count();
    const companiesCount = await prisma.company.count();
    const citiesCount = await prisma.city.count();
    
    console.log('📊 إحصائيات قاعدة البيانات:');
    console.log(`   البلدان: ${countriesCount}`);
    console.log(`   المدن: ${citiesCount}`);
    console.log(`   الشركات: ${companiesCount}\n`);
    
    // جلب أول 5 بلدان
    const countries = await prisma.country.findMany({
      take: 5,
      select: {
        code: true,
        name: true,
        isActive: true,
      },
    });
    
    console.log('🌍 أول 5 بلدان:');
    countries.forEach((country) => {
      console.log(`   - ${country.name} (${country.code}) - ${country.isActive ? 'نشط' : 'غير نشط'}`);
    });
    
    console.log('\n✅ جميع الاختبارات نجحت!');
    
  } catch (error: any) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:');
    console.error('   ', error.message);
    
    if (error.message.includes('empty host')) {
      console.error('\n💡 الحل:');
      console.error('   1. تأكد من وجود DATABASE_URL في ملف .env');
      console.error('   2. تأكد من صحة صيغة DATABASE_URL');
      console.error('   3. تأكد من أن السيرفر يسمح بالاتصالات الخارجية');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

