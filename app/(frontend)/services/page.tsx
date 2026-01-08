export const dynamic = "force-dynamic";
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { ServicesClientWrapper } from '@/components/services-client-wrapper';

export async function generateMetadata(): Promise<Metadata> {
  const { applySeoOverride } = await import('@/lib/seo/overrides');
  
  const overridden = await applySeoOverride({
    title: 'جميع الخدمات | توصية',
    description: 'اكتشف جميع الخدمات والمهن المتاحة في توصية'
  }, '/services', { targetType: 'CUSTOM_PATH', targetId: '/services' });

  return {
    title: overridden.title,
    description: overridden.description,
  };
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        icon: true,
        description: true,
        _count: {
          select: {
            companies: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return categories.map(cat => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      icon: cat.icon,
      description: cat.description,
      companiesCount: cat._count.companies
    }));
  } catch (error) {
    console.error('خطأ في جلب الفئات:', error);
    return [];
  }
}

async function getAllCountries() {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        flag: true,
      },
      orderBy: { name: 'asc' }
    });
    return countries;
  } catch (error) {
    console.error('خطأ في جلب الدول:', error);
    return [];
  }
}

export default async function ServicesPage() {
  const [categories, allCountries] = await Promise.all([
    getCategories(),
    getAllCountries()
  ]);

  return (
    <ServicesClientWrapper 
      initialCategories={categories}
      allCountries={allCountries}
    />
  );
}