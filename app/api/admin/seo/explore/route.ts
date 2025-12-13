import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getLiveSeoForTarget } from "@/lib/database/seo-preview";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") || undefined;
  const city = searchParams.get("city") || undefined;
  const subarea = searchParams.get("subarea") || undefined;
  const category = searchParams.get("category") || undefined;
  const subcategory = searchParams.get("subcategory") || undefined;
  const searchQuery = searchParams.get("search") || undefined;
  const typeFilter = searchParams.get("type") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const results: Array<{
      path: string;
      title: string;
      description: string;
      type: string;
      hasOverride: boolean;
      noindex: boolean;
    }> = [];

    // Check for existing overrides and return actual values
    const checkOverride = async (
      path: string,
      targetType?: string,
      targetId?: string,
      defaultTitle?: string,
      defaultDescription?: string
    ) => {
      try {
        const delegate = (prisma as any).seoOverride;
        if (!delegate)
          return {
            hasOverride: false,
            noindex: false,
            title: defaultTitle,
            description: defaultDescription,
          };

        const override = await delegate.findFirst({
          where: {
            OR: [
              { path },
              ...(targetType && targetId ? [{ targetType, targetId }] : []),
            ],
          },
        });

        if (override) {
          return {
            hasOverride: true,
            noindex: override.noindex || false,
            title: override.title || defaultTitle,
            description: override.metaDescription || defaultDescription,
          };
        }

        return {
          hasOverride: false,
          noindex: false,
          title: defaultTitle,
          description: defaultDescription,
        };
      } catch {
        return {
          hasOverride: false,
          noindex: false,
          title: defaultTitle,
          description: defaultDescription,
        };
      }
    };

    // 1. Static Pages (الصفحات الثابتة)
    const staticPages = [
      {
        path: "/",
        title: "توصية - دليل الشركات العربية",
        description: "دليل الشركات والخدمات في الوطن العربي",
        type: "STATIC",
      },
      {
        path: "/about",
        title: "من نحن | توصية",
        description:
          "تعرف على توصية ورسالتنا في تقديم دليل شامل للشركات العربية والعالمية",
        type: "STATIC",
      },
      {
        path: "/services",
        title: "جميع الخدمات | توصية",
        description: "اكتشف جميع الخدمات والمهن المتاحة في توصية",
        type: "STATIC",
      },
      {
        path: "/companies",
        title: "الشركات | توصية - دليل الشركات",
        description:
          "ابحث عن الشركات والخدمات باستخدام الفلاتر المتقدمة. ابحث حسب الموقع، الفئة، التقييم، والمزيد.",
        type: "STATIC",
      },
      {
        path: "/add-company",
        title: "أضف شركتك | توصية",
        description:
          "أضف شركتك إلى دليل توصية واصل إلى آلاف العملاء المحتملين في العالم العربي",
        type: "STATIC",
      },
      {
        path: "/search",
        title: "البحث المتقدم | توصية - دليل الشركات",
        description:
          "ابحث عن الشركات والخدمات باستخدام الفلاتر المتقدمة. ابحث حسب الموقع، الفئة، التقييم، والمزيد.",
        type: "STATIC",
      },
      {
        path: "/reviews",
        title: "آخر التقييمات | توصية",
        description: "اطلع على آراء العملاء حول الشركات والخدمات في توصية",
        type: "STATIC",
      },
      {
        path: "/privacy",
        title: "سياسة الخصوصية | توصية",
        description:
          "سياسة الخصوصية وحماية البيانات الشخصية في موقع توصية - دليل الشركات والخدمات",
        type: "STATIC",
      },
      {
        path: "/terms",
        title: "الشروط والأحكام | توصية",
        description:
          "الشروط والأحكام الخاصة باستخدام موقع توصية - دليل الشركات والخدمات",
        type: "STATIC",
      },
    ];

    for (const staticPage of staticPages) {
      const override = await checkOverride(
        staticPage.path,
        undefined,
        undefined,
        staticPage.title,
        staticPage.description
      );
      results.push({
        path: staticPage.path,
        type: staticPage.type,
        title: override.title || staticPage.title,
        description: override.description || staticPage.description,
        hasOverride: override.hasOverride,
        noindex: override.noindex,
      });
    }

    // 2. Companies (الشركات)
    if (!country && !city && !category) {
      const companies = await prisma.company.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, slug: true },
      });

      for (const company of companies) {
        const seoData = await getLiveSeoForTarget("COMPANY", company.id);
        if (seoData) {
          const override = await checkOverride(
            seoData.url,
            "COMPANY",
            company.id,
            seoData.title,
            seoData.description
          );
          results.push({
            path: seoData.url,
            title: override.title || seoData.title,
            description: override.description || seoData.description,
            type: "COMPANY",
            hasOverride: override.hasOverride,
            noindex: override.noindex,
          });
        }
      }
    }

    // 3. Categories (الفئات)
    if (!country && !city) {
      const categories = await prisma.category.findMany({
        select: { id: true, name: true, slug: true },
      });

      for (const cat of categories) {
        const seoData = await getLiveSeoForTarget("CATEGORY", cat.id);
        if (seoData) {
          const override = await checkOverride(
            seoData.url,
            "CATEGORY",
            cat.id,
            seoData.title,
            seoData.description
          );
          results.push({
            path: seoData.url,
            title: override.title || seoData.title,
            description: override.description || seoData.description,
            type: "CATEGORY",
            hasOverride: override.hasOverride,
            noindex: override.noindex,
          });
        }

        // Subcategories
        const subcategories = await prisma.subCategory.findMany({
          where: { categoryId: cat.id },
          select: { id: true, name: true, slug: true },
        });

        for (const subcat of subcategories) {
          const seoData = await getLiveSeoForTarget("SUBCATEGORY", subcat.id);
          if (seoData) {
            const override = await checkOverride(
              seoData.url,
              "SUBCATEGORY",
              subcat.id,
              seoData.title,
              seoData.description
            );
            results.push({
              path: seoData.url,
              title: override.title || seoData.title,
              description: override.description || seoData.description,
              type: "SUBCATEGORY",
              hasOverride: override.hasOverride,
              noindex: override.noindex,
            });
          }
        }
      }
    }

    // 4. Countries (البلدان)
    const countries = await prisma.country.findMany({
      where: country ? { code: country } : {},
      select: { id: true, name: true, code: true },
    });

    for (const countryRow of countries) {
      const seoData = await getLiveSeoForTarget("COUNTRY", countryRow.id);
      if (seoData) {
        const override = await checkOverride(
          seoData.url,
          "COUNTRY",
          countryRow.id,
          seoData.title,
          seoData.description
        );
        results.push({
          path: seoData.url,
          title: override.title || seoData.title,
          description: override.description || seoData.description,
          type: "COUNTRY",
          hasOverride: override.hasOverride,
          noindex: override.noindex,
        });
      }

      // Country + Category combinations
      if (!city) {
        const categories = await prisma.category.findMany({
          where: category ? { slug: category } : {},
          select: { id: true, name: true, slug: true },
        });

        for (const cat of categories) {
          const path = `/country/${countryRow.code}/category/${cat.slug}`;
          const defaultTitle = `أفضل 10 ${cat.name} في ${countryRow.name} | توصية`;
          const defaultDescription = `اكتشف أفضل شركات ${cat.name} في ${countryRow.name}`;
          const override = await checkOverride(
            path,
            undefined,
            undefined,
            defaultTitle,
            defaultDescription
          );

          results.push({
            path,
            title: override.title || defaultTitle,
            description: override.description || defaultDescription,
            type: "COUNTRY_CATEGORY",
            hasOverride: override.hasOverride,
            noindex: override.noindex,
          });

          // Country + Category + Subcategory
          const subcategories = await prisma.subCategory.findMany({
            where: {
              categoryId: cat.id,
              ...(subcategory ? { slug: subcategory } : {}),
            },
            select: { id: true, name: true, slug: true },
          });

          for (const subcat of subcategories) {
            const path = `/country/${countryRow.code}/category/${cat.slug}/${subcat.slug}`;
            const defaultTitle = `أفضل 10 ${subcat.name} في ${countryRow.name} | ${cat.name} | توصية`;
            const defaultDescription = `اكتشف أفضل شركات ${subcat.name} في ${countryRow.name}`;
            const override = await checkOverride(
              path,
              undefined,
              undefined,
              defaultTitle,
              defaultDescription
            );

            results.push({
              path,
              title: override.title || defaultTitle,
              description: override.description || defaultDescription,
              type: "COUNTRY_SUBCATEGORY",
              hasOverride: override.hasOverride,
              noindex: override.noindex,
            });
          }
        }
      }
    }

    // 5. Cities (المدن)
    for (const countryRow of countries) {
      const cities = await prisma.city.findMany({
        where: {
          countryCode: countryRow.code,
          ...(city ? { slug: city } : {}),
        },
        select: { id: true, name: true, slug: true },
      });

      for (const cityRow of cities) {
        const seoData = await getLiveSeoForTarget("CITY", cityRow.id);
        if (seoData) {
          const override = await checkOverride(
            seoData.url,
            "CITY",
            cityRow.id,
            seoData.title,
            seoData.description
          );
          results.push({
            path: seoData.url,
            title: override.title || seoData.title,
            description: override.description || seoData.description,
            type: "CITY",
            hasOverride: override.hasOverride,
            noindex: override.noindex,
          });
        }

        // City + Category combinations
        const categories = await prisma.category.findMany({
          where: category ? { slug: category } : {},
          select: { id: true, name: true, slug: true },
        });

        for (const cat of categories) {
          const path = `/country/${countryRow.code}/city/${cityRow.slug}/category/${cat.slug}`;
          const defaultTitle = `أفضل 10 ${cat.name} في ${cityRow.name}, ${countryRow.name} |  توصية`;
          const defaultDescription = `اكتشف أفضل شركات ${cat.name} في ${cityRow.name}, ${countryRow.name}`;
          const override = await checkOverride(
            path,
            undefined,
            undefined,
            defaultTitle,
            defaultDescription
          );

          results.push({
            path,
            title: override.title || defaultTitle,
            description: override.description || defaultDescription,
            type: "CITY_CATEGORY",
            hasOverride: override.hasOverride,
            noindex: override.noindex,
          });

          // City + Category + Subcategory
          const subcategories = await prisma.subCategory.findMany({
            where: {
              categoryId: cat.id,
              ...(subcategory ? { slug: subcategory } : {}),
            },
            select: { id: true, name: true, slug: true },
          });

          for (const subcat of subcategories) {
            const path = `/country/${countryRow.code}/city/${cityRow.slug}/category/${cat.slug}/${subcat.slug}`;
            const defaultTitle = `أفضل 10 ${subcat.name} في ${cityRow.name}, ${countryRow.name} | ${cat.name} | توصية`;
            const defaultDescription = `اكتشف أفضل شركات ${subcat.name} في ${cityRow.name}, ${countryRow.name}`;
            const override = await checkOverride(
              path,
              undefined,
              undefined,
              defaultTitle,
              defaultDescription
            );

            results.push({
              path,
              title: override.title || defaultTitle,
              description: override.description || defaultDescription,
              type: "CITY_SUBCATEGORY",
              hasOverride: override.hasOverride,
              noindex: override.noindex,
            });
          }
        }

        // Sub-areas (المناطق الفرعية)
        const subAreas = await prisma.subArea.findMany({
          where: {
            cityId: cityRow.id,
            ...(subarea ? { slug: subarea } : {}),
          },
          select: { id: true, name: true, slug: true },
        });

        for (const subAreaRow of subAreas) {
          const seoData = await getLiveSeoForTarget("SUBAREA", subAreaRow.id);
          if (seoData) {
            const override = await checkOverride(
              seoData.url,
              "SUBAREA",
              subAreaRow.id,
              seoData.title,
              seoData.description
            );
            results.push({
              path: seoData.url,
              title: override.title || seoData.title,
              description: override.description || seoData.description,
              type: "SUBAREA",
              hasOverride: override.hasOverride,
              noindex: override.noindex,
            });
          }

          // SubArea + Category combinations
          for (const cat of categories) {
            const path = `/country/${countryRow.code}/city/${cityRow.slug}/sub-area/${subAreaRow.slug}/category/${cat.slug}`;
            const defaultTitle = `أفضل 10 ${cat.name} في ${subAreaRow.name}, ${cityRow.name}, ${countryRow.name} | توصية`;
            const defaultDescription = `اكتشف أفضل شركات ${cat.name} في ${subAreaRow.name}, ${cityRow.name}, ${countryRow.name}`;
            const override = await checkOverride(
              path,
              undefined,
              undefined,
              defaultTitle,
              defaultDescription
            );

            results.push({
              path,
              title: override.title || defaultTitle,
              description: override.description || defaultDescription,
              type: "SUBAREA_CATEGORY",
              hasOverride: override.hasOverride,
              noindex: override.noindex,
            });

            // SubArea + Category + Subcategory
            const subcategories = await prisma.subCategory.findMany({
              where: {
                categoryId: cat.id,
                ...(subcategory ? { slug: subcategory } : {}),
              },
              select: { id: true, name: true, slug: true },
            });

            for (const subcat of subcategories) {
              const path = `/country/${countryRow.code}/city/${cityRow.slug}/sub-area/${subAreaRow.slug}/category/${cat.slug}/${subcat.slug}`;
              const defaultTitle = `أفضل 10 ${subcat.name} في ${subAreaRow.name}, ${cityRow.name}, ${countryRow.name} | ${cat.name} | توصية`;
              const defaultDescription = `اكتشف أفضل شركات ${subcat.name} في ${subAreaRow.name}, ${cityRow.name}, ${countryRow.name}`;
              const override = await checkOverride(
                path,
                undefined,
                undefined,
                defaultTitle,
                defaultDescription
              );

              results.push({
                path,
                title: override.title || defaultTitle,
                description: override.description || defaultDescription,
                type: "SUBAREA_SUBCATEGORY",
                hasOverride: override.hasOverride,
                noindex: override.noindex,
              });
            }
          }
        }
      }
    }

    // 6. Ranking Pages (صفحات الترتيب)
    if (!country && !city && !category) {
      const rankingPages = await prisma.rankingPage.findMany({
        select: { id: true, title: true, slug: true },
      });

      for (const ranking of rankingPages) {
        const seoData = await getLiveSeoForTarget("RANKING_PAGE", ranking.id);
        if (seoData) {
          const override = await checkOverride(
            seoData.url,
            "RANKING_PAGE",
            ranking.id,
            seoData.title,
            seoData.description
          );
          results.push({
            path: seoData.url,
            title: override.title || seoData.title,
            description: override.description || seoData.description,
            type: "RANKING_PAGE",
            hasOverride: override.hasOverride,
            noindex: override.noindex,
          });
        }
      }
    }

    // Apply filters and search
    let filteredResults = results;

    // Filter by type
    if (typeFilter && typeFilter !== "ALL") {
      filteredResults = filteredResults.filter(
        (item) => item.type === typeFilter
      );
    }

    // Apply search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filteredResults = filteredResults.filter(
        (item) =>
          item.path.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      pagination: {
        page,
        limit,
        total: filteredResults.length,
        totalPages: Math.ceil(filteredResults.length / limit),
      },
      filters: {
        country,
        city,
        subarea,
        category,
        subcategory,
        search: searchQuery,
        type: typeFilter,
      },
    });
  } catch (error) {
    console.error("خطأ في استكشاف الروابط:", error);
    return NextResponse.json(
      { success: false, error: { message: "فشل في استكشاف الروابط" } },
      { status: 500 }
    );
  }
}
