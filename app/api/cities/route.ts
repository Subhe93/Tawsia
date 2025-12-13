import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countryId = searchParams.get('countryId')
    const countryCode = searchParams.get('countryCode')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where: any = {
      ...(activeOnly && { isActive: true }),
      ...(countryId && { countryId }),
      ...(countryCode && { countryCode })
    }

    // جلب المدن مع حساب عدد الشركات بشكل ديناميكي
    const cities = await prisma.city.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        countryCode: true,
        country: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            companies: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // تحويل البيانات لتتطابق مع الواجهة المطلوبة
    const formattedCities = cities.map(city => ({
      id: city.id,
      slug: city.slug,
      name: city.name,
      companiesCount: city._count.companies,
      country: city.country
    }))

    return NextResponse.json({ 
      success: true,
      cities: formattedCities
    })

  } catch (error) {
    console.error('خطأ في جلب المدن:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ في الخادم أثناء جلب المدن' 
      },
      { status: 500 }
    )
  }
}
