import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - جلب معرض الصور
export async function GET() {
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

    // جلب صور الشركة
    const images = await prisma.companyImage.findMany({
      where: { companyId: companyOwner.companyId },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // جلب معلومات الشركة للصورة الرئيسية
    const company = await prisma.company.findUnique({
      where: { id: companyOwner.companyId },
      select: { mainImage: true, logoImage: true }
    })

    return NextResponse.json({
      images,
      mainImage: company?.mainImage,
      logoImage: company?.logoImage
    })

  } catch (error) {
    console.error('خطأ في جلب معرض الصور:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// POST - إضافة صورة جديدة
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl, altText, category, description, title } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'رابط الصورة مطلوب' }, { status: 400 })
    }

    // العثور على الشركة
    const companyOwner = await prisma.companyOwner.findFirst({
      where: { userId: session.user.id },
      select: { companyId: true }
    })

    if (!companyOwner) {
      return NextResponse.json({ error: 'لم يتم العثور على شركة مرتبطة بحسابك' }, { status: 404 })
    }

    // الحصول على أعلى sortOrder
    const lastImage = await prisma.companyImage.findFirst({
      where: { companyId: companyOwner.companyId },
      orderBy: { sortOrder: 'desc' }
    })

    // إضافة الصورة الجديدة
    const newImage = await prisma.companyImage.create({
      data: {
        companyId: companyOwner.companyId,
        imageUrl,
        altText: altText || title || 'صورة الشركة',
        sortOrder: (lastImage?.sortOrder || 0) + 1
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الصورة بنجاح',
      image: newImage
    })

  } catch (error) {
    console.error('خطأ في إضافة الصورة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إضافة الصورة' },
      { status: 500 }
    )
  }
}
