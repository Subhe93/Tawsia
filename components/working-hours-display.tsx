'use client';

import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DayOfWeek, DAYS_OF_WEEK_ARABIC, ALL_DAYS_OF_WEEK } from '@/lib/types/working-hours';

import { WorkingHour } from '@/lib/types/working-hours';

interface WorkingHoursDisplayProps {
  hours: any[];
  showCurrentStatus?: boolean;
}

function getCurrentDayStatus(hours: WorkingHour[]) {
  const now = new Date();
  const currentDay = now.getDay();
  const dayMapping = {
    0: DayOfWeek.SUNDAY,
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };

  const todaySchedule = hours.find(h => h.dayOfWeek === dayMapping[currentDay as keyof typeof dayMapping]);
  
  if (!todaySchedule || todaySchedule.isClosed) {
    return { status: 'closed', message: 'مغلق اليوم' };
  }

  const currentTime = now.toTimeString().slice(0, 5);
  if (todaySchedule.openTime && todaySchedule.closeTime) {
    if (currentTime >= todaySchedule.openTime && currentTime <= todaySchedule.closeTime) {
      return { status: 'open', message: 'مفتوح الآن' };
    }
  }

  return { status: 'closed', message: 'مغلق الآن' };
}

// دالة لتحويل البيانات إلى التنسيق الصحيح
function convertToWorkingHours(hours: any[]): WorkingHour[] {
  if (!hours || !Array.isArray(hours)) {
    return [];
  }
  
  return hours.map(hour => ({
    ...hour,
    dayOfWeek: typeof hour.dayOfWeek === 'string' && hour.dayOfWeek.toUpperCase() in DayOfWeek 
      ? hour.dayOfWeek.toUpperCase() as DayOfWeek
      : hour.dayOfWeek
  }));
}

export function WorkingHoursDisplay({ hours, showCurrentStatus = true }: WorkingHoursDisplayProps) {
  const convertedHours = convertToWorkingHours(hours);
  const hoursMap = Object.fromEntries(
    convertedHours.map(hour => [hour.dayOfWeek, hour])
  ) as Record<DayOfWeek, WorkingHour>;

  const currentStatus = showCurrentStatus ? getCurrentDayStatus(convertedHours) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            ساعات العمل
        </CardTitle>
        {showCurrentStatus && currentStatus && (
          <CardDescription>
            <Badge 
              variant={currentStatus.status === 'open' ? 'default' : 'destructive'}
              className="mt-2"
            >
              {currentStatus.message}
            </Badge>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {ALL_DAYS_OF_WEEK.map((day) => {
            const hours = hoursMap[day];
            const arabicDay = DAYS_OF_WEEK_ARABIC[day];
            
            return (
              <div 
                key={day} 
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <span className="font-medium">{arabicDay}</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {!hours ? (
                    <span className="text-gray-400">غير محدد</span>
                  ) : hours.isClosed ? (
                    <span className="text-red-500">مغلق</span>
                  ) : (
                    <span dir="ltr">
                      {hours.openTime || '00:00'} - {hours.closeTime || '00:00'}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}