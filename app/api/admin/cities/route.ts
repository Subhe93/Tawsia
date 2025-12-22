import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { updateCityInSitemap } from '@/lib/sitemap/auto-updater'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const cities = await prisma.city.findMany({
      include: {
        country: {
          select: {
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            companies: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const formattedCities = cities.map(city => ({
      id: city.id,
      slug: city.slug,
      name: city.name,
      countryId: city.countryId,
      countryCode: city.country.code,
      image: city.image,
      description: city.description,
      companiesCount: city._count.companies,
      isActive: city.isActive,
      createdAt: city.createdAt.toISOString(),
      country: city.country
    }))

    return NextResponse.json({
      cities: formattedCities
    })

  } catch (error) {
    console.error('خطأ في جلب المدن:', error)
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

    const body = await request.json()
    const { name, slug, countryId, image, description, isActive, companiesCount } = body

    if (!name || !slug || !countryId) {
      return NextResponse.json({ error: 'الاسم والمعرف والبلد مطلوبة' }, { status: 400 })
    }

    // التحقق من وجود البلد
    const country = await prisma.country.findUnique({
      where: { id: countryId }
    })

    if (!country) {
      return NextResponse.json({ error: 'البلد المحدد غير موجود' }, { status: 400 })
    }

    // التحقق من عدم وجود مدينة بنفس المعرف
    const existingCity = await prisma.city.findUnique({
      where: { slug: slug.toLowerCase() }
    })

    if (existingCity) {
      return NextResponse.json({ error: 'يوجد مدينة بنفس هذا المعرف مسبقاً' }, { status: 400 })
    }

    const city = await prisma.city.create({
      data: {
        name,
        slug: slug.toLowerCase(),
        countryId,
        countryCode: country.code,
        image: image || null,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
        companiesCount: companiesCount || 0
      },
      include: {
        country: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    const formattedCity = {
      id: city.id,
      slug: city.slug,
      name: city.name,
      countryId: city.countryId,
      countryCode: city.country.code,
      image: city.image,
      description: city.description,
      companiesCount: city.companiesCount,
      isActive: city.isActive,
      createdAt: city.createdAt.toISOString(),
      country: city.country
    }

    // تحديث السايت ماب
    await updateCityInSitemap(city.id);

    return NextResponse.json({
      message: 'تم إنشاء المدينة بنجاح',
      city: formattedCity
    }, { status: 201 })

  } catch (error: any) {
    console.error('خطأ في إنشاء المدينة:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'يوجد مدينة بنفس هذا المعرف مسبقاً' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}