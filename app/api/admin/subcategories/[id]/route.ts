import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PATCH a subcategory
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const subCategoryId = params.id
    const body = await request.json()
    
    if (!subCategoryId) {
      return NextResponse.json({ error: 'معرف التصنيف الفرعي مطلوب' }, { status: 400 })
    }

    const subCategory = await prisma.subCategory.update({
      where: { id: subCategoryId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
      },
      include: {
        category: { select: { name: true } },
        _count: { select: { companies: { where: { isActive: true } } } }
      }
    })

    return NextResponse.json({
      message: 'تم تحديث التصنيف الفرعي بنجاح',
      subCategory: {
        ...subCategory,
        companiesCount: subCategory._count.companies,
        categoryName: subCategory.category.name
      }
    })

  } catch (error) {
    console.error('خطأ في تحديث التصنيف الفرعي:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// DELETE a subcategory
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const subCategoryId = params.id
    if (!subCategoryId) {
      return NextResponse.json({ error: 'معرف التصنيف الفرعي مطلوب' }, { status: 400 })
    }

    const companiesCount = await prisma.company.count({
      where: { subCategoryId, isActive: true }
    })

    if (companiesCount > 0) {
      return NextResponse.json({ error: `لا يمكن حذف التصنيف الفرعي لأنه يحتوي على ${companiesCount} شركة` }, { status: 409 })
    }

    await prisma.subCategory.delete({
      where: { id: subCategoryId }
    })

    return NextResponse.json({ message: 'تم حذف التصنيف الفرعي بنجاح' })

  } catch (error) {
    console.error('خطأ في حذف التصنيف الفرعي:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
