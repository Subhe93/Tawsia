import { NextRequest, NextResponse } from "next/server";
import { deleteRankingPages } from "@/lib/database/ranking-queries";

/**
 * POST /api/admin/ranking-pages/bulk-delete
 * حذف عدة صفحات تصنيف دفعة واحدة
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "الرجاء تحديد معرفات الصفحات المراد حذفها",
          },
        },
        { status: 400 }
      );
    }

    // حذف الصفحات
    const result = await deleteRankingPages(body.ids);

    return NextResponse.json({
      success: true,
      data: { deletedCount: result.count },
      message: `تم حذف ${result.count} صفحة بنجاح`,
    });
  } catch (error) {
    console.error("خطأ في حذف صفحات التصنيف:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DELETE_ERROR",
          message: "حدث خطأ أثناء حذف صفحات التصنيف",
        },
      },
      { status: 500 }
    );
  }
}


