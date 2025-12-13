import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateCompaniesCount() {
  try {
    console.log('بدء تحديث عدد الشركات...')

    // تحديث عدد الشركات في الفئات
    const categories = await prisma.category.findMany()
    for (const category of categories) {
      const count = await prisma.company.count({
        where: {
          categoryId: category.id,
          isActive: true
        }
      })
      
      await prisma.category.update({
        where: { id: category.id },
        data: { companiesCount: count }
      })
      
      console.log(`تم تحديث الفئة ${category.name}: ${count} شركة`)
    }

    // تحديث عدد الشركات في البلدان
    const countries = await prisma.country.findMany()
    for (const country of countries) {
      const count = await prisma.company.count({
        where: {
          countryId: country.id,
          isActive: true
        }
      })
      
      await prisma.country.update({
        where: { id: country.id },
        data: { companiesCount: count }
      })
      
      console.log(`تم تحديث البلد ${country.name}: ${count} شركة`)
    }

    // تحديث عدد الشركات في المدن
    const cities = await prisma.city.findMany()
    for (const city of cities) {
      const count = await prisma.company.count({
        where: {
          cityId: city.id,
          isActive: true
        }
      })
      
      await prisma.city.update({
        where: { id: city.id },
        data: { companiesCount: count }
      })
      
      console.log(`تم تحديث المدينة ${city.name}: ${count} شركة`)
    }

    console.log('تم تحديث عدد الشركات بنجاح!')
  } catch (error) {
    console.error('خطأ في تحديث عدد الشركات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// تشغيل التحديث
updateCompaniesCount()
