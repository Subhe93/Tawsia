/**
 * API للحصول على إحصائيات السايت ماب
 * GET /api/admin/sitemap/stats
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentDistribution } from '@/lib/sitemap/distributor';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. الإحصائيات العامة
    const totalCompanies = await prisma.company.count({
      where: { isActive: true },
    });

    const companiesInSitemap = await prisma.sitemapEntry.count({
      where: {
        entryType: 'COMPANY',
        isActive: true,
      },
    });

    const totalEntries = await prisma.sitemapEntry.count({
      where: { isActive: true },
    });

    // 2. معلومات الملفات
    const files = await prisma.sitemapFile.findMany({
      where: { isActive: true },
      orderBy: [{ fileType: 'asc' }, { fileIndex: 'asc' }],
    });

    // 3. آخر دفعة
    const lastBatch = await prisma.sitemapBatch.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    // 4. توزيع الشركات
    const distribution = await getCurrentDistribution();

    // 5. الإعدادات
    const config = await prisma.sitemapConfig.findFirst();

    // 6. حساب حجم السايت ماب
    const totalSize = files.reduce((sum, f) => sum + Number(f.fileSize || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        // الإحصائيات العامة
        totalCompanies,
        companiesInSitemap,
        companiesRemaining: totalCompanies - companiesInSitemap,
        totalUrls: totalEntries,

        // معلومات الملفات
        totalFiles: files.length,
        filesDetails: files.map((f) => ({
          fileName: f.fileName,
          fileType: f.fileType,
          urlsCount: f.urlsCount,
          maxCapacity: f.maxCapacity,
          percentage: ((f.urlsCount / f.maxCapacity) * 100).toFixed(2),
          isFull: f.isFull,
          fileSize: Number(f.fileSize || 0),
          lastGenerated: f.lastGenerated,
          needsRebuild: f.needsRebuild,
        })),

        // آخر دفعة
        lastBatch: lastBatch
          ? {
            batchNumber: lastBatch.batchNumber,
            companiesCount: lastBatch.companiesCount,
            method: lastBatch.method,
            addedByName: lastBatch.addedByName,
            createdAt: lastBatch.createdAt,
            status: lastBatch.status,
          }
          : null,

        // توزيع الشركات
        distribution: {
          totalFiles: distribution.totalFiles,
          fullFiles: distribution.fullFiles,
          partialFiles: distribution.partialFiles,
          emptyFiles: distribution.emptyFiles,
          totalUrls: distribution.totalUrls,
          availableSpace: distribution.availableSpace,
          nextFile: distribution.nextFile,
        },

        // معلومات إضافية
        sitemapSize: totalSize,
        lastFullRebuild: config?.lastFullRebuild || null,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب الإحصائيات',
      },
      { status: 500 }
    );
  }
}

