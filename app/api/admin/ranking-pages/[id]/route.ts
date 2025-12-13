import { NextRequest, NextResponse } from "next/server";
import {
  getRankingPageById,
  updateRankingPage,
  deleteRankingPage,
} from "@/lib/database/ranking-queries";
import { UpdateRankingPageData } from "@/lib/types/database";

/**
 * GET /api/admin/ranking-pages/[id]
 * الحصول على تفاصيل صفحة تصنيف محددة
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rankingPage = await getRankingPageById(params.id);

    if (!rankingPage) {
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

    return NextResponse.json({
      success: true,
      data: rankingPage,
    });
  } catch (error) {
    console.error("خطأ في جلب صفحة التصنيف:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "حدث خطأ أثناء جلب صفحة التصنيف",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ranking-pages/[id]
 * تحديث صفحة تصنيف
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // التحقق من وجود الصفحة
    const existingPage = await getRankingPageById(params.id);
    if (!existingPage) {
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

    // تحديث الصفحة
    const data: UpdateRankingPageData = {
      id: params.id,
      slug: body.slug,
      title: body.title,
      description: body.description,
      content: body.content,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      metaKeywords: body.metaKeywords,
      countryId: body.countryId || undefined,
      cityId: body.cityId || undefined,
      subAreaId: body.subAreaId || undefined,
      categoryId: body.categoryId || undefined,
      subCategoryId: body.subCategoryId || undefined,
      limit: body.limit,
      sortBy: body.sortBy,
      customCompanies: body.customCompanies,
      excludedCompanies: body.excludedCompanies,
      isActive: body.isActive,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
    };

    const rankingPage = await updateRankingPage(data);

    return NextResponse.json({
      success: true,
      data: rankingPage,
      message: "تم تحديث صفحة التصنيف بنجاح",
    });
  } catch (error: any) {
    console.error("خطأ في تحديث صفحة التصنيف:", error);

    // التحقق من خطأ التكرار (slug موجود مسبقاً)
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_SLUG",
            message: "هذا الـ slug موجود بالفعل",
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message: "حدث خطأ أثناء تحديث صفحة التصنيف",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ranking-pages/[id]
 * حذف صفحة تصنيف
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // التحقق من وجود الصفحة
    const existingPage = await getRankingPageById(params.id);
    if (!existingPage) {
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

    // حذف الصفحة
    await deleteRankingPage(params.id);

    return NextResponse.json({
      success: true,
      message: "تم حذف صفحة التصنيف بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف صفحة التصنيف:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DELETE_ERROR",
          message: "حدث خطأ أثناء حذف صفحة التصنيف",
        },
      },
      { status: 500 }
    );
  }
}


