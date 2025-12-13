import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getLiveSeoForTarget } from "@/lib/database/seo-preview";

type SeoTargetTypeLocal =
  | "COMPANY"
  | "CATEGORY"
  | "SUBCATEGORY"
  | "COUNTRY"
  | "CITY"
  | "SUBAREA"
  | "RANKING_PAGE"
  | "CUSTOM_PATH";

export interface SeoTargetItem {
  type: SeoTargetTypeLocal;
  id: string;
  name: string;
  path: string;
  defaultTitle: string;
  defaultDescription: string;
  override?: {
    title?: string | null;
    metaDescription?: string | null;
    noindex?: boolean;
  };
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "customized" | "default";
  noindex?: "all" | "true" | "false";
  country?: string;
  city?: string;
  subarea?: string;
  category?: string;
  subcategory?: string;
}

async function safeFindOverrides(where: any): Promise<any[]> {
  try {
    const delegate = (prisma as any).seoOverride;
    if (!delegate || typeof delegate.findMany !== "function") return [];
    return await delegate.findMany({ where });
  } catch {
    return [];
  }
}

async function safeCountOverrides(where: any): Promise<number> {
  try {
    const delegate = (prisma as any).seoOverride;
    if (!delegate || typeof delegate.count !== "function") return 0;
    return await delegate.count({ where });
  } catch {
    return 0;
  }
}

export async function listSeoTargetsByType(
  type: SeoTargetTypeLocal,
  params: ListParams = {}
): Promise<{
  items: SeoTargetItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;
  const skip = (page - 1) * limit;
  const search = params.search?.trim();
  const status = params.status || "all";
  const noindexFilter = params.noindex || "all";
  const countryFilter = params.country;
  const cityFilter = params.city;
  const subareaFilter = params.subarea;
  const categoryFilter = params.category;
  const subcategoryFilter = params.subcategory;

  switch (type) {
    case "COMPANY": {
      const where: Prisma.CompanyWhereInput = {
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...(countryFilter && { country: { code: countryFilter } }),
        ...(cityFilter && { city: { slug: cityFilter } }),
        ...(categoryFilter && { category: { slug: categoryFilter } }),
      };
      const [rows, total] = await Promise.all([
        prisma.company.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.company.count({ where }),
      ]);
      const overrides = await safeFindOverrides({
        targetType: "COMPANY",
        targetId: { in: rows.map((r) => r.id) },
      });
      const live = await Promise.all(
        rows.map((r) => getLiveSeoForTarget("COMPANY", r.id))
      );
      const items: SeoTargetItem[] = rows.map((r, idx) => {
        const liveData = live[idx];
        const o = overrides.find((x) => x.targetId === r.id);
        return {
          type: "COMPANY",
          id: r.id,
          name: r.name,
          path: liveData?.url || "",
          defaultTitle: liveData?.title || "",
          defaultDescription: liveData?.description || "",
          override: o
            ? {
                title: o.title,
                metaDescription: o.metaDescription,
                noindex: o.noindex,
              }
            : undefined,
        };
      });
      const filtered = items.filter((it) => {
        const hasOverride =
          !!it.override &&
          (it.override.title != null ||
            it.override.metaDescription != null ||
            it.override.noindex != null);
        if (status === "customized" && !hasOverride) return false;
        if (status === "default" && hasOverride) return false;
        if (noindexFilter !== "all") {
          const ni = !!it.override?.noindex;
          if (noindexFilter === "true" && !ni) return false;
          if (noindexFilter === "false" && ni) return false;
        }
        return true;
      });
      return {
        items: filtered,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    case "CATEGORY": {
      const where: Prisma.CategoryWhereInput = {
        ...(search && { name: { contains: search, mode: "insensitive" } }),
      };
      const [rows, total] = await Promise.all([
        prisma.category.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.category.count({ where }),
      ]);
      const overrides = await safeFindOverrides({
        targetType: "CATEGORY",
        targetId: { in: rows.map((r) => r.id) },
      });
      const live = await Promise.all(
        rows.map((r) => getLiveSeoForTarget("CATEGORY", r.id))
      );
      const items: SeoTargetItem[] = rows.map((r, idx) => {
        const liveData = live[idx];
        const o = overrides.find((x) => x.targetId === r.id);
        return {
          type: "CATEGORY",
          id: r.id,
          name: r.name,
          path: liveData?.url || "",
          defaultTitle: liveData?.title || "",
          defaultDescription: liveData?.description || "",
          override: o
            ? {
                title: o.title,
                metaDescription: o.metaDescription,
                noindex: o.noindex,
              }
            : undefined,
        };
      });
      const filtered = items.filter((it) => {
        const hasOverride =
          !!it.override &&
          (it.override.title != null ||
            it.override.metaDescription != null ||
            it.override.noindex != null);
        if (status === "customized" && !hasOverride) return false;
        if (status === "default" && hasOverride) return false;
        if (noindexFilter !== "all") {
          const ni = !!it.override?.noindex;
          if (noindexFilter === "true" && !ni) return false;
          if (noindexFilter === "false" && ni) return false;
        }
        return true;
      });
      return {
        items: filtered,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    case "SUBCATEGORY": {
      const where: Prisma.SubCategoryWhereInput = {
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...(subcategoryFilter && { slug: subcategoryFilter }),
        ...(categoryFilter && { category: { slug: categoryFilter } }),
      };
      const [rows, total] = await Promise.all([
        prisma.subCategory.findMany({
          where,
          include: { category: { select: { slug: true, name: true } } },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.subCategory.count({ where }),
      ]);
      const overrides = await safeFindOverrides({
        targetType: "SUBCATEGORY",
        targetId: { in: rows.map((r) => r.id) },
      });
      const live = await Promise.all(
        rows.map((r) => getLiveSeoForTarget("SUBCATEGORY", r.id))
      );
      const items: SeoTargetItem[] = rows.map((r, idx) => {
        const liveData = live[idx];
        const o = overrides.find((x) => x.targetId === r.id);
        return {
          type: "SUBCATEGORY",
          id: r.id,
          name: r.name,
          path: liveData?.url || "",
          defaultTitle: liveData?.title || "",
          defaultDescription: liveData?.description || "",
          override: o
            ? {
                title: o.title,
                metaDescription: o.metaDescription,
                noindex: o.noindex,
              }
            : undefined,
        };
      });
      const filtered = items.filter((it) => {
        const hasOverride =
          !!it.override &&
          (it.override.title != null ||
            it.override.metaDescription != null ||
            it.override.noindex != null);
        if (status === "customized" && !hasOverride) return false;
        if (status === "default" && hasOverride) return false;
        if (noindexFilter !== "all") {
          const ni = !!it.override?.noindex;
          if (noindexFilter === "true" && !ni) return false;
          if (noindexFilter === "false" && ni) return false;
        }
        return true;
      });
      return {
        items: filtered,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    case "COUNTRY": {
      const where: Prisma.CountryWhereInput = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        }),
      };
      const [rows, total] = await Promise.all([
        prisma.country.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.country.count({ where }),
      ]);
      const overrides = await safeFindOverrides({
        targetType: "COUNTRY",
        targetId: { in: rows.map((r) => r.id) },
      });
      const live = await Promise.all(
        rows.map((r) => getLiveSeoForTarget("COUNTRY", r.id))
      );
      const items: SeoTargetItem[] = rows.map((r, idx) => {
        const liveData = live[idx];
        const o = overrides.find((x) => x.targetId === r.id);
        return {
          type: "COUNTRY",
          id: r.id,
          name: r.name,
          path: liveData?.url || "",
          defaultTitle: liveData?.title || "",
          defaultDescription: liveData?.description || "",
          override: o
            ? {
                title: o.title,
                metaDescription: o.metaDescription,
                noindex: o.noindex,
              }
            : undefined,
        };
      });
      const filtered = items.filter((it) => {
        const hasOverride =
          !!it.override &&
          (it.override.title != null ||
            it.override.metaDescription != null ||
            it.override.noindex != null);
        if (status === "customized" && !hasOverride) return false;
        if (status === "default" && hasOverride) return false;
        if (noindexFilter !== "all") {
          const ni = !!it.override?.noindex;
          if (noindexFilter === "true" && !ni) return false;
          if (noindexFilter === "false" && ni) return false;
        }
        return true;
      });
      return {
        items: filtered,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    case "CITY": {
      const where: Prisma.CityWhereInput = {
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...(countryFilter && { country: { code: countryFilter } }),
      };
      const [rows, total] = await Promise.all([
        prisma.city.findMany({
          where,
          include: { country: { select: { code: true, name: true } } },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.city.count({ where }),
      ]);
      const overrides = await safeFindOverrides({
        targetType: "CITY",
        targetId: { in: rows.map((r) => r.id) },
      });
      const live = await Promise.all(
        rows.map((r) => getLiveSeoForTarget("CITY", r.id))
      );
      const items: SeoTargetItem[] = rows.map((r, idx) => {
        const liveData = live[idx];
        const o = overrides.find((x) => x.targetId === r.id);
        return {
          type: "CITY",
          id: r.id,
          name: r.name,
          path: liveData?.url || "",
          defaultTitle: liveData?.title || "",
          defaultDescription: liveData?.description || "",
          override: o
            ? {
                title: o.title,
                metaDescription: o.metaDescription,
                noindex: o.noindex,
              }
            : undefined,
        };
      });
      const filtered = items.filter((it) => {
        const hasOverride =
          !!it.override &&
          (it.override.title != null ||
            it.override.metaDescription != null ||
            it.override.noindex != null);
        if (status === "customized" && !hasOverride) return false;
        if (status === "default" && hasOverride) return false;
        if (noindexFilter !== "all") {
          const ni = !!it.override?.noindex;
          if (noindexFilter === "true" && !ni) return false;
          if (noindexFilter === "false" && ni) return false;
        }
        return true;
      });
      return {
        items: filtered,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    case "SUBAREA": {
      const where: Prisma.SubAreaWhereInput = {
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...(cityFilter && { city: { slug: cityFilter } }),
        ...(countryFilter && { city: { country: { code: countryFilter } } }),
        ...(subareaFilter && { slug: subareaFilter }),
      };
      const [rows, total] = await Promise.all([
        prisma.subArea.findMany({
          where,
          include: {
            city: {
              select: {
                slug: true,
                name: true,
                country: { select: { code: true, name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.subArea.count({ where }),
      ]);
      const overrides = await safeFindOverrides({
        targetType: "SUBAREA",
        targetId: { in: rows.map((r) => r.id) },
      });
      const live = await Promise.all(
        rows.map((r) => getLiveSeoForTarget("SUBAREA", r.id))
      );
      const items: SeoTargetItem[] = rows.map((r, idx) => {
        const liveData = live[idx];
        const o = overrides.find((x) => x.targetId === r.id);
        return {
          type: "SUBAREA",
          id: r.id,
          name: r.name,
          path: liveData?.url || "",
          defaultTitle: liveData?.title || "",
          defaultDescription: liveData?.description || "",
          override: o
            ? {
                title: o.title,
                metaDescription: o.metaDescription,
                noindex: o.noindex,
              }
            : undefined,
        };
      });
      const filtered = items.filter((it) => {
        const hasOverride =
          !!it.override &&
          (it.override.title != null ||
            it.override.metaDescription != null ||
            it.override.noindex != null);
        if (status === "customized" && !hasOverride) return false;
        if (status === "default" && hasOverride) return false;
        if (noindexFilter !== "all") {
          const ni = !!it.override?.noindex;
          if (noindexFilter === "true" && !ni) return false;
          if (noindexFilter === "false" && ni) return false;
        }
        return true;
      });
      return {
        items: filtered,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    case "RANKING_PAGE": {
      const where: Prisma.RankingPageWhereInput = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }),
      };
      const [rows, total] = await Promise.all([
        prisma.rankingPage.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.rankingPage.count({ where }),
      ]);
      const overrides = await safeFindOverrides({
        targetType: "RANKING_PAGE",
        targetId: { in: rows.map((r) => r.id) },
      });
      const live = await Promise.all(
        rows.map((r) => getLiveSeoForTarget("RANKING_PAGE", r.id))
      );
      const items: SeoTargetItem[] = rows.map((r, idx) => {
        const liveData = live[idx];
        const o = overrides.find((x) => x.targetId === r.id);
        return {
          type: "RANKING_PAGE",
          id: r.id,
          name: r.title,
          path: liveData?.url || "",
          defaultTitle: liveData?.title || "",
          defaultDescription: liveData?.description || "",
          override: o
            ? {
                title: o.title,
                metaDescription: o.metaDescription,
                noindex: o.noindex,
              }
            : undefined,
        };
      });
      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    default:
      return {
        items: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
  }
}

export async function listSeoOverrides(
  params: ListParams & { targetType?: SeoTargetTypeLocal } = {}
) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;
  const skip = (page - 1) * limit;
  const search = params.search?.trim();
  const filterType = (params as any).targetType as
    | SeoTargetTypeLocal
    | undefined;

  const where: any = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { metaDescription: { contains: search, mode: "insensitive" } },
        { path: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(filterType && { targetType: filterType }),
  };

  const delegate = (prisma as any).seoOverride;
  if (!delegate || typeof delegate.findMany !== "function") {
    return {
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }

  const [rows, total] = await Promise.all([
    delegate.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    safeCountOverrides(where),
  ]);

  return {
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getSeoOverride(input: {
  targetType?: SeoTargetTypeLocal;
  targetId?: string;
  path?: string;
}) {
  const { targetType, targetId, path } = input;
  if (path) {
    try {
      const delegate = (prisma as any).seoOverride;
      if (!delegate || typeof delegate.findUnique !== "function") return null;
      return await delegate.findUnique({ where: { path } });
    } catch {
      return null;
    }
  }
  if (targetType && targetId) {
    try {
      const delegate = (prisma as any).seoOverride;
      if (!delegate || typeof delegate.findFirst !== "function") return null;
      return await delegate.findFirst({ where: { targetType, targetId } });
    } catch {
      return null;
    }
  }
  return null;
}

export async function deleteSeoOverride(identifier: string): Promise<boolean> {
  try {
    const delegate = (prisma as any).seoOverride;
    if (!delegate || typeof delegate.findFirst !== "function") {
      console.error("جدول seoOverride غير متوفر");
      return false;
    }

    // Find the override first
    const override = await delegate.findFirst({
      where: {
        OR: [
          { id: identifier },
          { targetId: identifier },
          { path: identifier },
        ],
      },
    });

    if (!override) {
      console.error("التخصيص غير موجود:", identifier);
      return false;
    }

    // Delete the override
    await delegate.delete({
      where: { id: override.id },
    });

    return true;
  } catch (error) {
    console.error("خطأ في حذف SEO override:", error);
    return false;
  }
}

export async function upsertSeoOverride(data: {
  targetType?: SeoTargetTypeLocal;
  targetId?: string;
  path?: string;
  title?: string | null;
  metaDescription?: string | null;
  noindex?: boolean;
  updatedById?: string | null;
}) {
  const {
    targetType,
    targetId,
    path,
    title,
    metaDescription,
    noindex = false,
    updatedById,
  } = data;

  if (!path && (!targetType || !targetId)) {
    throw new Error(
      "Either path or (targetType and targetId) must be provided"
    );
  }

  if (path) {
    const delegate = (prisma as any).seoOverride;
    if (!delegate || typeof delegate.upsert !== "function") {
      // If delegate missing, simulate saved object
      return {
        path,
        title,
        metaDescription,
        noindex,
        targetType: "CUSTOM_PATH",
        updatedById,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return delegate.upsert({
      where: { path },
      create: {
        path,
        title,
        metaDescription,
        noindex,
        targetType: "CUSTOM_PATH",
        updatedById: updatedById || undefined,
      },
      update: {
        title,
        metaDescription,
        noindex,
        updatedById: updatedById || undefined,
      },
    });
  }

  const delegate = (prisma as any).seoOverride;
  if (!delegate) {
    return {
      targetType,
      targetId,
      title,
      metaDescription,
      noindex,
      updatedById,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  // Update by (targetType,targetId) if exists; else create
  let existing: any = null;
  try {
    if (typeof delegate.findFirst === "function") {
      existing = await delegate.findFirst({
        where: { targetType: targetType!, targetId: targetId! },
      });
    }
  } catch {}
  if (existing) {
    try {
      return await delegate.update({
        where: { id: existing.id },
        data: {
          title,
          metaDescription,
          noindex,
          updatedById: updatedById || undefined,
        },
      });
    } catch {
      return existing;
    }
  }
  try {
    return await delegate.create({
      data: {
        targetType: targetType!,
        targetId: targetId!,
        title,
        metaDescription,
        noindex,
        updatedById: updatedById || undefined,
      },
    });
  } catch {
    return {
      targetType,
      targetId,
      title,
      metaDescription,
      noindex,
      updatedById,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
