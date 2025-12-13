import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminAwardsPageClient } from '@/components/admin/admin-awards-page-client';

export const metadata: Metadata = {
  title: 'إدارة الجوائز والشهادات | لوحة تحكم المدير',
  description: 'إدارة جوائز وشهادات جميع الشركات',
};

export default async function AdminAwardsPage({
  searchParams,
}: {
  searchParams: { company?: string; type?: string; page?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/auth/signin');
  }

  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  // بناء شروط البحث
  const where: any = {
    isActive: true,
  };

  if (searchParams.company) {
    where.company = {
      name: {
        contains: searchParams.company,
        mode: 'insensitive',
      },
    };
  }

  if (searchParams.type && searchParams.type !== 'ALL') {
    where.awardType = searchParams.type;
  }

  // جلب الجوائز مع معلومات الشركة
  const [awards, total] = await Promise.all([
    prisma.award.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: {
              select: {
                name: true,
              },
            },
            country: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.award.count({ where }),
  ]);

  // جلب جميع الشركات للفلتر
  const companies = await prisma.company.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminAwardsPageClient
      awards={awards}
      companies={companies}
      total={total}
      totalPages={totalPages}
      currentPage={page}
    />
  );
}
