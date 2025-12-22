/**
 * API لإعادة بناء السايت ماب
 * POST /api/admin/sitemap/rebuild
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { buildAllSitemaps, rebuildModifiedFiles } from '@/lib/sitemap/builder';

export async function POST(req: NextRequest) {
  try {
    // التحقق من الصلاحيات
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { mode = 'modified' } = body; // 'all' or 'modified'

    let result;
    
    if (mode === 'all') {
      // إعادة بناء كل شيء
      result = await buildAllSitemaps();
    } else {
      // إعادة بناء الملفات المعدلة فقط
      result = await rebuildModifiedFiles();
    }

    return NextResponse.json({
      success: result.success,
      data: {
        mode,
        totalFiles: result.totalFiles || result.rebuiltFiles,
        totalUrls: result.totalUrls || 0,
        totalSize: result.totalSize || '0 KB',
        totalTime: result.totalTime || 0,
        message: mode === 'all' 
          ? 'تم إعادة بناء جميع الملفات بنجاح' 
          : `تم تحديث ${result.rebuiltFiles || 0} ملف`,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في إعادة البناء:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في إعادة بناء السايت ماب',
      },
      { status: 500 }
    );
  }
}

