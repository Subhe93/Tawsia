import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const categoryId = params.id
    const body = await request.json()
    
    if (!categoryId) {
      return NextResponse.json({ error: 'معرف الفئة مطلوب' }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
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

    return NextResponse.json({
      message: 'تم تحديث الفئة بنجاح',
      category: {
        ...category,
        companiesCount: category._count.companies
      }
    })

  } catch (error) {
    console.error('خطأ في تحديث الفئة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const categoryId = params.id
    
    if (!categoryId) {
      return NextResponse.json({ error: 'معرف الفئة مطلوب' }, { status: 400 })
    }

    // التحقق من عدم وجود شركات مرتبطة بالفئة
    const companiesCount = await prisma.company.count({
      where: { categoryId, isActive: true }
    })

    if (companiesCount > 0) {
      return NextResponse.json({ 
        error: `لا يمكن حذف الفئة لأنها تحتوي على ${companiesCount} شركة` 
      }, { status: 400 })
    }

    await prisma.category.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({
      message: 'تم حذف الفئة بنجاح'
    })

  } catch (error) {
    console.error('خطأ في حذف الفئة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
