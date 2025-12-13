
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [recentCompanies, recentReviews, recentUsers] = await Promise.all([
      prisma.company.findMany({
        where: { isActive: true },
        select: { name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.review.findMany({
        where: { isApproved: true },
        select: { title: true, userName: true, company: { select: { name: true } }, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.user.findMany({
        where: { isActive: true },
        select: { name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const recentActivity = [
      ...recentCompanies.map((company) => ({
        type: 'company' as const,
        title: `شركة جديدة: ${company.name}`,
        description: 'تم إضافة شركة جديدة إلى الدليل',
        date: company.createdAt.toISOString(),
      })),
      ...recentReviews.map((review) => ({
        type: 'review' as const,
        title: `مراجعة جديدة: ${review.title}`,
        description: `${review.userName} قام بمراجعة ${review.company.name}`,
        date: review.createdAt.toISOString(),
      })),
      ...recentUsers.map((user) => ({
        type: 'user' as const,
        title: `مستخدم جديد: ${user.name}`,
        description: 'انضم مستخدم جديد إلى المنصة',
        date: user.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return NextResponse.json(recentActivity);
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    return NextResponse.json({ message: 'Failed to fetch recent activity' }, { status: 500 });
  }
}
