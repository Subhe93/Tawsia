import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { updateSubAreaInSitemap } from '@/lib/sitemap/auto-updater';

// Schema للتحقق من صحة البيانات
const createSubAreaSchema = z.object({
  name: z.string().min(1, 'اسم المنطقة الفرعية مطلوب'),
  slug: z.string().min(1, 'معرف المنطقة الفرعية مطلوب'),
  cityId: z.string().min(1, 'معرف المدينة مطلوب'),
  countryId: z.string().min(1, 'معرف البلد مطلوب'),
  description: z.string().optional(),
  image: z.string().optional(),
});

const updateSubAreaSchema = createSubAreaSchema.partial();

// GET - جلب جميع المناطق الفرعية
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId');
    const countryCode = searchParams.get('countryCode');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const where: any = {
      isActive: true,
    };

    if (cityId) {
      where.cityId = cityId;
    }

    if (countryCode) {
      where.countryCode = countryCode;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [subAreas, total] = await Promise.all([
      prisma.subArea.findMany({
        where,
        include: {
          city: true,
          country: true,
          _count: {
            select: {
              companies: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.subArea.count({ where }),
    ]);

    return NextResponse.json({
      data: subAreas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('خطأ في جلب المناطق الفرعية:', error);
    return NextResponse.json(
      { error: 'خطأ في جلب المناطق الفرعية' },
      { status: 500 }
    );
  }
}

// POST - إنشاء منطقة فرعية جديدة
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    const body = await request.json();
    const validatedData = createSubAreaSchema.parse(body);

    // التحقق من وجود المدينة والبلد
    const [city, country] = await Promise.all([
      prisma.city.findUnique({ where: { id: validatedData.cityId } }),
      prisma.country.findFirst({
        where: {
          OR: [
            { id: validatedData.countryId },
            { code: validatedData.countryId }
          ]
        }
      }),
    ]);

    if (!city) {
      return NextResponse.json(
        { error: 'المدينة غير موجودة' },
        { status: 404 }
      );
    }

    if (!country) {
      return NextResponse.json(
        { error: 'البلد غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من عدم وجود منطقة فرعية بنفس الاسم في نفس المدينة
    const existingSubArea = await prisma.subArea.findFirst({
      where: {
        name: validatedData.name,
        cityId: validatedData.cityId,
        isActive: true,
      },
    });

    if (existingSubArea) {
      return NextResponse.json(
        { error: 'يوجد منطقة فرعية بنفس الاسم في هذه المدينة' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود slug مكرر
    const existingSlug = await prisma.subArea.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'معرف المنطقة الفرعية مستخدم بالفعل' },
        { status: 400 }
      );
    }

    const subArea = await prisma.subArea.create({
      data: {
        ...validatedData,
        countryId: country.id, // استخدام معرف البلد الصحيح
        cityCode: city.slug,
        countryCode: country.code,
      },
      include: {
        city: true,
        country: true,
      },
    });

    // تحديث السايت ماب
    await updateSubAreaInSitemap(subArea.id);

    return NextResponse.json(subArea, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.issues },
        { status: 400 }
      );
    }

    console.error('خطأ في إنشاء المنطقة الفرعية:', error);
    return NextResponse.json(
      { error: 'خطأ في إنشاء المنطقة الفرعية' },
      { status: 500 }
    );
  }
}
