import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pendingReviews = await prisma.review.count({
      where: { isApproved: false },
    });
    const totalCompanies = await prisma.company.count();
    const totalUsers = await prisma.user.count();
    const pendingRequests = await prisma.companyRequest.count({
      where: { status: 'PENDING' },
    });
    const reportedReviews = await prisma.reviewReport.count({
      where: { status: 'PENDING' },
    });
    const notifications = await prisma.notification.count({
      where: { isRead: false },
    });
    const rankingPages = await prisma.rankingPage.count({
      where: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      pendingReviews,
      totalCompanies,
      totalUsers,
      pendingRequests,
      reportedReviews,
      notifications,
      rankingPages,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch dashboard stats' } },
      { status: 500 }
    );
  }
}