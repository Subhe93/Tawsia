import { NextRequest, NextResponse } from "next/server";
import {
  getHomePageData,
  getSiteStatsByCountry,
} from "@/lib/services/homepage.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");

    if (!country) {
      return NextResponse.json(
        { error: "Country code is required" },
        { status: 400 }
      );
    }

    // Fetch data filtered by country
    const data = await getHomePageData(country);
    const stats = await getSiteStatsByCountry(country);

    return NextResponse.json({
      categories: data.categories,
      featuredCompanies: data.featuredCompanies,
      latestReviews: data.latestReviews.map((review) => ({
        ...review,
        createdAt:
          review.createdAt instanceof Date
            ? review.createdAt.toISOString()
            : review.createdAt,
      })),
      stats: {
        totalCountries: 1,
        totalCompanies: stats.companiesCount,
        totalCategories: stats.categoriesCount,
        totalReviews: stats.reviewsCount,
      },
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
