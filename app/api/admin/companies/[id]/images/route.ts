import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const imagesData = await request.json()
    
    // إضافة الصور الجديدة
    if (Array.isArray(imagesData) && imagesData.length > 0) {
      await prisma.companyImage.createMany({
        data: imagesData.map(image => ({
          companyId: params.id,
          imageUrl: image.imageUrl,
          altText: image.altText || '',
          sortOrder: image.sortOrder || 0,
          isActive: true
        }))
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('خطأ في حفظ صور الشركة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const images = await prisma.companyImage.findMany({
      where: { 
        companyId: params.id,
        isActive: true 
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(images)

  } catch (error) {
    console.error('خطأ في جلب صور الشركة:', error)
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

    const { imageId } = await request.json()

    await prisma.companyImage.update({
      where: { id: imageId },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('خطأ في حذف الصورة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
