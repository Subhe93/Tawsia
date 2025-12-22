
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.sitemapEntry.groupBy({
        by: ['entryType'],
        _count: {
            entryType: true
        }
    });

    console.log('Sitemap Entry Counts by Type:');
    result.forEach(r => {
        console.log(`${r.entryType}: ${r._count.entryType}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
