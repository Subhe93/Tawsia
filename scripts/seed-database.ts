import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// بيانات البلدان
const countries = [
  {
    code: 'sy',
    name: 'سوريا',
    flag: '🇸🇾',
    image: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg',
    description: 'اكتشف أفضل الشركات والخدمات في الجمهورية العربية السورية',
  },
  {
    code: 'lb',
    name: 'لبنان',
    flag: '🇱🇧',
    image: 'https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg',
    description: 'دليل شامل للشركات والخدمات في الجمهورية اللبنانية',
  },
  {
    code: 'jo',
    name: 'الأردن',
    flag: '🇯🇴',
    image: 'https://images.pexels.com/photos/1583582/pexels-photo-1583582.jpeg',
    description: 'دليل الشركات والخدمات في المملكة الأردنية الهاشمية',
  },
  {
    code: 'eg',
    name: 'مصر',
    flag: '🇪🇬',
    image: 'https://images.pexels.com/photos/71241/pexels-photo-71241.jpeg',
    description: 'دليل شامل للشركات والخدمات في جمهورية مصر العربية',
  },
];

// بيانات المدن
const cities = [
  // سوريا
  { slug: 'damascus', name: 'دمشق', countryCode: 'sy', description: 'عاصمة سوريا ومركز الأعمال الرئيسي' },
  { slug: 'aleppo', name: 'حلب', countryCode: 'sy', description: 'العاصمة الاقتصادية لسوريا' },
  { slug: 'homs', name: 'حمص', countryCode: 'sy', description: 'مدينة حمص الصناعية' },
  { slug: 'latakia', name: 'اللاذقية', countryCode: 'sy', description: 'المدينة الساحلية والميناء الرئيسي' },
  
  // لبنان
  { slug: 'beirut', name: 'بيروت', countryCode: 'lb', description: 'عاصمة لبنان ومركز المال والأعمال' },
  { slug: 'tripoli', name: 'طرابلس', countryCode: 'lb', description: 'عاصمة الشمال اللبناني' },
  { slug: 'sidon', name: 'صيدا', countryCode: 'lb', description: 'مدينة صيدا التاريخية' },
  
  // الأردن
  { slug: 'amman', name: 'عمان', countryCode: 'jo', description: 'العاصمة الأردنية ومركز الأعمال' },
  { slug: 'irbid', name: 'إربد', countryCode: 'jo', description: 'عروس الشمال الأردني' },
  { slug: 'zarqa', name: 'الزرقاء', countryCode: 'jo', description: 'المدينة الصناعية الأردنية' },
  
  // مصر
  { slug: 'cairo', name: 'القاهرة', countryCode: 'eg', description: 'عاصمة مصر وأكبر مدنها' },
  { slug: 'alexandria', name: 'الإسكندرية', countryCode: 'eg', description: 'عروس البحر المتوسط' },
  { slug: 'giza', name: 'الجيزة', countryCode: 'eg', description: 'مدينة الأهرامات' },
];

// بيانات الفئات
const categories = [
  { slug: 'technology', name: 'التكنولوجيا والبرمجة', icon: 'Laptop', description: 'شركات التكنولوجيا وتطوير البرمجيات' },
  { slug: 'healthcare', name: 'الرعاية الصحية', icon: 'Heart', description: 'المستشفيات والعيادات والخدمات الطبية' },
  { slug: 'education', name: 'التعليم والتدريب', icon: 'GraduationCap', description: 'المدارس والجامعات ومراكز التدريب' },
  { slug: 'finance', name: 'المالية والمصرفية', icon: 'Banknote', description: 'البنوك وشركات التأمين والخدمات المالية' },
  { slug: 'food', name: 'الأغذية والمطاعم', icon: 'Utensils', description: 'المطاعم والكافيهات وصناعة الأغذية' },
  { slug: 'retail', name: 'التجارة والبيع', icon: 'ShoppingBag', description: 'المتاجر ومراكز التسوق والتجارة' },
  { slug: 'beauty', name: 'الجمال والعناية', icon: 'Scissors', description: 'صالونات التجميل ومراكز العناية' },
  { slug: 'construction', name: 'البناء والإنشاء', icon: 'HardHat', description: 'شركات البناء والمقاولات والهندسة' },
  { slug: 'energy', name: 'الطاقة والبيئة', icon: 'Zap', description: 'شركات الطاقة المتجددة والخدمات البيئية' },
  { slug: 'transportation', name: 'النقل والشحن', icon: 'Truck', description: 'شركات النقل والشحن واللوجستيات' },
  { slug: 'real-estate', name: 'العقارات', icon: 'Building', description: 'شركات العقارات والتطوير العقاري' },
  { slug: 'legal', name: 'القانونية والاستشارية', icon: 'Scale', description: 'مكاتب المحاماة والاستشارات القانونية' },
];

async function seedCountries() {
  console.log('🌍 إضافة البلدان...');
  
  for (const countryData of countries) {
    await prisma.country.upsert({
      where: { code: countryData.code },
      update: countryData,
      create: countryData,
    });
  }
  
  console.log(`✅ تم إضافة ${countries.length} بلد`);
}

async function seedCities() {
  console.log('🏙️ إضافة المدن...');
  
  for (const cityData of cities) {
    const country = await prisma.country.findUnique({
      where: { code: cityData.countryCode }
    });
    
    if (country) {
      await prisma.city.upsert({
        where: { slug: cityData.slug },
        update: {
          name: cityData.name,
          description: cityData.description,
          countryCode: cityData.countryCode,
        },
        create: {
          slug: cityData.slug,
          name: cityData.name,
          description: cityData.description,
          countryId: country.id,
          countryCode: cityData.countryCode,
        },
      });
    }
  }
  
  console.log(`✅ تم إضافة ${cities.length} مدينة`);
}

async function seedCategories() {
  console.log('📂 إضافة الفئات...');
  
  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData,
    });
  }
  
  console.log(`✅ تم إضافة ${categories.length} فئة`);
}

async function seedSampleCompanies() {
  console.log('🏢 إضافة شركات تجريبية...');
  
  const sampleCompanies = [
    {
      name: 'شركة التقنية المتقدمة',
      slug: 'advanced-tech-syria',
      description: 'شركة رائدة في مجال تطوير البرمجيات والتطبيقات',
      shortDescription: 'تطوير البرمجيات والتطبيقات المحمولة',
      categorySlug: 'technology',
      citySlug: 'damascus',
      phone: '+963 11 1234567',
      email: 'info@advancedtech.sy',
      website: 'https://advancedtech.sy',
      address: 'شارع بغداد، دمشق، سوريا',
      services: ['تطوير المواقع', 'التطبيقات المحمولة', 'الاستشارات التقنية'],
      rating: 4.8,
      isVerified: true,
      isFeatured: true,
    },
    {
      name: 'مستشفى الشام العام',
      slug: 'sham-general-hospital',
      description: 'مستشفى متخصص في جميع التخصصات الطبية',
      shortDescription: 'خدمات طبية شاملة وعالية الجودة',
      categorySlug: 'healthcare',
      citySlug: 'damascus',
      phone: '+963 11 2345678',
      email: 'info@shamhospital.sy',
      address: 'شارع الثورة، دمشق، سوريا',
      services: ['طب عام', 'جراحة', 'طوارئ', 'أطفال'],
      rating: 4.6,
      isVerified: true,
    },
    {
      name: 'مطعم الأصالة',
      slug: 'asala-restaurant',
      description: 'مطعم يقدم أشهى المأكولات الشامية الأصيلة',
      shortDescription: 'المأكولات الشامية الأصيلة',
      categorySlug: 'food',
      citySlug: 'damascus',
      phone: '+963 11 3456789',
      email: 'info@asala-restaurant.sy',
      address: 'البلدة القديمة، دمشق، سوريا',
      services: ['طعام شامي', 'خدمة توصيل', 'مناسبات'],
      rating: 4.7,
      isVerified: true,
    }
  ];

  for (const companyData of sampleCompanies) {
    const [category, city] = await Promise.all([
      prisma.category.findUnique({ where: { slug: companyData.categorySlug } }),
      prisma.city.findUnique({ where: { slug: companyData.citySlug }, include: { country: true } })
    ]);

    if (category && city) {
      const company = await prisma.company.upsert({
        where: { slug: companyData.slug },
        update: {
          name: companyData.name,
          description: companyData.description,
          shortDescription: companyData.shortDescription,
          phone: companyData.phone,
          email: companyData.email,
          website: companyData.website,
          address: companyData.address,
          services: companyData.services,
          rating: companyData.rating,
          isVerified: companyData.isVerified,
          isFeatured: companyData.isFeatured || false,
        },
        create: {
          slug: companyData.slug,
          name: companyData.name,
          description: companyData.description,
          shortDescription: companyData.shortDescription,
          categoryId: category.id,
          cityId: city.id,
          countryId: city.countryId,
          phone: companyData.phone,
          email: companyData.email,
          website: companyData.website,
          address: companyData.address,
          services: companyData.services,
          rating: companyData.rating,
          isVerified: companyData.isVerified,
          isFeatured: companyData.isFeatured || false,
        },
      });

      // إضافة ساعات عمل تجريبية
      const workingDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'السبت'];
      for (const day of workingDays) {
        await prisma.workingHours.upsert({
          where: {
            companyId_dayOfWeek: {
              companyId: company.id,
              dayOfWeek: day
            }
          },
          update: {},
          create: {
            companyId: company.id,
            dayOfWeek: day,
            openTime: '09:00',
            closeTime: '17:00',
            isClosed: false,
          },
        });
      }

      // الجمعة مغلق
      await prisma.workingHours.upsert({
        where: {
          companyId_dayOfWeek: {
            companyId: company.id,
            dayOfWeek: 'الجمعة'
          }
        },
        update: {},
        create: {
          companyId: company.id,
          dayOfWeek: 'الجمعة',
          isClosed: true,
        },
      });
    }
  }

  console.log(`✅ تم إضافة ${sampleCompanies.length} شركة تجريبية`);
}

async function updateStats() {
  console.log('📊 تحديث الإحصائيات...');
  
  // تحديث إحصائيات البلدان
  const countries = await prisma.country.findMany();
  for (const country of countries) {
    const companiesCount = await prisma.company.count({
      where: { countryId: country.id, isActive: true }
    });
    await prisma.country.update({
      where: { id: country.id },
      data: { companiesCount }
    });
  }

  // تحديث إحصائيات المدن
  const cities = await prisma.city.findMany();
  for (const city of cities) {
    const companiesCount = await prisma.company.count({
      where: { cityId: city.id, isActive: true }
    });
    await prisma.city.update({
      where: { id: city.id },
      data: { companiesCount }
    });
  }

  // تحديث إحصائيات الفئات
  const categories = await prisma.category.findMany();
  for (const category of categories) {
    const companiesCount = await prisma.company.count({
      where: { categoryId: category.id, isActive: true }
    });
    await prisma.category.update({
      where: { id: category.id },
      data: { companiesCount }
    });
  }

  console.log('✅ تم تحديث الإحصائيات');
}

async function main() {
  try {
    console.log('🌱 بدء ملء قاعدة البيانات...');
    
    await seedCountries();
    await seedCities();
    await seedCategories();
    await seedSampleCompanies();
    await updateStats();
    
    console.log('✅ تم ملء قاعدة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في ملء قاعدة البيانات:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export default main;
