export const dynamic = "force-dynamic";
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { ServicesCategories } from '@/components/services-categories';
import { Grid3X3 } from 'lucide-react';

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

export default async function ServicesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-yellow rounded-2xl p-8 text-white mb-12">
        <div className="flex items-center space-x-4 space-x-reverse mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Grid3X3 className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">جميع الخدمات والمهن</h1>
        </div>
        
        <p className="text-xl text-white/90 max-w-2xl">
          اكتشف جميع الخدمات والمهن المتاحة في منطقتك
        </p>
      </div>
      
      <ServicesCategories categories={categories} />
    </div>
  );
}