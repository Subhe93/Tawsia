import { NextRequest, NextResponse } from "next/server";
import { RankingPageGenerator } from "@/lib/services/ranking-generator.service";
import { RankingPageGeneratorOptions } from "@/lib/types/database";

/**
 * POST /api/admin/ranking-pages/generate
 * توليد صفحات تصنيف تلقائياً
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // استخراج الخيارات
    const options: RankingPageGeneratorOptions = {
      countries: body.countries || undefined,
      cities: body.cities || undefined,
      categories: body.categories || undefined,
      subCategories: body.subCategories || undefined,
      subAreas: body.subAreas || undefined,
      minCompanies: body.minCompanies || 5,
      skipExisting: body.skipExisting !== undefined ? body.skipExisting : true,
      includeSubCategories:
        body.includeSubCategories !== undefined
          ? body.includeSubCategories
          : true,
      includeSubAreas:
        body.includeSubAreas !== undefined ? body.includeSubAreas : true,
    };

    // توليد الصفحات
    const result = await RankingPageGenerator.generatePages(options);

    return NextResponse.json({
      success: true,
      data: result,
      message: `تم توليد ${result.created} صفحة بنجاح، تم تخطي ${result.skipped} صفحة`,
    });
  } catch (error) {
    console.error("خطأ في توليد صفحات التصنيف:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "GENERATION_ERROR",
          message: "حدث خطأ أثناء توليد صفحات التصنيف",
          details: error instanceof Error ? error.message : "خطأ غير معروف",
        },
      },
      { status: 500 }
    );
  }
}


