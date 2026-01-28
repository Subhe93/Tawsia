import { NextRequest, NextResponse } from "next/server";
import {
  getHomePageData,
  getSiteStatsByCountry,
} from "@/lib/services/homepage.service";
import { getCountryCities } from "@/lib/services/country.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");

    if (!country) {
      return NextResponse.json(
        { error: "Country code is required" },
        { status: 400 },
      );
    }

    // Fetch data filtered by country
    const [countryData, stats, cities] = await Promise.all([
      getHomePageData(country), // Get all data filtered by country
      getSiteStatsByCountry(country),
      getCountryCities(country),
    ]);

    return NextResponse.json({
      cities: cities,
      featuredCompanies: countryData.featuredCompanies, // Featured companies filtered by country
      latestReviews: countryData.latestReviews.map((review) => ({
        ...review,
        createdAt:
          review.createdAt instanceof Date
            ? review.createdAt.toISOString()
            : review.createdAt,
      })),
      stats: {
        countriesCount: 1,
        companiesCount: stats.companiesCount,
        categoriesCount: stats.categoriesCount,
        reviewsCount: stats.reviewsCount,
      },
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
