import { NextRequest, NextResponse } from "next/server";
import {
  getRankingPageBySlug,
  getCompaniesForRankingPage,
} from "@/lib/database/ranking-queries";

/**
 * GET /api/ranking/[slug]/companies
 * الحصول على الشركات الخاصة بصفحة تصنيف
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const rankingPage = await getRankingPageBySlug(params.slug);

    if (!rankingPage || !rankingPage.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "صفحة التصنيف غير موجودة",
          },
        },
        { status: 404 }
      );
    }

    // استخراج الفيلترات من query parameters
    const { searchParams } = new URL(request.url);
    const filters = {
      q: searchParams.get("q") || undefined,
      country: searchParams.get("country") || undefined,
      city: searchParams.get("city") || undefined,
      subArea: searchParams.get("subArea") || undefined,
      category: searchParams.get("category") || undefined,
      subCategory: searchParams.get("subCategory") || undefined,
      rating: searchParams.get("rating") ? parseFloat(searchParams.get("rating")!) : undefined,
      verified: searchParams.get("verified") === "true" ? true : undefined,
      sort: searchParams.get("sort") || "rating",
    };

    // جلب الشركات مع الفيلترات
    const companies = await getCompaniesForRankingPage(rankingPage, filters);

    return NextResponse.json({
      success: true,
      companies,
      total: companies.length,
    });
  } catch (error) {
    console.error("خطأ في جلب الشركات:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "حدث خطأ أثناء جلب الشركات",
        },
      },
      { status: 500 }
    );
  }
}


