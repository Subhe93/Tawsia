import { PrismaClient } from '@prisma/client';
import { recalculateAllCompanyRatings } from '../lib/database/queries';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('بدء إعادة حساب تقييمات جميع الشركات...');
    
    const companiesCount = await recalculateAllCompanyRatings();
    
    console.log(`تم إعادة حساب تقييمات ${companiesCount} شركة بنجاح`);
    
    // عرض بعض الإحصائيات
    const stats = await prisma.company.aggregate({
      _avg: { rating: true },
      _count: { id: true },
      _sum: { reviewsCount: true }
    });
    
    console.log('الإحصائيات بعد إعادة الحساب:');
    console.log(`- متوسط التقييم العام: ${Math.round((stats._avg.rating || 0) * 10) / 10}`);
    console.log(`- إجمالي عدد الشركات: ${stats._count.id}`);
    console.log(`- إجمالي عدد المراجعات: ${stats._sum.reviewsCount}`);
    
  } catch (error) {
    console.error('خطأ في إعادة حساب التقييمات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
