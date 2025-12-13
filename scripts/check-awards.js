import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAwards() {
  try {
    console.log('جاري فحص الجوائز في قاعدة البيانات...');
    
    // فحص جميع الجوائز
    const allAwards = await prisma.award.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
    
    console.log(`إجمالي عدد الجوائز: ${allAwards.length}`);
    
    if (allAwards.length > 0) {
      console.log('الجوائز الموجودة:');
      allAwards.forEach((award, index) => {
        console.log(`${index + 1}. ${award.title} - ${award.company.name} (${award.awardType})`);
      });
    } else {
      console.log('لا توجد جوائز في قاعدة البيانات');
    }
    
    // فحص الشركات التي لديها جوائز
    const companiesWithAwards = await prisma.company.findMany({
      where: {
        awards: {
          some: {
            isActive: true
          }
        }
      },
      include: {
        awards: {
          where: { isActive: true }
        }
      }
    });
    
    console.log(`\nالشركات التي لديها جوائز: ${companiesWithAwards.length}`);
    companiesWithAwards.forEach(company => {
      console.log(`- ${company.name}: ${company.awards.length} جائزة`);
    });
    
  } catch (error) {
    console.error('خطأ في فحص الجوائز:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAwards();
