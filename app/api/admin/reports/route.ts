import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  try {
    const reports = await prisma.reviewReport.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        review: {
          include: {
            company: true,
          },
        },
      },
    });

    const totalReports = await prisma.reviewReport.count();

    return NextResponse.json({
      success: true,
      data: {
        reports,
        totalPages: Math.ceil(totalReports / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch reports' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, error: { message: 'Report ID is required' } }, { status: 400 });
    }

    try {
        await prisma.reviewReport.delete({
            where: { id },
        });
        return NextResponse.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        return NextResponse.json({ success: false, error: { message: 'Failed to delete report' } }, { status: 500 });
    }
}