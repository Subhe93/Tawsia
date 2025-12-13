import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PUT - تحديث صورة
export async function PUT(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const body = await request.json()
    const { altText, sortOrder, isActive, isMainImage } = body

    // العثور على الشركة
    const companyOwner = await prisma.companyOwner.findFirst({
      where: { userId: session.user.id },
      select: { companyId: true }
    })

    if (!companyOwner) {
      return NextResponse.json({ error: 'لم يتم العثور على شركة مرتبطة بحسابك' }, { status: 404 })
    }

    // التحقق من ملكية الصورة
    const image = await prisma.companyImage.findFirst({
      where: {
        id: params.imageId,
        companyId: companyOwner.companyId
      }
    })

    if (!image) {
      return NextResponse.json({ error: 'الصورة غير موجودة' }, { status: 404 })
    }

    // تحديث الصورة
    const updatedImage = await prisma.companyImage.update({
      where: { id: params.imageId },
      data: {
        altText,
        sortOrder,
        isActive
      }
    })

    // إذا كانت صورة رئيسية، تحديث الشركة
    if (isMainImage) {
      await prisma.company.update({
        where: { id: companyOwner.companyId },
        data: { mainImage: updatedImage.imageUrl }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الصورة بنجاح',
      image: updatedImage
    })

  } catch (error) {
    console.error('خطأ في تحديث الصورة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الصورة' },
      { status: 500 }
    )
  }
}

// DELETE - حذف صورة
export async function DELETE(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    // العثور على الشركة
    const companyOwner = await prisma.companyOwner.findFirst({
      where: { userId: session.user.id },
      select: { companyId: true }
    })

    if (!companyOwner) {
      return NextResponse.json({ error: 'لم يتم العثور على شركة مرتبطة بحسابك' }, { status: 404 })
    }

    // التحقق من ملكية الصورة
    const image = await prisma.companyImage.findFirst({
      where: {
        id: params.imageId,
        companyId: companyOwner.companyId
      }
    })

    if (!image) {
      return NextResponse.json({ error: 'الصورة غير موجودة' }, { status: 404 })
    }

    // حذف الصورة
    await prisma.companyImage.delete({
      where: { id: params.imageId }
    })

    // إذا كانت الصورة الرئيسية، إزالتها من الشركة
    const company = await prisma.company.findUnique({
      where: { id: companyOwner.companyId },
      select: { mainImage: true }
    })

    if (company?.mainImage === image.imageUrl) {
      await prisma.company.update({
        where: { id: companyOwner.companyId },
        data: { mainImage: null }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الصورة بنجاح'
    })

  } catch (error) {
    console.error('خطأ في حذف الصورة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الصورة' },
      { status: 500 }
    )
  }
}
