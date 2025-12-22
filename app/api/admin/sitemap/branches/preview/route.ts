
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
        }

        const body = await request.json();
        const { type, entityId } = body;

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
        let potentialUrls: string[] = [];
        let stats = { total: 0, new: 0, existing: 0 };

        // منطق توليد التفرعات حسب النوع
        if (type === 'CATEGORY') {
            const category = await prisma.category.findUnique({ where: { id: entityId } });
            if (!category) return NextResponse.json({ error: 'الفئة غير موجودة' }, { status: 404 });
            if (!category.isActive) return NextResponse.json({ error: 'الفئة غير نشطة' }, { status: 400 });

            // 1. مدينة + فئة
            const cities = await prisma.city.findMany({
                where: {
                    isActive: true,
                    country: { isActive: true }
                },
                include: { country: true }
            });

            for (const city of cities) {
                potentialUrls.push(`${baseUrl}/country/${city.country.code}/city/${city.slug}/category/${category.slug}`);
            }

            // 2. منطقة + فئة
            // (يمكن تفعيلها لاحقاً لتجنب العدد الضخم)
        }

        // التحقق من الروابط الموجودة
        const existingUrls = await prisma.sitemapEntry.findMany({
            where: {
                url: { in: potentialUrls }
            },
            select: { url: true }
        });

        const existingSet = new Set(existingUrls.map(e => e.url));
        const newUrls = potentialUrls.filter(url => !existingSet.has(url));

        return NextResponse.json({
            success: true,
            data: {
                total: potentialUrls.length,
                existing: existingSet.size,
                new: newUrls.length,
                sample: newUrls.slice(0, 5), // عينة من 5 روابط جديدة
                message: `تم العثور على ${newUrls.length} رابط جديد من أصل ${potentialUrls.length}`
            }
        });

    } catch (error) {
        console.error('خطأ في معاينة التفرعات:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ في الخادم' },
            { status: 500 }
        );
    }
}
