import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CategoryMapping {
  [key: string]: {
    slug: string
    name: string
    icon: string
    description: string
  }
}

export class CategoryMappingService {
  private categoryMappings: CategoryMapping = {
    // تقنية ومعلومات
    'software company': {
      slug: 'technology',
      name: 'التكنولوجيا',
      icon: 'Laptop',
      description: 'شركات التكنولوجيا والبرمجة'
    },
    'website designer': {
      slug: 'technology',
      name: 'التكنولوجيا',
      icon: 'Laptop',
      description: 'شركات التكنولوجيا والبرمجة'
    },
    'corporate office': {
      slug: 'business-services',
      name: 'الخدمات التجارية',
      icon: 'Building',
      description: 'الشركات والمكاتب التجارية'
    },
    'it company': {
      slug: 'technology',
      name: 'التكنولوجيا',
      icon: 'Laptop',
      description: 'شركات التكنولوجيا والبرمجة'
    },

    // طبية وصحية
    'hospital': {
      slug: 'healthcare',
      name: 'الرعاية الصحية',
      icon: 'Heart',
      description: 'المستشفيات والعيادات الطبية'
    },
    'medical center': {
      slug: 'healthcare',
      name: 'الرعاية الصحية',
      icon: 'Heart',
      description: 'المستشفيات والعيادات الطبية'
    },
    'clinic': {
      slug: 'healthcare',
      name: 'الرعاية الصحية',
      icon: 'Heart',
      description: 'المستشفيات والعيادات الطبية'
    },
    'pharmacy': {
      slug: 'healthcare',
      name: 'الرعاية الصحية',
      icon: 'Heart',
      description: 'المستشفيات والعيادات الطبية'
    },

    // مطاعم وطعام
    'restaurant': {
      slug: 'food',
      name: 'الأغذية والمطاعم',
      icon: 'Utensils',
      description: 'المطاعم والكافيهات وتجارة الأغذية'
    },
    'cafe': {
      slug: 'food',
      name: 'الأغذية والمطاعم',
      icon: 'Utensils',
      description: 'المطاعم والكافيهات وتجارة الأغذية'
    },
    'food': {
      slug: 'food',
      name: 'الأغذية والمطاعم',
      icon: 'Utensils',
      description: 'المطاعم والكافيهات وتجارة الأغذية'
    },

    // تعليم
    'school': {
      slug: 'education',
      name: 'التعليم',
      icon: 'GraduationCap',
      description: 'المدارس والجامعات ومراكز التدريب'
    },
    'university': {
      slug: 'education',
      name: 'التعليم',
      icon: 'GraduationCap',
      description: 'المدارس والجامعات ومراكز التدريب'
    },
    'training center': {
      slug: 'education',
      name: 'التعليم',
      icon: 'GraduationCap',
      description: 'المدارس والجامعات ومراكز التدريب'
    },

    // مالية ومصرفية
    'bank': {
      slug: 'finance',
      name: 'المالية والمصرفية',
      icon: 'Banknote',
      description: 'البنوك وشركات التأمين والاستثمار'
    },
    'financial services': {
      slug: 'finance',
      name: 'المالية والمصرفية',
      icon: 'Banknote',
      description: 'البنوك وشركات التأمين والاستثمار'
    },
    'insurance': {
      slug: 'finance',
      name: 'المالية والمصرفية',
      icon: 'Banknote',
      description: 'البنوك وشركات التأمين والاستثمار'
    },

    // تجارة وتسوق
    'store': {
      slug: 'retail',
      name: 'التجارة والبيع',
      icon: 'ShoppingBag',
      description: 'المتاجر ومراكز التسوق'
    },
    'shopping mall': {
      slug: 'retail',
      name: 'التجارة والبيع',
      icon: 'ShoppingBag',
      description: 'المتاجر ومراكز التسوق'
    },
    'retail': {
      slug: 'retail',
      name: 'التجارة والبيع',
      icon: 'ShoppingBag',
      description: 'المتاجر ومراكز التسوق'
    },

    // جمال وعناية
    'beauty salon': {
      slug: 'beauty',
      name: 'الجمال والعناية',
      icon: 'Scissors',
      description: 'صالونات الحلاقة ومراكز التجميل'
    },
    'barber shop': {
      slug: 'beauty',
      name: 'الجمال والعناية',
      icon: 'Scissors',
      description: 'صالونات الحلاقة ومراكز التجميل'
    },
    'spa': {
      slug: 'beauty',
      name: 'الجمال والعناية',
      icon: 'Scissors',
      description: 'صالونات الحلاقة ومراكز التجميل'
    },

    // بناء وإنشاء
    'construction': {
      slug: 'construction',
      name: 'البناء والإنشاء',
      icon: 'HardHat',
      description: 'شركات البناء والمقاولات'
    },
    'contractor': {
      slug: 'construction',
      name: 'البناء والإنشاء',
      icon: 'HardHat',
      description: 'شركات البناء والمقاولات'
    },
    'engineering': {
      slug: 'construction',
      name: 'البناء والإنشاء',
      icon: 'HardHat',
      description: 'شركات البناء والمقاولات'
    }
  }

  async mapCategory(categoryName: string, createMissing: boolean = true) {
    if (!categoryName || !categoryName.trim()) {
      return null
    }

    const normalizedName = categoryName.toLowerCase().trim()
    
    // البحث في المطابقات المحددة مسبقاً
    const mapping = this.categoryMappings[normalizedName]
    
    if (mapping) {
      // البحث عن الفئة في قاعدة البيانات
      let category = await prisma.category.findUnique({
        where: { slug: mapping.slug }
      })

      // إنشاء الفئة إذا لم تكن موجودة
      if (!category && createMissing) {
        category = await prisma.category.create({
          data: {
            slug: mapping.slug,
            name: mapping.name,
            icon: mapping.icon,
            description: mapping.description
          }
        })
      }

      return category
    }

    // إذا لم نجد مطابقة، نحاول البحث بالاسم في قاعدة البيانات
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { contains: categoryName, mode: 'insensitive' } },
          { slug: { contains: normalizedName.replace(/\s+/g, '-'), mode: 'insensitive' } }
        ]
      }
    })

    if (category) {
      return category
    }

    // إنشاء فئة جديدة إذا كان مسموحاً
    if (createMissing) {
      const slug = this.generateSlug(categoryName)
      const arabicName = this.translateToArabic(categoryName)

      category = await prisma.category.create({
        data: {
          slug,
          name: arabicName,
          icon: 'Building', // أيقونة افتراضية
          description: `فئة ${arabicName}`
        }
      })

      return category
    }

    return null
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  private translateToArabic(englishName: string): string {
    const translations: { [key: string]: string } = {
      'software company': 'شركة برمجيات',
      'website designer': 'مصمم مواقع',
      'corporate office': 'مكتب شركة',
      'it company': 'شركة تقنية معلومات',
      'hospital': 'مستشفى',
      'medical center': 'مركز طبي',
      'clinic': 'عيادة',
      'pharmacy': 'صيدلية',
      'restaurant': 'مطعم',
      'cafe': 'مقهى',
      'food': 'طعام',
      'school': 'مدرسة',
      'university': 'جامعة',
      'training center': 'مركز تدريب',
      'bank': 'بنك',
      'financial services': 'خدمات مالية',
      'insurance': 'تأمين',
      'store': 'متجر',
      'shopping mall': 'مركز تسوق',
      'retail': 'تجزئة',
      'beauty salon': 'صالون تجميل',
      'barber shop': 'محل حلاقة',
      'spa': 'سبا',
      'construction': 'إنشاءات',
      'contractor': 'مقاول',
      'engineering': 'هندسة'
    }

    const normalized = englishName.toLowerCase().trim()
    return translations[normalized] || englishName
  }

  // الحصول على جميع الفئات المتاحة
  async getAllCategories() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  }

  // إضافة مطابقة جديدة
  addCategoryMapping(englishName: string, mapping: {
    slug: string
    name: string
    icon: string
    description: string
  }) {
    this.categoryMappings[englishName.toLowerCase()] = mapping
  }

  // الحصول على إحصائيات الفئات
  async getCategoryStats() {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { companies: true }
        }
      }
    })

    return categories.map(category => ({
      ...category,
      companiesCount: category._count.companies
    }))
  }
}
