import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const searchParamsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = searchParamsSchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const pageNumber = parseInt(page || "1", 10);
    const limitNumber = parseInt(limit || "20", 10);
    const skip = (pageNumber - 1) * limitNumber;

    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber,
      }),
      prisma.notification.count(),
    ]);

    return NextResponse.json({
      data: notifications,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.notification.deleteMany({});
    return NextResponse.json({
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete notifications:", error);
    return NextResponse.json(
      { message: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}
