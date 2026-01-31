import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const countryCode = searchParams.get("country")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        companies: [],
        countries: [],
        cities: [],
        categories: [],
      });
    }

    // Search companies
    let companies: any[] = [];
    try {
      companies = await prisma.company.findMany({
        where: {
          isActive: true,
          ...(countryCode && { country: { code: countryCode } }),
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logoImage: true,
          rating: true,
          country: {
            select: {
              code: true,
              name: true,
            },
          },
          city: {
            select: {
              slug: true,
              name: true,
            },
          },
          category: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
        take: 5,
        orderBy: { rating: "desc" },
      });
    } catch (e: any) {
      console.error("Companies search error:", e?.message);
    }

    // Search countries (only if no country filter)
    let countries: any[] = [];
    if (!countryCode) {
      try {
        countries = await prisma.country.findMany({
          where: {
            isActive: true,
            name: { contains: query, mode: "insensitive" },
          },
          select: {
            id: true,
            code: true,
            name: true,
            flag: true,
            _count: {
              select: {
                companies: true,
              },
            },
          },
          take: 5,
        });
      } catch (e: any) {
        console.error("Countries search error:", e?.message);
      }
    }

    // Search cities
    let cities: any[] = [];
    try {
      cities = await prisma.city.findMany({
        where: {
          isActive: true,
          ...(countryCode && { countryCode }),
          name: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          slug: true,
          name: true,
          country: {
            select: {
              code: true,
              name: true,
            },
          },
          _count: {
            select: {
              companies: true,
            },
          },
        },
        take: 5,
      });
    } catch (e: any) {
      console.error("Cities search error:", e?.message);
    }

    // Search categories
    let categories: any[] = [];
    try {
      categories = await prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          slug: true,
          name: true,
          icon: true,
          _count: {
            select: {
              companies: true,
            },
          },
        },
        take: 5,
      });
    } catch (e: any) {
      console.error("Categories search error:", e?.message);
    }

    return NextResponse.json({
      companies,
      countries,
      cities,
      categories,
    });
  } catch (error: any) {
    console.error("Quick search error:", error?.message || error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء البحث", details: error?.message },
      { status: 500 },
    );
  }
}
