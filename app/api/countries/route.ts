import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    // جلب البلدان مع حساب عدد الشركات بشكل ديناميكي
    const countries = await prisma.country.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      select: {
        id: true,
        code: true,
        name: true,
        flag: true,
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
    const formattedCountries = countries.map(country => ({
      id: country.id,
      code: country.code,
      name: country.name,
      flag: country.flag,
      companiesCount: country._count.companies
    }))

    return NextResponse.json({ 
      success: true,
      countries: formattedCountries
    })

  } catch (error) {
    console.error('خطأ في جلب البلدان:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ في الخادم أثناء جلب البلدان' 
      },
      { status: 500 }
    )
  }
}
