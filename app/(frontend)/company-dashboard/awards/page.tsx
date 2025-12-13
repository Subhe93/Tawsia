import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Award, Calendar, Building, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'الجوائز والشهادات | لوحة تحكم الشركة',
  description: 'عرض جوائز وشهادات الشركة',
};

// نوع الجائزة
type AwardType = 'GOLD' | 'SILVER' | 'BRONZE' | 'CERTIFICATE';

// تحويل نوع الجائزة إلى العربية
const getAwardTypeLabel = (type: AwardType) => {
  switch (type) {
    case 'GOLD':
      return 'ذهبية';
    case 'SILVER':
      return 'فضية';
    case 'BRONZE':
      return 'برونزية';
    case 'CERTIFICATE':
      return 'شهادة';
    default:
      return 'غير محدد';
  }
};

// الحصول على لون الجائزة
const getAwardTypeColor = (type: AwardType) => {
  switch (type) {
    case 'GOLD':
      return 'bg-yellow-500 text-white';
    case 'SILVER':
      return 'bg-gray-400 text-white';
    case 'BRONZE':
      return 'bg-orange-600 text-white';
    case 'CERTIFICATE':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export default async function AwardsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // الحصول على الشركة التي يملكها المستخدم
  const companyOwner = await prisma.companyOwner.findFirst({
    where: {
      userId: session.user.id,
      isPrimary: true,
    },
    include: {
      company: {
        include: {
          awards: {
            where: { isActive: true },
            orderBy: { year: 'desc' }
          }
        }
      }
    }
  });

  if (!companyOwner) {
    redirect('/company-dashboard');
  }

  const { company } = companyOwner;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            الجوائز والشهادات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            عرض جوائز وشهادات {company.name}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  إجمالي الجوائز
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {company.awards.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400 fill-current" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  جوائز ذهبية
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {company.awards.filter(award => award.awardType === 'GOLD').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-gray-600 dark:text-gray-400 fill-current" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  جوائز فضية
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {company.awards.filter(award => award.awardType === 'SILVER').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  شهادات
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {company.awards.filter(award => award.awardType === 'CERTIFICATE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Awards List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            قائمة الجوائز والشهادات
          </h2>
          <Badge variant="outline" className="text-sm">
            {company.awards.length} جائزة
          </Badge>
        </div>

        {company.awards.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد جوائز أو شهادات
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                لم يتم إضافة أي جوائز أو شهادات لشركتك بعد
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  يمكن للمدير إضافة الجوائز والشهادات من لوحة تحكم المدير
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {company.awards.map((award) => (
              <Card key={award.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Badge className={getAwardTypeColor(award.awardType)}>
                        {getAwardTypeLabel(award.awardType)}
                      </Badge>
                      {award.year && (
                        <Badge variant="outline" className="text-xs">
                          {award.year}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{award.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {award.imageUrl && (
                    <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={award.imageUrl}
                        alt={award.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {award.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                      {award.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {award.issuer && (
                      <div className="flex items-center space-x-2 space-x-reverse text-sm">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {award.issuer}
                        </span>
                      </div>
                    )}
                    
                    {award.year && (
                      <div className="flex items-center space-x-2 space-x-reverse text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {award.year}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
