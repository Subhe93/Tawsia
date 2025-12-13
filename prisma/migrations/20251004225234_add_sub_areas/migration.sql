-- AlterTable
ALTER TABLE "public"."companies" ADD COLUMN     "subAreaId" TEXT;

-- CreateTable
CREATE TABLE "public"."sub_areas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "cityCode" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "companiesCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sub_areas_slug_key" ON "public"."sub_areas"("slug");

-- CreateIndex
CREATE INDEX "sub_areas_cityCode_idx" ON "public"."sub_areas"("cityCode");

-- CreateIndex
CREATE INDEX "sub_areas_countryCode_idx" ON "public"."sub_areas"("countryCode");

-- CreateIndex
CREATE INDEX "sub_areas_slug_idx" ON "public"."sub_areas"("slug");

-- CreateIndex
CREATE INDEX "companies_subAreaId_idx" ON "public"."companies"("subAreaId");

-- AddForeignKey
ALTER TABLE "public"."sub_areas" ADD CONSTRAINT "sub_areas_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_areas" ADD CONSTRAINT "sub_areas_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_subAreaId_fkey" FOREIGN KEY ("subAreaId") REFERENCES "public"."sub_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
