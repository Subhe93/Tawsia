import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    // التحقق من معامل الاستعلام لتصفية البلدان النشطة فقط
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const whereClause = activeOnly ? { isActive: true } : {}

    const countries = await prisma.country.findMany({
      where: whereClause,
      include: {
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

    const formattedCountries = countries.map(country => ({
      id: country.id,
      code: country.code,
      name: country.name,
      flag: country.flag,
      image: country.image,
      description: country.description,
      companiesCount: country._count.companies,
      isActive: country.isActive,
      createdAt: country.createdAt.toISOString()
    }))

    return NextResponse.json({
      countries: formattedCountries
    })

  } catch (error) {
    console.error('خطأ في جلب البلدان:', error)
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
    const { name, code, flag, image, description, isActive } = body

    if (!name || !code) {
      return NextResponse.json({ error: 'الاسم والكود مطلوبان' }, { status: 400 })
    }

    // التحقق من عدم وجود بلد بنفس الكود
    const existingCountry = await prisma.country.findUnique({
      where: { code: code.toLowerCase() }
    })

    if (existingCountry) {
      return NextResponse.json({ error: 'يوجد بلد بنفس هذا الكود مسبقاً' }, { status: 400 })
    }

    const country = await prisma.country.create({
      data: {
        name,
        code: code.toLowerCase(),
        flag: flag || null,
        image: image || null,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        _count: {
          select: {
            companies: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    const formattedCountry = {
      id: country.id,
      code: country.code,
      name: country.name,
      flag: country.flag,
      image: country.image,
      description: country.description,
      companiesCount: country._count.companies,
      isActive: country.isActive,
      createdAt: country.createdAt.toISOString()
    }

    return NextResponse.json({
      message: 'تم إنشاء البلد بنجاح',
      country: formattedCountry
    }, { status: 201 })

  } catch (error: any) {
    console.error('خطأ في إنشاء البلد:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'يوجد بلد بنفس هذا الكود مسبقاً' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}