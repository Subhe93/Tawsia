import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { upsertSeoOverride } from "@/lib/database/seo-queries";
import { z } from "zod";

const TargetEnum = z.enum([
  "COMPANY",
  "CATEGORY",
  "SUBCATEGORY",
  "COUNTRY",
  "CITY",
  "SUBAREA",
  "RANKING_PAGE",
  "CUSTOM_PATH",
]);

const bodySchema = z.object({
  targetType: TargetEnum.optional(),
  targetId: z.string().min(1).optional(),
  path: z.string().min(1).optional(),
  title: z.string().max(60).nullable().optional(),
  metaDescription: z.string().max(160).nullable().optional(),
  noindex: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const data = bodySchema.parse(json);

    if (!data.path && !(data.targetType && data.targetId)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "يجب تحديد path أو (targetType + targetId)" },
        },
        { status: 400 }
      );
    }

    const saved = await upsertSeoOverride({
      ...data,
      updatedById: (session.user as any).id,
    });
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Failed to upsert SEO override:", error);
    return NextResponse.json(
      { success: false, error: { message: "فشل في الحفظ" } },
      { status: 500 }
    );
  }
}
