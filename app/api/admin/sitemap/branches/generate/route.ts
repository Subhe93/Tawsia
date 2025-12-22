
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateFileStats } from '@/lib/sitemap/distributor';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
        }

        const body = await request.json();
        const { type, entityId } = body;

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
        let addedCount = 0;

        if (type === 'CATEGORY') {
            const category = await prisma.category.findUnique({ where: { id: entityId } });
            if (!category) return NextResponse.json({ error: 'الفئة غير موجودة' }, { status: 404 });
            if (!category.isActive) return NextResponse.json({ error: 'لا يمكن توليد تفرعات لفئة غير نشطة' }, { status: 400 });

            // 1. مدينة + فئة
            const cities = await prisma.city.findMany({
                where: {
                    isActive: true,
                    country: { isActive: true } // التأكد من أن الدولة مفعلة أيضاً
                },
                include: { country: true }
            });

            for (const city of cities) {
                const url = `${baseUrl}/country/${city.country.code}/city/${city.slug}/category/${category.slug}`;

                // Upsert لضمان عدم التكرار
                await prisma.sitemapEntry.upsert({
                    where: { url },
                    create: {
                        entryType: 'CITY_CATEGORY',
                        slug: `country/${city.country.code}/city/${city.slug}/category/${category.slug}`,
                        url,
                        countryId: city.country.id,
                        cityId: city.id,
                        categoryId: category.id,
                        priority: 0.8,
                        changeFrequency: 'weekly',
                        sitemapFile: 'categories-mixed',
                        positionInFile: 0,
                        addMethod: 'AUTO_GENERATED',
                        isActive: true,
                    },
                    update: {
                        isActive: true,
                    }
                });
                addedCount++;
            }

            // تحديث حالة الملف (لإعادة البناء)
            await prisma.sitemapFile.updateMany({
                where: { fileName: 'sitemap-categories-mixed.xml' },
                data: { needsRebuild: true }
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                added: addedCount,
                message: `تم توليد ${addedCount} تفرع بنجاح`
            }
        });

    } catch (error) {
        console.error('خطأ في توليد التفرعات:', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ في الخادم' },
            { status: 500 }
        );
    }
}
