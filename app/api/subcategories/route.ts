import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const subCategories = await prisma.subCategory.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId: categoryId }),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        icon: true,
        description: true,
        categoryId: true,
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

    const formattedSubCategories = subCategories.map(subCategory => ({
      id: subCategory.id,
      slug: subCategory.slug,
      name: subCategory.name,
      icon: subCategory.icon,
      description: subCategory.description,
      categoryId: subCategory.categoryId,
      companiesCount: subCategory._count.companies
    }))

    return NextResponse.json({ 
      success: true,
      subCategories: formattedSubCategories
    })

  } catch (error) {
    console.error('خطأ في جلب التصنيفات الفرعية:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ في الخادم أثناء جلب التصنيفات الفرعية' 
      },
      { status: 500 }
    )
  }
}
