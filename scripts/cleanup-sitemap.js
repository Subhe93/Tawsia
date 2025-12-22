
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 starting SITEMAP CLEANUP for inactive entities...\n');

    let disabledCount = 0;

    // 1. CLEANUP COMPANY entries where company is inactive or deleted
    // Prisma doesn't support joins in deleteMany easily, so we fetch active IDs first? 
    // Better: find entries where company is not active.

    // Method: Find invalid IDs chunk by chunk to avoid memory issues
    const invalidCompanies = await prisma.company.findMany({
        where: { isActive: false },
        select: { id: true }
    });

    if (invalidCompanies.length > 0) {
        const ids = invalidCompanies.map(c => c.id);
        const result = await prisma.sitemapEntry.updateMany({
            where: {
                companyId: { in: ids },
                isActive: true
            },
            data: { isActive: false }
        });
        console.log(`❌ Disabled ${result.count} entries for INACTIVE COMPANIES`);
        disabledCount += result.count;
    }

    // 2. CLEANUP CATEGORIES
    const invalidCats = await prisma.category.findMany({
        where: { isActive: false },
        select: { id: true }
    });
    if (invalidCats.length > 0) {
        const ids = invalidCats.map(c => c.id);
        const result = await prisma.sitemapEntry.updateMany({
            where: {
                categoryId: { in: ids },
                isActive: true
            },
            data: { isActive: false }
        });
        console.log(`❌ Disabled ${result.count} entries for INACTIVE CATEGORIES`);
        disabledCount += result.count;
    }

    // 3. CLEANUP CITIES (and their branches)
    const invalidCities = await prisma.city.findMany({
        where: { isActive: false },
        select: { id: true }
    });
    if (invalidCities.length > 0) {
        const ids = invalidCities.map(c => c.id);
        const result = await prisma.sitemapEntry.updateMany({
            where: {
                cityId: { in: ids },
                isActive: true
            },
            data: { isActive: false }
        });
        console.log(`❌ Disabled ${result.count} entries for INACTIVE CITIES`);
        disabledCount += result.count;
    }

    // 4. CLEANUP SUBAREAS
    const invalidSubAreas = await prisma.subArea.findMany({
        where: { isActive: false },
        select: { id: true }
    });
    if (invalidSubAreas.length > 0) {
        const ids = invalidSubAreas.map(c => c.id);
        const result = await prisma.sitemapEntry.updateMany({
            where: {
                subAreaId: { in: ids },
                isActive: true
            },
            data: { isActive: false }
        });
        console.log(`❌ Disabled ${result.count} entries for INACTIVE SUB-AREAS`);
        disabledCount += result.count;
    }

    // 5. Check Country
    const invalidCountries = await prisma.country.findMany({
        where: { isActive: false },
        select: { id: true }
    });
    if (invalidCountries.length > 0) {
        const ids = invalidCountries.map(c => c.id);
        const result = await prisma.sitemapEntry.updateMany({
            where: {
                countryId: { in: ids },
                isActive: true
            },
            data: { isActive: false }
        });
        console.log(`❌ Disabled ${result.count} entries for INACTIVE COUNTRIES`);
        disabledCount += result.count;
    }

    console.log(`\n✅ DONE! Total entries disabled: ${disabledCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
