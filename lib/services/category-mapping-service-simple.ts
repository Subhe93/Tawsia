import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class CategoryMappingService {
  private existingCategories: any[] = []
  private categoriesLoaded = false
  
  // مطابقات احتياطية للأسماء الإنجليزية الشائعة
  private categoryMappings: { [key: string]: { slug: string, name: string, icon: string } } = {
    'software company': { slug: 'technology', name: 'التكنولوجيا', icon: 'Laptop' },
    'website designer': { slug: 'technology', name: 'التكنولوجيا', icon: 'Laptop' },
    'corporate office': { slug: 'business-services', name: 'الخدمات التجارية', icon: 'Building' },
    'it company': { slug: 'technology', name: 'التكنولوجيا', icon: 'Laptop' },
    'restaurant': { slug: 'food', name: 'الأغذية والمطاعم', icon: 'Utensils' },
    'cafe': { slug: 'food', name: 'الأغذية والمطاعم', icon: 'Utensils' },
    'hospital': { slug: 'healthcare', name: 'الرعاية الصحية', icon: 'Heart' },
    'clinic': { slug: 'healthcare', name: 'الرعاية الصحية', icon: 'Heart' },
    'pharmacy': { slug: 'healthcare', name: 'الرعاية الصحية', icon: 'Heart' }
  }

  // تحميل جميع الفئات الموجودة في قاعدة البيانات
  private async loadExistingCategories() {
    if (!this.categoriesLoaded) {
      this.existingCategories = await prisma.category.findMany({
        select: { id: true, name: true, slug: true, icon: true }
      })
      this.categoriesLoaded = true
      console.log(`تم تحميل ${this.existingCategories.length} فئة من قاعدة البيانات`)
    }
  }

  async mapCategory(categoryName: string, createMissing: boolean = true) {
    if (!categoryName) return null

    // تحميل الفئات الموجودة
    await this.loadExistingCategories()
    
    const trimmedName = categoryName.trim()
    console.log(`محاولة مطابقة الفئة: "${trimmedName}"`)
    
    // البحث الأول: مطابقة دقيقة تماماً (Case Sensitive)
    let matchedCategory = this.existingCategories.find(cat => 
      cat.name === trimmedName
    )

    if (matchedCategory) {
      console.log(`✅ مطابقة دقيقة: "${trimmedName}" -> "${matchedCategory.name}"`)
      return matchedCategory
    }

    // البحث الثاني: مطابقة دقيقة مع تجاهل حالة الأحرف
    matchedCategory = this.existingCategories.find(cat => 
      cat.name.toLowerCase() === trimmedName.toLowerCase()
    )

    if (matchedCategory) {
      console.log(`✅ مطابقة مع تجاهل الأحرف: "${trimmedName}" -> "${matchedCategory.name}"`)
      return matchedCategory
    }

    // البحث الثالث: مطابقة جزئية (يحتوي على النص)
    matchedCategory = this.existingCategories.find(cat => 
      cat.name.toLowerCase().includes(trimmedName.toLowerCase()) ||
      trimmedName.toLowerCase().includes(cat.name.toLowerCase())
    )

    if (matchedCategory) {
      console.log(`✅ مطابقة جزئية: "${trimmedName}" -> "${matchedCategory.name}"`)
      return matchedCategory
    }

    // البحث الرابع: استخدام النظام القديم للمطابقة المبرمجة
    const normalized = categoryName.toLowerCase().trim()
    const mapping = this.categoryMappings[normalized]

    if (mapping) {
      const mappedCategory = await prisma.category.findUnique({
        where: { slug: mapping.slug }
      })

      if (mappedCategory) {
        console.log(`تم العثور على فئة عبر المطابقة المبرمجة: "${trimmedName}" -> "${mappedCategory.name}"`)
        return mappedCategory
      }

      if (createMissing) {
        const newMappedCategory = await prisma.category.create({
          data: {
            slug: mapping.slug,
            name: mapping.name,
            icon: mapping.icon,
            description: `فئة ${mapping.name}`
          }
        })
        console.log(`تم إنشاء فئة جديدة من المطابقة المبرمجة: "${trimmedName}" -> "${newMappedCategory.name}"`)
        return newMappedCategory
      }
    }

    // إنشاء فئة جديدة بنفس الاسم الموجود في CSV
    if (createMissing) {
      const slug = this.generateSlugFromName(trimmedName)
      
      const newCategory = await prisma.category.create({
        data: {
          slug,
          name: trimmedName, // استخدام الاسم كما هو في CSV
          icon: 'Building',
          description: `فئة ${trimmedName}`
        }
      })
      
      console.log(`تم إنشاء فئة جديدة: "${trimmedName}"`)
      return newCategory
    }

    console.log(`لم يتم العثور على فئة مطابقة لـ: "${trimmedName}"`)
    return null
  }

  private generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-\u0600-\u06FF]/g, '') // السماح بالأحرف العربية
      .replace(/\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '') || 'category'
  }

  private translateToArabic(englishName: string): string {
    const translations: { [key: string]: string } = {
      'software company': 'شركة برمجيات',
      'website designer': 'مصمم مواقع',
      'corporate office': 'مكتب شركة',
      'it company': 'شركة تقنية',
      'restaurant': 'مطعم',
      'cafe': 'مقهى',
      'hospital': 'مستشفى',
      'clinic': 'عيادة',
      'pharmacy': 'صيدلية'
    }

    return translations[englishName.toLowerCase().trim()] || englishName
  }

  // دالة لعرض جميع الفئات المتاحة (للتشخيص)
  async getAllCategories() {
    await this.loadExistingCategories()
    return this.existingCategories
  }

  // دالة لإحصائيات المطابقة
  async getMatchingStats() {
    await this.loadExistingCategories()
    return {
      totalCategories: this.existingCategories.length,
      categories: this.existingCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      }))
    }
  }

  // دالة للبحث المرن في الفئات
  async searchCategories(searchTerm: string) {
    await this.loadExistingCategories()
    const term = searchTerm.toLowerCase().trim()
    
    return this.existingCategories.filter(cat => 
      cat.name.toLowerCase().includes(term) ||
      cat.slug.toLowerCase().includes(term)
    )
  }

  // مطابقة الفئات الفرعية
  private existingSubCategories: any[] = []
  private subCategoriesLoaded = false

  // تحميل جميع الفئات الفرعية الموجودة في قاعدة البيانات
  private async loadExistingSubCategories() {
    if (!this.subCategoriesLoaded) {
      this.existingSubCategories = await prisma.subCategory.findMany({
        select: { id: true, name: true, slug: true, icon: true, categoryId: true }
      })
      this.subCategoriesLoaded = true
      console.log(`تم تحميل ${this.existingSubCategories.length} فئة فرعية من قاعدة البيانات`)
    }
  }

  // مطابقة الفئة الفرعية
  async mapSubCategory(subCategoryName: string, categoryId: string, createMissing: boolean = true) {
    if (!subCategoryName || !categoryId) return null

    // تحميل الفئات الفرعية الموجودة
    await this.loadExistingSubCategories()
    
    const trimmedName = subCategoryName.trim()
    console.log(`محاولة مطابقة الفئة الفرعية: "${trimmedName}" في الفئة ${categoryId}`)
    
    // البحث الأول: مطابقة دقيقة تماماً في نفس الفئة الرئيسية
    let matchedSubCategory = this.existingSubCategories.find(subCat => 
      subCat.name === trimmedName && subCat.categoryId === categoryId
    )

    if (matchedSubCategory) {
      console.log(`✅ مطابقة فئة فرعية دقيقة: "${trimmedName}" -> "${matchedSubCategory.name}"`)
      return matchedSubCategory
    }

    // البحث الثاني: مطابقة دقيقة مع تجاهل حالة الأحرف
    matchedSubCategory = this.existingSubCategories.find(subCat => 
      subCat.name.toLowerCase() === trimmedName.toLowerCase() && subCat.categoryId === categoryId
    )

    if (matchedSubCategory) {
      console.log(`✅ مطابقة فئة فرعية مع تجاهل الأحرف: "${trimmedName}" -> "${matchedSubCategory.name}"`)
      return matchedSubCategory
    }

    // البحث الثالث: مطابقة جزئية (يحتوي على النص) في نفس الفئة الرئيسية
    matchedSubCategory = this.existingSubCategories.find(subCat => 
      (subCat.name.toLowerCase().includes(trimmedName.toLowerCase()) ||
       trimmedName.toLowerCase().includes(subCat.name.toLowerCase())) &&
      subCat.categoryId === categoryId
    )

    if (matchedSubCategory) {
      console.log(`✅ مطابقة فئة فرعية جزئية: "${trimmedName}" -> "${matchedSubCategory.name}"`)
      return matchedSubCategory
    }

    // إنشاء فئة فرعية جديدة
    if (createMissing) {
      const slug = this.generateSlugFromName(trimmedName)
      
      const newSubCategory = await prisma.subCategory.create({
        data: {
          slug,
          name: trimmedName, // استخدام الاسم كما هو في CSV
          icon: 'Tag',
          description: `فئة فرعية ${trimmedName}`,
          categoryId: categoryId
        }
      })
      
      console.log(`تم إنشاء فئة فرعية جديدة: "${trimmedName}"`)
      return newSubCategory
    }

    console.log(`لم يتم العثور على فئة فرعية مطابقة لـ: "${trimmedName}"`)
    return null
  }

  // دالة لعرض جميع الفئات الفرعية المتاحة
  async getAllSubCategories() {
    await this.loadExistingSubCategories()
    return this.existingSubCategories
  }

  // دالة للبحث المرن في الفئات الفرعية
  async searchSubCategories(searchTerm: string, categoryId?: string) {
    await this.loadExistingSubCategories()
    const term = searchTerm.toLowerCase().trim()
    
    return this.existingSubCategories.filter(subCat => 
      (subCat.name.toLowerCase().includes(term) ||
       subCat.slug.toLowerCase().includes(term)) &&
      (!categoryId || subCat.categoryId === categoryId)
    )
  }
}
