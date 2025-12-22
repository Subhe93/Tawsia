/**
 * API لإضافة دفعة جديدة من الشركات للسايت ماب
 * POST /api/admin/sitemap/add-batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { distributeCompanies, updateFileStats } from '@/lib/sitemap/distributor';
import { rebuildModifiedFiles } from '@/lib/sitemap/builder';

export async function POST(req: NextRequest) {
  try {
    // التحقق من الصلاحيات (اختياري - حسب نظام Auth)
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      companyIds,
      method,
      filters = {},
      priority = 0.9,
      changeFrequency = 'monthly',
      notes,
    } = body;

    if (!companyIds || companyIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'لا توجد شركات للإضافة' },
        { status: 400 }
      );
    }

    // 1. حساب التوزيع
    const distribution = await distributeCompanies(companyIds.length);

    // 2. إنشاء Batch
    const batch = await prisma.sitemapBatch.create({
      data: {
        companiesCount: companyIds.length,
        method: method || 'MANUAL',
        methodParams: filters,
        filters: filters,
        affectedFiles: distribution.affectedFiles,
        distributionMap: distribution.distribution.reduce((acc: any, d) => {
          acc[d.fileName] = d.count;
          return acc;
        }, {}),
        addedBy: (session as any)?.user?.id || 'admin',
        addedByName: (session as any)?.user?.name || 'المدير',
        status: 'PROCESSING',
        notes: notes || null,
      },
    });

    // 3. جلب معلومات الشركات
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, slug: true },
    });

    const companiesMap = companies.reduce((acc: any, c) => {
      acc[c.id] = c;
      return acc;
    }, {});

    // 4. توزيع الشركات على الملفات
    let companyIndex = 0;
    let skipped = 0;

    for (const dist of distribution.distribution) {
      const companiesToAdd = companyIds.slice(companyIndex, companyIndex + dist.count);

      // التحقق من عدم التكرار
      const existing = await prisma.sitemapEntry.findMany({
        where: {
          companyId: { in: companiesToAdd },
          isActive: true,
        },
        select: { companyId: true },
      });

      const existingIds = new Set(existing.map((e) => e.companyId));
      const newCompanies = companiesToAdd.filter((id) => !existingIds.has(id));
      skipped += companiesToAdd.length - newCompanies.length;

      if (newCompanies.length === 0) {
        companyIndex += dist.count;
        continue;
      }

      // إضافة السجلات
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://twsia.com';
      const entries = newCompanies.map((id, idx) => ({
        entryType: 'COMPANY' as const,
        slug: companiesMap[id]?.slug || '',
        url: `${baseUrl}/${companiesMap[id]?.slug}`,
        priority: priority,
        changeFrequency: changeFrequency,
        sitemapFile: `companies-${dist.fileIndex}`,
        fileIndex: dist.fileIndex,
        positionInFile: dist.currentCount + idx + 1,
        companyId: id,
        batchNumber: batch.batchNumber,
        addMethod: (method || 'MANUAL') as any,
        addedBy: (session as any)?.user?.id || null,
        isActive: true,
      }));

      await prisma.sitemapEntry.createMany({
        data: entries,
        skipDuplicates: true,
      });

      companyIndex += dist.count;
    }

    // 5. تحديث إحصائيات الملفات
    await updateFileStats(distribution.distribution);

    // 6. تحديث حالة الـ Batch
    await prisma.sitemapBatch.update({
      where: { id: batch.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // 7. إعادة بناء الملفات المتأثرة
    // (يمكن تشغيله في الخلفية أو جعله اختياري)
    try {
      await rebuildModifiedFiles();
    } catch (error) {
      console.error('⚠️ خطأ في إعادة البناء:', error);
      // لا نفشل العملية بسبب هذا
    }

    // 8. تحديث الإعدادات
    const totalUrls = await prisma.sitemapEntry.count({
      where: { isActive: true },
    });
    await prisma.sitemapConfig.updateMany({
      data: { totalUrls },
    });

    return NextResponse.json({
      success: true,
      data: {
        batchNumber: batch.batchNumber,
        added: companyIds.length - skipped,
        skipped,
        affectedFiles: distribution.affectedFiles,
        message: `تم إضافة ${companyIds.length - skipped} شركة بنجاح`,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في إضافة الدفعة:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في إضافة الدفعة',
      },
      { status: 500 }
    );
  }
}

