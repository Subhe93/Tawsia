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

    // Fetch data - cities/reviews filtered by country, featured companies globally
    const [countryData, globalData, stats, cities] = await Promise.all([
      getHomePageData(country), // For reviews (filtered by country)
      getHomePageData(), // For featured companies (global)
      getSiteStatsByCountry(country),
      getCountryCities(country),
    ]);

    return NextResponse.json({
      cities: cities,
      featuredCompanies: globalData.featuredCompanies, // Global featured companies
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
