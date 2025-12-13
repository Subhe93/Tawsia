import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCompaniesForAdmin, createCompany } from '@/lib/database/admin-queries'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const city = searchParams.get('city') || undefined
    const country = searchParams.get('country') || undefined
    const isVerified = searchParams.get('isVerified') === 'true' ? true : searchParams.get('isVerified') === 'false' ? false : undefined
    const isFeatured = searchParams.get('isFeatured') === 'true' ? true : searchParams.get('isFeatured') === 'false' ? false : undefined
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined
    const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // أولاً، تحقق من وجود أي شركات في قاعدة البيانات
    const totalCompanies = await prisma.company.count()
    console.log('Total companies in database:', totalCompanies)
    console.log('Received filters:', { category, city, country, isVerified, isFeatured, isActive, rating, sortBy, sortOrder })

    if (totalCompanies === 0) {
      // إذا لم توجد شركات، أنشئ بيانات تجريبية
      await createSampleData()
    }

    const result = await getCompaniesForAdmin({
      page,
      limit,
      search,
      category,
      city,
      country,
      isVerified,
      isFeatured,
      isActive,
      rating,
      sortBy,
      sortOrder
    })

    console.log('🎯 Query result:', { 
      dataCount: result.data?.length || 0, 
      pagination: result.pagination,
      requestedPage: page,
      requestedLimit: limit
    })

    return NextResponse.json({
      companies: result.data || [],
      pagination: result.pagination || { page: 1, limit: 10, total: 0, pages: 1 }
    })

  } catch (error) {
    console.error('خطأ في جلب الشركات:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const data = await request.json()

    // التحقق من صحة البيانات المطلوبة
    if (!data.name || !data.slug || !data.categoryId || !data.cityId || !data.countryId) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة مفقودة: اسم الشركة، السلوغ، الفئة، المدينة، والبلد' },
        { status: 400 }
      )
    }

    // التحقق من صحة السلوغ (أحرف إنجليزية وأرقام وشرطات فقط)
    if (!/^[a-z0-9\-]+$/.test(data.slug)) {
      return NextResponse.json({ 
        error: 'رابط الشركة يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط' 
      }, { status: 400 })
    }

    // استخدام دالة createCompany من admin-queries
    const company = await createCompany({
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription,
      longDescription: data.longDescription,
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId,
      cityId: data.cityId,
      subAreaId: data.subAreaId,
      countryId: data.countryId,
      phone: data.phone,
      email: data.email,
      website: data.website,
      address: data.address,
      mainImage: data.mainImage,
      logoImage: data.logoImage,
      latitude: data.latitude ? parseFloat(data.latitude) : undefined,
      longitude: data.longitude ? parseFloat(data.longitude) : undefined,
      services: Array.isArray(data.services) ? data.services : [],
      specialties: Array.isArray(data.specialties) ? data.specialties : [],
      isVerified: data.isVerified || false,
      isFeatured: data.isFeatured || false
    })

    return NextResponse.json(company)

  } catch (error) {
    console.error('خطأ في إنشاء الشركة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// دالة لإنشاء بيانات تجريبية
async function createSampleData() {
  try {
    console.log('Creating sample data...')
    
    // إنشاء بلد تجريبي
    const country = await prisma.country.upsert({
      where: { code: 'sy' },
      update: {},
      create: {
        code: 'sy',
        name: 'سوريا',
        flag: '🇸🇾',
        description: 'الجمهورية العربية السورية',
        isActive: true
      }
    })

    // إنشاء فئة تجريبية
    const category = await prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        slug: 'technology',
        name: 'التكنولوجيا',
        icon: 'Laptop',
        description: 'شركات التكنولوجيا والبرمجة',
        isActive: true
      }
    })

    // إنشاء مدينة تجريبية
    const city = await prisma.city.upsert({
      where: { slug: 'damascus' },
      update: {},
      create: {
        slug: 'damascus',
        name: 'دمشق',
        countryId: country.id,
        countryCode: 'sy',
        description: 'العاصمة السورية',
        isActive: true
      }
    })

    // إنشاء شركات تجريبية متنوعة
    const companies = await Promise.all([
      prisma.company.create({
        data: {
          slug: 'sample-tech-company',
          name: 'شركة التقنية النموذجية',
          description: 'شركة تقنية رائدة في المنطقة',
          shortDescription: 'شركة تقنية متخصصة',
          categoryId: category.id,
          cityId: city.id,
          countryId: country.id,
          phone: '+963-11-1234567',
          email: 'info@sample-tech.com',
          website: 'https://sample-tech.com',
          address: 'دمشق، سوريا',
          rating: 4.5,
          reviewsCount: 10,
          isActive: true,
          isVerified: true,
          isFeatured: false
        }
      }),
      prisma.company.create({
        data: {
          slug: 'premium-company',
          name: 'الشركة المميزة',
          description: 'شركة مميزة وموثقة بتقييم عالي',
          shortDescription: 'شركة مميزة',
          categoryId: category.id,
          cityId: city.id,
          countryId: country.id,
          phone: '+963-11-2345678',
          email: 'contact@premium.com',
          website: 'https://premium.com',
          address: 'دمشق، سوريا',
          rating: 4.8,
          reviewsCount: 25,
          isActive: true,
          isVerified: true,
          isFeatured: true
        }
      }),
      prisma.company.create({
        data: {
          slug: 'basic-company',
          name: 'الشركة الأساسية',
          description: 'شركة عادية غير موثقة',
          shortDescription: 'شركة أساسية',
          categoryId: category.id,
          cityId: city.id,
          countryId: country.id,
          phone: '+963-11-3456789',
          email: 'info@basic.com',
          address: 'دمشق، سوريا',
          rating: 3.2,
          reviewsCount: 5,
          isActive: true,
          isVerified: false,
          isFeatured: false
        }
      }),
      prisma.company.create({
        data: {
          slug: 'inactive-company',
          name: 'الشركة غير النشطة',
          description: 'شركة غير نشطة للاختبار',
          shortDescription: 'شركة غير نشطة',
          categoryId: category.id,
          cityId: city.id,
          countryId: country.id,
          phone: '+963-11-4567890',
          email: 'info@inactive.com',
          address: 'دمشق، سوريا',
          rating: 2.8,
          reviewsCount: 2,
          isActive: false,
          isVerified: false,
          isFeatured: false
        }
      })
    ])

    console.log('Sample data created successfully:', companies.map(c => c.id))
  } catch (error) {
    console.error('Error creating sample data:', error)
  }
}