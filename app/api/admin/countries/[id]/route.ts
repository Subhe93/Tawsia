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

    const countryId = params.id
    const body = await request.json()
    
    if (!countryId) {
      return NextResponse.json({ error: 'معرف البلد مطلوب' }, { status: 400 })
    }

    // التحقق من وجود البلد
    const existingCountry = await prisma.country.findUnique({
      where: { id: countryId }
    })

    if (!existingCountry) {
      return NextResponse.json({ error: 'البلد غير موجود' }, { status: 404 })
    }

    const country = await prisma.country.update({
      where: { id: countryId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.code !== undefined && { code: body.code.toLowerCase() }),
        ...(body.flag !== undefined && { flag: body.flag || null }),
        ...(body.image !== undefined && { image: body.image || null }),
        ...(body.description !== undefined && { description: body.description || null }),
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
      message: 'تم تحديث البلد بنجاح',
      country: formattedCountry
    })

  } catch (error: any) {
    console.error('خطأ في تحديث البلد:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const countryId = params.id
    
    if (!countryId) {
      return NextResponse.json({ error: 'معرف البلد مطلوب' }, { status: 400 })
    }

    // التحقق من عدم وجود شركات مرتبطة بهذا البلد
    const companiesCount = await prisma.company.count({
      where: { countryId, isActive: true }
    })

    if (companiesCount > 0) {
      return NextResponse.json({ 
        error: `لا يمكن حذف البلد لأنه يحتوي على ${companiesCount} شركة نشطة` 
      }, { status: 400 })
    }

    await prisma.country.delete({
      where: { id: countryId }
    })

    return NextResponse.json({
      message: 'تم حذف البلد بنجاح'
    })

  } catch (error) {
    console.error('خطأ في حذف البلد:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}