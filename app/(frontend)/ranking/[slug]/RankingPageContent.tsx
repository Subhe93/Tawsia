"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Eye,
  ChevronLeft,
  ChevronRight,
  Building2,
  TrendingUp,
  Calendar,
  Award,
  Search,
  ArrowRight,
} from "lucide-react";
import { AdvancedSearchFilters } from "@/components/advanced-search-filters";
import {
  generateItemListSchema,
  generateOrganizationSchema,
  generateWebsiteSchema,
} from "@/lib/seo/schema-generator";

interface RankingPageProps {
  rankingPage: any;
}

export default function RankingPageContent({ rankingPage }: RankingPageProps) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<any>({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // جلب البيانات عند التحميل الأولي
  useEffect(() => {
    fetchCompanies({});
  }, []);

  // جلب الشركات من API مع الفيلترات
  const fetchCompanies = async (filters: any) => {
    try {
      setLoading(true);
      
      // بناء query string من الفيلترات
      const queryParams = new URLSearchParams();
      if (filters.q) queryParams.append("q", filters.q);
      if (filters.country) queryParams.append("country", filters.country);
      if (filters.city) queryParams.append("city", filters.city);
      if (filters.subArea) queryParams.append("subArea", filters.subArea);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.subCategory) queryParams.append("subCategory", filters.subCategory);
      if (filters.rating) queryParams.append("rating", filters.rating.toString());
      if (filters.verified) queryParams.append("verified", "true");
      if (filters.sort) queryParams.append("sort", filters.sort);

      const response = await fetch(
        `/api/ranking/${rankingPage.slug}/companies?${queryParams.toString()}`
      );
      const data = await response.json();
      const companiesList = data.companies || [];
      setCompanies(companiesList);
      setCurrentFilters(filters);
    } catch (error) {
      console.error("خطأ في جلب الشركات:", error);
    } finally {
      setLoading(false);
    }
  };

  // معالجة الفلاتر - استدعاء API مع الفيلترات الجديدة
  const handleFiltersChange = (filters: any) => {
    fetchCompanies(filters);
    setCurrentPage(1); // إعادة تعيين الصفحة إلى الأولى
  };

  // جلب قوائم الفلاتر من API
  const [filterOptions, setFilterOptions] = useState<any>({
    countries: [],
    cities: [],
    subAreas: [],
    categories: [],
    subCategories: [],
  });

  // جلب قوائم الفلاتر عند التحميل
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      // جلب جميع البيانات بشكل موازي
      const [
        countriesRes,
        citiesRes,
        subAreasRes,
        categoriesRes,
        subCategoriesRes,
      ] = await Promise.all([
        fetch("/api/countries?activeOnly=true"),
        fetch("/api/cities?activeOnly=true"),
        fetch("/api/sub-areas?activeOnly=true"),
        fetch("/api/categories?activeOnly=true"),
        fetch("/api/sub-categories?activeOnly=true"),
      ]);

      // التحقق من نجاح الاستجابات
      if (!countriesRes.ok) {
        console.error("خطأ في جلب الدول:", await countriesRes.text());
      }
      if (!citiesRes.ok) {
        console.error("خطأ في جلب المدن:", await citiesRes.text());
      }
      if (!subAreasRes.ok) {
        console.error("خطأ في جلب المناطق الفرعية:", await subAreasRes.text());
      }
      if (!categoriesRes.ok) {
        console.error("خطأ في جلب الفئات:", await categoriesRes.text());
      }
      if (!subCategoriesRes.ok) {
        console.error("خطأ في جلب الفئات الفرعية:", await subCategoriesRes.text());
      }

      // تحويل الاستجابات إلى JSON
      const [
        countriesData,
        citiesData,
        subAreasData,
        categoriesData,
        subCategoriesData,
      ] = await Promise.all([
        countriesRes.ok ? countriesRes.json() : { countries: [] },
        citiesRes.ok ? citiesRes.json() : { cities: [] },
        subAreasRes.ok ? subAreasRes.json() : { subAreas: [] },
        categoriesRes.ok ? categoriesRes.json() : { categories: [] },
        subCategoriesRes.ok ? subCategoriesRes.json() : { subCategories: [] },
      ]);

      setFilterOptions({
        countries: countriesData.countries || [],
        cities: citiesData.cities || [],
        subAreas: subAreasData.subAreas || [],
        categories: categoriesData.categories || [],
        subCategories: subCategoriesData.subCategories || [],
      });
    } catch (error) {
      console.error("خطأ في جلب قوائم الفلاتر:", error);
      // في حالة الخطأ، نعيّن القوائم فارغة
      setFilterOptions({
        countries: [],
        cities: [],
        subAreas: [],
        categories: [],
        subCategories: [],
      });
    }
  };

  // Pagination
  const totalPages = Math.ceil(companies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = companies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Generate schemas
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://murabaat.com";
  const itemListSchema =
    companies.length > 0
      ? generateItemListSchema(
          companies,
          baseUrl,
          rankingPage.title,
          rankingPage.description
        )
      : null;
  const organizationSchema = generateOrganizationSchema(baseUrl);
  const websiteSchema = generateWebsiteSchema(baseUrl);

  // Generate breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: baseUrl,
        name: "الرئيسية",
      },
      rankingPage.country && {
        "@type": "ListItem",
        position: 2,
        item: `${baseUrl}/country/${rankingPage.country.code}`,
        name: rankingPage.country.name,
      },
      rankingPage.city && {
        "@type": "ListItem",
        position: 3,
        item: `${baseUrl}/country/${rankingPage.country?.code}/city/${rankingPage.city.slug}`,
        name: rankingPage.city.name,
      },
      rankingPage.category && {
        "@type": "ListItem",
        position: 4,
        item: `${baseUrl}/country/${rankingPage.country?.code}/category/${rankingPage.category.slug}`,
        name: rankingPage.category.name,
      },
      {
        "@type": "ListItem",
        position: rankingPage.category ? 5 : rankingPage.city ? 4 : 3,
        item: `${baseUrl}/ranking/${rankingPage.slug}`,
        name: rankingPage.title,
      },
    ].filter(Boolean),
  };

  // Generate CollectionPage schema for ranking
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: rankingPage.title,
    description: rankingPage.description,
    url: `${baseUrl}/ranking/${rankingPage.slug}`,
    inLanguage: "ar",
    about: {
      "@type": "Thing",
      name: rankingPage.category?.name || "خدمات",
      description: `دليل ${rankingPage.title}`,
    },
    mainEntity: {
      "@type": "ItemList",
      name: rankingPage.title,
      description: rankingPage.description,
      numberOfItems: companies.length,
    },
    specialty: rankingPage.category?.name,
    audience: {
      "@type": "Audience",
      geographicArea: {
        "@type": "Place",
        name: rankingPage.city?.name || rankingPage.country?.name || "",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* All Schemas */}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />

      {/* Breadcrumbs */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 rtl:space-x-reverse">
            <Link
              href="/"
              className="hover:text-brand-green transition-colors flex items-center gap-1"
            >
              <span>🏠</span>
              <span>الرئيسية</span>
            </Link>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            {rankingPage.country && (
              <>
                <Link
                  href={`/country/${rankingPage.country.code}`}
                  className="hover:text-brand-green transition-colors"
                >
                  {rankingPage.country.flag} {rankingPage.country.name}
                </Link>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </>
            )}
            {rankingPage.city && (
              <>
                <Link
                  href={`/country/${rankingPage.country?.code}/city/${rankingPage.city.slug}`}
                  className="hover:text-brand-green transition-colors"
                >
                  {rankingPage.city.name}
                </Link>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </>
            )}
            {rankingPage.category && (
              <>
                <Link
                  href={`/country/${rankingPage.country?.code}/category/${rankingPage.category.slug}`}
                  className="hover:text-brand-green transition-colors"
                >
                  {rankingPage.category.name}
                </Link>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </>
            )}
            <span className="text-gray-900 font-medium">تصنيف مميز</span>
          </nav>
        </div>
      </div>

      {/* Header with Logo Colors */}
      <div className="relative bg-gradient-to-br from-brand-green via-brand-yellow to-brand-orange text-white overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-white rounded-full blur-3xl transform translate-y-1/2"></div>
        </div>

        {/* Decorative Squares Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, white 1px, transparent 1px),
                linear-gradient(to bottom, white 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white/95 font-bold text-sm">
                  تصنيف مميز ⭐
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 drop-shadow-lg">
              {rankingPage.title}
            </h1>

            {/* Description */}
            {rankingPage.description && (
              <p className="text-xl text-white/95 mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-4 drop-shadow">
                {rankingPage.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-white/20">
                <Eye className="w-5 h-5" />
                <span className="font-bold">
                  {rankingPage.viewsCount.toLocaleString()}
                </span>
                <span className="text-white/90 text-sm">مشاهدة</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-white/20">
                <Building2 className="w-5 h-5" />
                <span className="font-bold">{companies.length}</span>
                <span className="text-white/90 text-sm">
                  {companies.length === 1 ? "شركة" : "شركات"}
                </span>
              </div>
              {rankingPage.publishedAt && (
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-white/20">
                  <Calendar className="w-5 h-5" />
                  <span className="text-white/90 text-sm">
                    {new Date(rankingPage.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="w-full h-12"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Advanced Search Filters */}
        <AdvancedSearchFilters
          onFiltersChange={handleFiltersChange}
          showLocationFilter={true}
          showCategoryFilter={true}
          showRatingFilter={true}
          showPriceFilter={false}
          showHoursFilter={false}
          filterOptions={filterOptions}
          initialValues={{
            q: "",
            country: "",
            city: "",
            subArea: "",
            category: "",
            subCategory: "",
            rating: "",
            verified: "",
            sort: "rating",
          }}
        />

        {/* Results Summary */}
        {!loading && (
          <div className="mb-6 flex items-center justify-between">
            <div className="text-gray-600">
              عرض{" "}
              <span className="font-bold text-gray-900">{startIndex + 1}</span> -{" "}
              <span className="font-bold text-gray-900">
                {Math.min(startIndex + itemsPerPage, companies.length)}
              </span>{" "}
              من أصل{" "}
              <span className="font-bold text-gray-900">
                {companies.length}
              </span>{" "}
              {companies.length === 1 ? "شركة" : "شركات"}
            </div>
          </div>
        )}

        {/* Companies Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
              >
                <div className="w-full h-52 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedCompanies.length > 0 ? (
          <div className="mb-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedCompanies.map((company, index) => (
                <div
                  key={company.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-brand-green/30 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    {company.mainImage || company.images?.[0] ? (
                      <img
                        src={
                          company.mainImage ||
                          company.images[0]?.imageUrl ||
                          ""
                        }
                        alt={company.name}
                        className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-52 bg-gradient-to-br from-brand-green/10 via-brand-yellow/10 to-brand-orange/10 flex items-center justify-center">
                        <span className="text-6xl text-gray-300 font-bold">
                          {company.name[0]}
                        </span>
                      </div>
                    )}

                    {/* Ranking Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-br from-brand-yellow via-brand-orange to-brand-red text-white w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-xl border-4 border-white">
                      #{startIndex + index + 1}
                    </div>

                    {/* Verified Badge */}
                    {company.isVerified && (
                      <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Award className="w-3 h-3" />
                        <span>موثق</span>
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-xl">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-gray-900">
                          {company.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-600">
                          ({company._count?.reviews || 0})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-brand-green transition-colors line-clamp-1">
                      <Link
                        href={`/country/${company.country.code}/city/${company.city.slug}/company/${company.slug}`}
                      >
                        {company.name}
                      </Link>
                    </h3>

                    {company.shortDescription && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {company.shortDescription}
                      </p>
                    )}

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-4 bg-gray-50 px-3 py-2 rounded-lg">
                      <MapPin className="w-4 h-4 text-brand-green flex-shrink-0" />
                      <span className="line-clamp-1">
                        {company.subArea?.name
                          ? `${company.subArea.name}، `
                          : ""}
                        {company.city.name}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {company.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-brand-green" />
                          <a
                            href={`tel:${company.phone}`}
                            className="hover:text-brand-green transition-colors"
                          >
                            {company.phone}
                          </a>
                        </div>
                      )}
                      {company.website && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="w-4 h-4 text-brand-green" />
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-brand-green transition-colors line-clamp-1"
                          >
                            الموقع الإلكتروني
                          </a>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`/country/${company.country.code}/city/${company.city.slug}/company/${company.slug}`}
                      className="block w-full text-center bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white py-3 px-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              لا توجد نتائج
            </h3>
            <p className="text-gray-600 mb-6">
              لم نجد أي شركات تطابق معايير البحث الخاصة بك
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
              <span className="hidden sm:inline">السابق</span>
            </button>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-gradient-to-br from-brand-green to-brand-yellow text-white shadow-lg scale-110"
                        : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 hover:border-brand-green"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              <span className="hidden sm:inline">التالي</span>
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Related Pages */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-brand-green via-brand-yellow to-brand-orange rounded-full"></div>
            <span>صفحات ذات صلة</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rankingPage.category && (
              <Link
                href={`/country/${rankingPage.country?.code}/category/${rankingPage.category.slug}`}
                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-brand-green hover:shadow-lg transition-all"
              >
                <h3 className="font-bold text-gray-900 group-hover:text-brand-green transition-colors mb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span>جميع {rankingPage.category.name}</span>
                </h3>
                <p className="text-sm text-gray-600">
                  في {rankingPage.country?.name}
                </p>
              </Link>
            )}
            {rankingPage.city && (
              <Link
                href={`/country/${rankingPage.country?.code}/city/${rankingPage.city.slug}`}
                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-brand-green hover:shadow-lg transition-all"
              >
                <h3 className="font-bold text-gray-900 group-hover:text-brand-green transition-colors mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>جميع الشركات في {rankingPage.city.name}</span>
                </h3>
                <p className="text-sm text-gray-600">
                  {rankingPage.country?.name}
                </p>
              </Link>
            )}
            {rankingPage.subArea && (
              <Link
                href={`/country/${rankingPage.country?.code}/city/${rankingPage.city?.slug}/sub-area/${rankingPage.subArea.slug}`}
                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-brand-green hover:shadow-lg transition-all"
              >
                <h3 className="font-bold text-gray-900 group-hover:text-brand-green transition-colors mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>جميع الشركات في {rankingPage.subArea.name}</span>
                </h3>
                <p className="text-sm text-gray-600">
                  {rankingPage.city?.name}، {rankingPage.country?.name}
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
