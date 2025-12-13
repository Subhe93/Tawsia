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

    // التحقق من معامل الاستعلام لتصفية الفئات النشطة فقط
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const whereClause = activeOnly ? { isActive: true } : {}

    const categories = await prisma.category.findMany({
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

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description,
      companiesCount: category._count.companies,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString()
    }))

    return NextResponse.json({
      categories: formattedCategories
    })

  } catch (error) {
    console.error('خطأ في جلب الفئات:', error)
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
    const { name, icon, description, isActive } = body

    if (!name) {
      return NextResponse.json({ error: 'اسم الفئة مطلوب' }, { status: 400 })
    }

    // إنشاء slug من الاسم
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF\-]/g, '')
      .replace(/\-+/g, '-')
      .trim()

    // التحقق من عدم وجود فئة بنفس الـ slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'يوجد فئة بنفس هذا الاسم مسبقاً' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || null,
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

    const formattedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description,
      companiesCount: category._count.companies,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString()
    }

    return NextResponse.json({
      message: 'تم إنشاء الفئة بنجاح',
      category: formattedCategory
    }, { status: 201 })

  } catch (error: any) {
    console.error('خطأ في إنشاء الفئة:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'يوجد فئة بنفس هذا الاسم مسبقاً' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}