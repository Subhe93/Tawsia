
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = 'et-quibusdam-sed-vol';
  console.log(`Checking for category: ${slug}`);

  const category = await prisma.category.findUnique({
    where: { slug },
    include: { sitemapEntries: true }
  });

  if (!category) {
    console.log('❌ Category NOT found in database!');
    return;
  }

  console.log('✅ Category found:', { id: category.id, name: category.name, isActive: category.isActive });
  console.log('Sitemap Entries:', category.sitemapEntries.length);
  
  if (category.sitemapEntries.length > 0) {
    console.log(JSON.stringify(category.sitemapEntries, null, 2));
  } else {
    // Check if maybe it exists but not linked (shouldn't happen with correct logic)
    const entry = await prisma.sitemapEntry.findFirst({
        where: { slug: { contains: slug } }
    });
    console.log('Searching SitemapEntry by slug manually:', entry);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
