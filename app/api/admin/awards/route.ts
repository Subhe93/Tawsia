import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for award validation
const CreateAwardSchema = z.object({
  companyId: z.string().min(1, 'معرف الشركة مطلوب'),
  title: z.string().min(3, 'عنوان الجائزة يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  awardType: z.enum(['GOLD', 'SILVER', 'BRONZE', 'CERTIFICATE']),
  issuer: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

// Schema for award update validation
const UpdateAwardSchema = z.object({
  id: z.string().min(1, 'معرف الجائزة مطلوب'),
  title: z.string().min(3, 'عنوان الجائزة يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  awardType: z.enum(['GOLD', 'SILVER', 'BRONZE', 'CERTIFICATE']),
  issuer: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

// GET /api/admin/awards - Get all awards (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: { message: 'غير مصرح' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (companyId) {
      where.companyId = companyId;
    }

    const [awards, total] = await Promise.all([
      prisma.award.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              city: {
                select: {
                  name: true,
                },
              },
              country: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.award.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: awards,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('خطأ في جلب الجوائز:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء جلب الجوائز',
          code: 'FETCH_AWARDS_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/awards - Create a new award (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: { message: 'غير مصرح' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = CreateAwardSchema.parse(body);

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: validatedData.companyId },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: { message: 'الشركة غير موجودة' } },
        { status: 404 }
      );
    }

    // Create award
    const award = await prisma.award.create({
      data: {
        companyId: validatedData.companyId,
        title: validatedData.title,
        description: validatedData.description || null,
        year: validatedData.year || null,
        awardType: validatedData.awardType,
        issuer: validatedData.issuer || null,
        imageUrl: validatedData.imageUrl || null,
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: award,
      message: 'تم إضافة الجائزة بنجاح'
    }, { status: 201 });

  } catch (error) {
    console.error('خطأ في إنشاء الجائزة:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'بيانات غير صحيحة',
            details: error.errors,
            code: 'VALIDATION_ERROR'
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء إضافة الجائزة',
          code: 'CREATE_AWARD_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/awards - Update an award (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: { message: 'غير مصرح' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = UpdateAwardSchema.parse(body);

    // Check if award exists
    const existingAward = await prisma.award.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingAward) {
      return NextResponse.json(
        { success: false, error: { message: 'الجائزة غير موجودة' } },
        { status: 404 }
      );
    }

    // Update award
    const updatedAward = await prisma.award.update({
      where: { id: validatedData.id },
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        year: validatedData.year || null,
        awardType: validatedData.awardType,
        issuer: validatedData.issuer || null,
        imageUrl: validatedData.imageUrl || null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedAward,
      message: 'تم تحديث الجائزة بنجاح'
    });

  } catch (error) {
    console.error('خطأ في تحديث الجائزة:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'بيانات غير صحيحة',
            details: error.errors,
            code: 'VALIDATION_ERROR'
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء تحديث الجائزة',
          code: 'UPDATE_AWARD_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/awards - Delete an award (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: { message: 'غير مصرح' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'معرف الجائزة مطلوب' } },
        { status: 400 }
      );
    }

    // Check if award exists
    const award = await prisma.award.findUnique({
      where: { id },
    });

    if (!award) {
      return NextResponse.json(
        { success: false, error: { message: 'الجائزة غير موجودة' } },
        { status: 404 }
      );
    }

    // Soft delete award
    await prisma.award.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف الجائزة بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حذف الجائزة:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'حدث خطأ أثناء حذف الجائزة',
          code: 'DELETE_AWARD_ERROR'
        }
      },
      { status: 500 }
    );
  }
}
