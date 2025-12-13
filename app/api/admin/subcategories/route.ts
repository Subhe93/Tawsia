import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET all subcategories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const subCategories = await prisma.subCategory.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        category: { select: { name: true } }, // Include parent category name
        _count: {
          select: { companies: { where: { isActive: true } } }
        }
      },
      orderBy: { name: 'asc' }
    })

    const formattedSubCategories = subCategories.map(sub => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      icon: sub.icon,
      description: sub.description,
      companiesCount: sub._count.companies,
      isActive: sub.isActive,
      createdAt: sub.createdAt.toISOString(),
      categoryId: sub.categoryId,
      categoryName: sub.category.name
    }))

    return NextResponse.json({ subCategories: formattedSubCategories })

  } catch (error) {
    console.error('خطأ في جلب التصنيفات الفرعية:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// POST a new subcategory
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, icon, description, isActive, categoryId } = body

    if (!name || !slug || !categoryId) {
      return NextResponse.json({ error: 'الاسم، المعرف، ومعرف الفئة الرئيسية مطلوب' }, { status: 400 })
    }

    const existingSubCategory = await prisma.subCategory.findUnique({ where: { slug } })
    if (existingSubCategory) {
      return NextResponse.json({ error: 'يوجد تصنيف فرعي بنفس هذا المعرف مسبقاً' }, { status: 409 })
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        name,
        slug,
        icon: icon || null,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
        categoryId,
      },
      include: {
        category: { select: { name: true } },
        _count: { select: { companies: { where: { isActive: true } } } }
      }
    })
    
    const formattedSubCategory = {
        id: subCategory.id,
        name: subCategory.name,
        slug: subCategory.slug,
        icon: subCategory.icon,
        description: subCategory.description,
        companiesCount: subCategory._count.companies,
        isActive: subCategory.isActive,
        createdAt: subCategory.createdAt.toISOString(),
        categoryId: subCategory.categoryId,
        categoryName: subCategory.category.name
      }

    return NextResponse.json({ 
        message: 'تم إنشاء التصنيف الفرعي بنجاح',
        subCategory: formattedSubCategory
     }, { status: 201 })

  } catch (error: any) {
    console.error('خطأ في إنشاء التصنيف الفرعي:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'يوجد تصنيف فرعي بنفس هذا المعرف مسبقاً' }, { status: 409 })
    }
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
