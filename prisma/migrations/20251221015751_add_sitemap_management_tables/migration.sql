-- CreateEnum
CREATE TYPE "public"."SitemapEntryType" AS ENUM ('STATIC', 'COMPANY', 'COUNTRY', 'CITY', 'SUBAREA', 'CATEGORY', 'CATEGORY_SUB', 'COUNTRY_CATEGORY', 'COUNTRY_CATEGORY_SUB', 'CITY_CATEGORY', 'CITY_CATEGORY_SUB', 'SUBAREA_CATEGORY', 'SUBAREA_CATEGORY_SUB');

-- CreateEnum
CREATE TYPE "public"."SitemapFileType" AS ENUM ('INDEX', 'STATIC', 'COMPANIES', 'LOCATIONS', 'CATEGORIES_SIMPLE', 'CATEGORIES_MIXED');

-- CreateEnum
CREATE TYPE "public"."SitemapAddMethod" AS ENUM ('BY_ID_RANGE', 'TOP_RATED', 'NEWEST_FIRST', 'OLDEST_FIRST', 'BY_CATEGORY', 'BY_CITY', 'RANDOM', 'MANUAL', 'AUTO_GENERATED');

-- CreateEnum
CREATE TYPE "public"."SitemapBatchStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'ROLLED_BACK');

-- CreateTable
CREATE TABLE "public"."sitemap_entries" (
    "id" TEXT NOT NULL,
    "entryType" "public"."SitemapEntryType" NOT NULL,
    "companyId" TEXT,
    "countryId" TEXT,
    "cityId" TEXT,
    "subAreaId" TEXT,
    "categoryId" TEXT,
    "subCategoryId" TEXT,
    "slug" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "priority" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "changeFrequency" TEXT NOT NULL DEFAULT 'monthly',
    "sitemapFile" TEXT NOT NULL,
    "fileIndex" INTEGER,
    "positionInFile" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT,
    "batchNumber" INTEGER,
    "addMethod" "public"."SitemapAddMethod",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "needsUpdate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sitemap_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sitemap_files" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" "public"."SitemapFileType" NOT NULL,
    "fileIndex" INTEGER,
    "urlsCount" INTEGER NOT NULL DEFAULT 0,
    "maxCapacity" INTEGER NOT NULL DEFAULT 10000,
    "isFull" BOOLEAN NOT NULL DEFAULT false,
    "fileSize" BIGINT NOT NULL DEFAULT 0,
    "lastGenerated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "needsRebuild" BOOLEAN NOT NULL DEFAULT false,
    "generationTime" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sitemap_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sitemap_batches" (
    "id" TEXT NOT NULL,
    "batchNumber" SERIAL NOT NULL,
    "companiesCount" INTEGER NOT NULL,
    "method" "public"."SitemapAddMethod" NOT NULL,
    "methodParams" JSONB,
    "filters" JSONB,
    "affectedFiles" TEXT[],
    "distributionMap" JSONB,
    "addedBy" TEXT NOT NULL,
    "addedByName" TEXT NOT NULL,
    "status" "public"."SitemapBatchStatus" NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "sitemap_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sitemap_config" (
    "id" TEXT NOT NULL,
    "companiesPerFile" INTEGER NOT NULL DEFAULT 10000,
    "maxFilesCount" INTEGER NOT NULL DEFAULT 50,
    "enableCompression" BOOLEAN NOT NULL DEFAULT true,
    "enableCaching" BOOLEAN NOT NULL DEFAULT true,
    "cacheTimeout" INTEGER NOT NULL DEFAULT 3600,
    "autoRebuild" BOOLEAN NOT NULL DEFAULT false,
    "rebuildSchedule" TEXT,
    "totalUrls" INTEGER NOT NULL DEFAULT 0,
    "totalFiles" INTEGER NOT NULL DEFAULT 0,
    "lastFullRebuild" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sitemap_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sitemap_entries_url_key" ON "public"."sitemap_entries"("url");

-- CreateIndex
CREATE INDEX "sitemap_entries_entryType_idx" ON "public"."sitemap_entries"("entryType");

-- CreateIndex
CREATE INDEX "sitemap_entries_sitemapFile_idx" ON "public"."sitemap_entries"("sitemapFile");

-- CreateIndex
CREATE INDEX "sitemap_entries_fileIndex_idx" ON "public"."sitemap_entries"("fileIndex");

-- CreateIndex
CREATE INDEX "sitemap_entries_isActive_idx" ON "public"."sitemap_entries"("isActive");

-- CreateIndex
CREATE INDEX "sitemap_entries_companyId_idx" ON "public"."sitemap_entries"("companyId");

-- CreateIndex
CREATE INDEX "sitemap_entries_addedAt_idx" ON "public"."sitemap_entries"("addedAt");

-- CreateIndex
CREATE INDEX "sitemap_entries_batchNumber_idx" ON "public"."sitemap_entries"("batchNumber");

-- CreateIndex
CREATE INDEX "sitemap_entries_needsUpdate_idx" ON "public"."sitemap_entries"("needsUpdate");

-- CreateIndex
CREATE UNIQUE INDEX "sitemap_files_fileName_key" ON "public"."sitemap_files"("fileName");

-- CreateIndex
CREATE INDEX "sitemap_files_fileType_idx" ON "public"."sitemap_files"("fileType");

-- CreateIndex
CREATE INDEX "sitemap_files_fileIndex_idx" ON "public"."sitemap_files"("fileIndex");

-- CreateIndex
CREATE INDEX "sitemap_files_isFull_idx" ON "public"."sitemap_files"("isFull");

-- CreateIndex
CREATE INDEX "sitemap_files_needsRebuild_idx" ON "public"."sitemap_files"("needsRebuild");

-- CreateIndex
CREATE UNIQUE INDEX "sitemap_batches_batchNumber_key" ON "public"."sitemap_batches"("batchNumber");

-- CreateIndex
CREATE INDEX "sitemap_batches_batchNumber_idx" ON "public"."sitemap_batches"("batchNumber");

-- CreateIndex
CREATE INDEX "sitemap_batches_status_idx" ON "public"."sitemap_batches"("status");

-- CreateIndex
CREATE INDEX "sitemap_batches_createdAt_idx" ON "public"."sitemap_batches"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."sitemap_entries" ADD CONSTRAINT "sitemap_entries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sitemap_entries" ADD CONSTRAINT "sitemap_entries_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sitemap_entries" ADD CONSTRAINT "sitemap_entries_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sitemap_entries" ADD CONSTRAINT "sitemap_entries_subAreaId_fkey" FOREIGN KEY ("subAreaId") REFERENCES "public"."sub_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sitemap_entries" ADD CONSTRAINT "sitemap_entries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sitemap_entries" ADD CONSTRAINT "sitemap_entries_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "public"."sub_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
