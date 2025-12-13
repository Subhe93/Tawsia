import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listSeoTargetsByType } from "@/lib/database/seo-queries";

type SeoTargetTypeLocal =
  | "COMPANY"
  | "CATEGORY"
  | "SUBCATEGORY"
  | "COUNTRY"
  | "CITY"
  | "SUBAREA"
  | "RANKING_PAGE";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") as SeoTargetTypeLocal) || "COMPANY";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const search = searchParams.get("search") || undefined;
  const country = searchParams.get("country") || undefined;
  const city = searchParams.get("city") || undefined;
  const subarea = searchParams.get("subarea") || undefined;
  const category = searchParams.get("category") || undefined;
  const subcategory = searchParams.get("subcategory") || undefined;
  const status =
    (searchParams.get("status") as "all" | "customized" | "default") || "all";
  const noindex =
    (searchParams.get("noindex") as "all" | "true" | "false") || "all";

  try {
    const { items, pagination } = await listSeoTargetsByType(type, {
      page,
      limit,
      search,
      status,
      noindex,
      country,
      city,
      subarea,
      category,
      subcategory,
    });
    return NextResponse.json({ success: true, data: items, pagination });
  } catch (error) {
    console.error("Failed to list SEO targets:", error);
    return NextResponse.json(
      { success: false, error: { message: "فشل في جلب البيانات" } },
      { status: 500 }
    );
  }
}
