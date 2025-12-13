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

    const cityId = params.id
    const body = await request.json()
    
    if (!cityId) {
      return NextResponse.json({ error: 'معرف المدينة مطلوب' }, { status: 400 })
    }

    // التحقق من وجود المدينة
    const existingCity = await prisma.city.findUnique({
      where: { id: cityId }
    })

    if (!existingCity) {
      return NextResponse.json({ error: 'المدينة غير موجودة' }, { status: 404 })
    }

    // التحقق من وجود البلد المحدد إذا تم تغييره
    if (body.countryId && body.countryId !== existingCity.countryId) {
      const country = await prisma.country.findUnique({
        where: { id: body.countryId }
      })

      if (!country) {
        return NextResponse.json({ error: 'البلد المحدد غير موجود' }, { status: 400 })
      }
    }

    const city = await prisma.city.update({
      where: { id: cityId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug.toLowerCase() }),
        ...(body.countryId !== undefined && { countryId: body.countryId }),
        ...(body.image !== undefined && { image: body.image || null }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      include: {
        country: {
          select: {
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            companies: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    const formattedCity = {
      id: city.id,
      slug: city.slug,
      name: city.name,
      countryId: city.countryId,
      countryCode: city.country.code,
      image: city.image,
      description: city.description,
      companiesCount: city._count.companies,
      isActive: city.isActive,
      createdAt: city.createdAt.toISOString(),
      country: city.country
    }

    return NextResponse.json({
      message: 'تم تحديث المدينة بنجاح',
      city: formattedCity
    })

  } catch (error: any) {
    console.error('خطأ في تحديث المدينة:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'يوجد مدينة بنفس هذا المعرف مسبقاً' },
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

    const cityId = params.id
    
    if (!cityId) {
      return NextResponse.json({ error: 'معرف المدينة مطلوب' }, { status: 400 })
    }

    // التحقق من عدم وجود شركات مرتبطة بهذه المدينة
    const companiesCount = await prisma.company.count({
      where: { cityId, isActive: true }
    })

    if (companiesCount > 0) {
      return NextResponse.json({ 
        error: `لا يمكن حذف المدينة لأنها تحتوي على ${companiesCount} شركة نشطة` 
      }, { status: 400 })
    }

    await prisma.city.delete({
      where: { id: cityId }
    })

    return NextResponse.json({
      message: 'تم حذف المدينة بنجاح'
    })

  } catch (error) {
    console.error('خطأ في حذف المدينة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}