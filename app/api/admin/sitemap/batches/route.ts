/**
 * API للحصول على سجل الدفعات
 * GET /api/admin/sitemap/batches
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // جلب الدفعات
    const batches = await prisma.sitemapBatch.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // العدد الإجمالي
    const total = await prisma.sitemapBatch.count();

    return NextResponse.json({
      success: true,
      data: {
        batches: batches.map((b) => ({
          id: b.id,
          batchNumber: b.batchNumber,
          companiesCount: b.companiesCount,
          method: b.method,
          filters: b.filters,
          affectedFiles: b.affectedFiles,
          distributionMap: b.distributionMap,
          addedBy: b.addedBy,
          addedByName: b.addedByName,
          status: b.status,
          notes: b.notes,
          createdAt: b.createdAt,
          completedAt: b.completedAt,
        })),
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في جلب الدفعات:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في جلب سجل الدفعات',
      },
      { status: 500 }
    );
  }
}

