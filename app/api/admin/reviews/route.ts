import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;
  const searchTerm = searchParams.get('searchTerm') || '';
  const statusFilter = searchParams.get('statusFilter');
  const ratingFilter = searchParams.get('ratingFilter');

  const where: any = {};

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { comment: { contains: searchTerm, mode: 'insensitive' } },
      { company: { name: { contains: searchTerm, mode: 'insensitive' } } },
    ];
  }

  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'approved') {
      where.isApproved = true;
    } else if (statusFilter === 'pending') {
      where.isApproved = false;
    }
  }

  if (ratingFilter && ratingFilter !== 'all') {
    where.rating = parseInt(ratingFilter, 10);
  }

  try {
    const reviews = await prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        company: true,
        user: true,
        images: true,
      },
    });

    const totalReviews = await prisma.review.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        totalPages: Math.ceil(totalReviews / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch reviews' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, error: { message: 'Review ID is required' } }, { status: 400 });
    }

    try {
        await prisma.review.delete({
            where: { id },
        });
        return NextResponse.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ success: false, error: { message: 'Failed to delete review' } }, { status: 500 });
    }
}