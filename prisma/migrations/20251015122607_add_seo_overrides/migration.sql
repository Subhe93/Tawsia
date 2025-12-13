-- CreateEnum
CREATE TYPE "public"."SeoTargetType" AS ENUM ('COMPANY', 'CATEGORY', 'SUBCATEGORY', 'COUNTRY', 'CITY', 'SUBAREA', 'RANKING_PAGE', 'CUSTOM_PATH');

-- CreateTable
CREATE TABLE "public"."seo_overrides" (
    "id" TEXT NOT NULL,
    "targetType" "public"."SeoTargetType",
    "targetId" TEXT,
    "path" TEXT,
    "title" TEXT,
    "metaDescription" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seo_overrides_path_key" ON "public"."seo_overrides"("path");

-- CreateIndex
CREATE INDEX "seo_overrides_targetType_targetId_idx" ON "public"."seo_overrides"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "public"."seo_overrides" ADD CONSTRAINT "seo_overrides_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
