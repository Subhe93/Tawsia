const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

// بيانات تجريبية
const countries = [
  {
    code: "sy",
    name: "سوريا",
    flag: "🇸🇾",
    image: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg",
    description: "اكتشف أفضل الشركات والخدمات في سوريا",
    companiesCount: 450,
  },
  {
    code: "lb",
    name: "لبنان",
    flag: "🇱🇧",
    image: "https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg",
    description: "دليل شامل للشركات في لبنان",
    companiesCount: 320,
  },
  {
    code: "jo",
    name: "الأردن",
    flag: "🇯🇴",
    image: "https://images.pexels.com/photos/1583582/pexels-photo-1583582.jpeg",
    description: "دليل الشركات الأردنية",
    companiesCount: 280,
  },
  {
    code: "eg",
    name: "مصر",
    flag: "🇪🇬",
    image: "https://images.pexels.com/photos/71241/pexels-photo-71241.jpeg",
    description: "دليل شامل للشركات في مصر",
    companiesCount: 650,
  },
];

const categories = [
  {
    slug: "technology",
    name: "التكنولوجيا",
    icon: "Laptop",
    description: "شركات التكنولوجيا والبرمجة",
  },
  {
    slug: "healthcare",
    name: "الرعاية الصحية",
    icon: "Heart",
    description: "المستشفيات والعيادات الطبية",
  },
  {
    slug: "education",
    name: "التعليم",
    icon: "GraduationCap",
    description: "المدارس والجامعات ومراكز التدريب",
  },
  {
    slug: "finance",
    name: "المالية والمصرفية",
    icon: "Banknote",
    description: "البنوك وشركات التأمين والاستثمار",
  },
  {
    slug: "food",
    name: "الأغذية والمطاعم",
    icon: "Utensils",
    description: "المطاعم والكافيهات وتجارة الأغذية",
  },
  {
    slug: "retail",
    name: "التجارة والبيع",
    icon: "ShoppingBag",
    description: "المتاجر ومراكز التسوق",
  },
  {
    slug: "beauty",
    name: "الجمال والعناية",
    icon: "Scissors",
    description: "صالونات الحلاقة ومراكز التجميل",
  },
  {
    slug: "construction",
    name: "البناء والإنشاء",
    icon: "HardHat",
    description: "شركات البناء والمقاولات",
  },
  {
    slug: "energy",
    name: "الطاقة والبيئة",
    icon: "Zap",
    description: "شركات الطاقة المتجددة والبيئة",
  },
];

const cities = [
  {
    slug: "damascus",
    name: "دمشق",
    country: "sy",
    image: "https://images.pexels.com/photos/2318271/pexels-photo-2318271.jpeg",
    description: "عاصمة سوريا ومركز الأعمال",
    companiesCount: 200,
  },
  {
    slug: "aleppo",
    name: "حلب",
    country: "sy",
    image: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg",
    description: "المدينة التجارية الكبرى",
    companiesCount: 150,
  },
  {
    slug: "beirut",
    name: "بيروت",
    country: "lb",
    image: "https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg",
    description: "عاصمة لبنان ومركز المال والأعمال",
    companiesCount: 180,
  },
  {
    slug: "amman",
    name: "عمان",
    country: "jo",
    image: "https://images.pexels.com/photos/1583582/pexels-photo-1583582.jpeg",
    description: "العاصمة الأردنية",
    companiesCount: 160,
  },
];

async function main() {
  console.log("🌱 بدء عملية ملء قاعدة البيانات...");

  // إنشاء البلدان
  console.log("📍 إنشاء البلدان...");
  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {
        name: country.name,
        flag: country.flag,
        image: country.image,
        description: country.description,
        companiesCount: country.companiesCount,
      },
      create: {
        code: country.code,
        name: country.name,
        flag: country.flag,
        image: country.image,
        description: country.description,
        companiesCount: country.companiesCount,
      },
    });
  }

  // إنشاء الفئات
  console.log("📂 إنشاء الفئات...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        icon: category.icon,
        description: category.description,
      },
      create: {
        slug: category.slug,
        name: category.name,
        icon: category.icon,
        description: category.description,
      },
    });
  }

  // إنشاء المدن
  console.log("🏙️ إنشاء المدن...");
  for (const city of cities) {
    const country = await prisma.country.findUnique({
      where: { code: city.country },
    });

    if (country) {
      await prisma.city.upsert({
        where: { slug: city.slug },
        update: {
          name: city.name,
          countryCode: city.country,
          image: city.image,
          description: city.description,
          companiesCount: city.companiesCount,
        },
        create: {
          slug: city.slug,
          name: city.name,
          countryId: country.id,
          countryCode: city.country,
          image: city.image,
          description: city.description,
          companiesCount: city.companiesCount,
        },
      });
    }
  }

  // إنشاء مستخدم مدير
  console.log("👤 إنشاء مستخدم المدير...");
  const hashedPassword = await hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@tawsia.com" },
    update: {
      name: "مدير النظام",
      role: "SUPER_ADMIN",
      password: hashedPassword,
    },
    create: {
      email: "admin@tawsia.com",
      name: "مدير النظام",
      role: "SUPER_ADMIN",
      password: hashedPassword,
      isVerified: true,
    },
  });

  // إنشاء إعدادات النظام
  console.log("⚙️ إنشاء إعدادات النظام...");
  const settings = [
    {
      key: "site_name",
      value: "توصية",
      type: "STRING",
      description: "اسم الموقع",
    },
    {
      key: "site_description",
      value: "دليل الشركات والخدمات",
      type: "STRING",
      description: "وصف الموقع",
    },
    {
      key: "max_images_per_company",
      value: "10",
      type: "NUMBER",
      description: "أقصى عدد صور للشركة",
    },
    {
      key: "max_images_per_review",
      value: "3",
      type: "NUMBER",
      description: "أقصى عدد صور للمراجعة",
    },
    {
      key: "auto_approve_reviews",
      value: "false",
      type: "BOOLEAN",
      description: "الموافقة التلقائية على المراجعات",
    },
    {
      key: "require_email_verification",
      value: "true",
      type: "BOOLEAN",
      description: "تطلب تأكيد البريد الإلكتروني",
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
      },
      create: {
        key: setting.key,
        value: setting.value,
        type: setting.type,
        description: setting.description,
        isPublic: true,
      },
    });
  }

  console.log("✅ تم ملء قاعدة البيانات بنجاح!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ خطأ في ملء قاعدة البيانات:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
