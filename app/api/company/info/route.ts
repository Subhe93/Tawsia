import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - جلب معلومات الشركة
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    // العثور على الشركة التي يملكها المستخدم
    const companyOwner = await prisma.companyOwner.findFirst({
      where: { userId: session.user.id },
      include: {
        company: {
          include: {
            category: true,
            subCategory: true, // Include subcategory
            city: {
              include: {
                country: true
              }
            },
            subArea: {
              include: {
                city: true,
                country: true
              }
            },
            images: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            },
            socialMedia: {
              where: { isActive: true }
            },
            workingHours: {
              orderBy: { dayOfWeek: 'asc' }
            },
            _count: {
              select: {
                reviews: {
                  where: { isApproved: true }
                },
                images: {
                  where: { isActive: true }
                }
              }
            }
          }
        }
      }
    })

    if (!companyOwner) {
      return NextResponse.json({ error: 'لم يتم العثور على شركة مرتبطة بحسابك' }, { status: 404 })
    }

    return NextResponse.json({
      company: companyOwner.company
    })

  } catch (error) {
    console.error('خطأ في جلب معلومات الشركة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// PUT - تحديث معلومات الشركة
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      shortDescription,
      longDescription,
      categoryId,
      subCategoryId, // Destructure subCategoryId
      cityId,
      subAreaId,
      phone,
      email,
      website,
      address,
      latitude,
      longitude,
      services,
      specialties,
      isActive,
      logoImage
    } = body

    // التحقق من وجود الشركة
    const companyOwner = await prisma.companyOwner.findFirst({
      where: { userId: session.user.id },
      include: { company: true }
    })

    if (!companyOwner) {
      return NextResponse.json({ error: 'لم يتم العثور على شركة مرتبطة بحسابك' }, { status: 404 })
    }

    // تحديث معلومات الشركة
    const updatedCompany = await prisma.company.update({
      where: { id: companyOwner.companyId },
      data: {
        name,
        description,
        shortDescription,
        longDescription,
        categoryId,
        subCategoryId: subCategoryId || null, // Add to update data
        cityId,
        subAreaId: subAreaId || null,
        phone,
        email,
        website,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        services: services || [],
        specialties: specialties || [],
        isActive: isActive ?? true,
        logoImage: logoImage || null,
        updatedAt: new Date()
      },
      include: {
        category: true,
        subCategory: true,
        city: {
          include: {
            country: true
          }
        },
        subArea: {
          include: {
            city: true,
            country: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث معلومات الشركة بنجاح',
      company: updatedCompany
    })

  } catch (error) {
    console.error('خطأ في تحديث معلومات الشركة:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث المعلومات' },
      { status: 500 }
    )
  }
}