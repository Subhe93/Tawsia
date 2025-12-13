'use client';

import { useState, useEffect } from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DayOfWeek, DAYS_OF_WEEK_ARABIC, ALL_DAYS_OF_WEEK } from '@/lib/types/working-hours';

interface WorkingHoursEditorProps {
  initialHours?: any[];
  onSave: (hours: WorkingHourData[]) => Promise<void>;
  isLoading?: boolean;
}

export interface WorkingHourData {
  dayOfWeek: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

// دالة لتحويل البيانات إلى التنسيق الصحيح
function convertToWorkingHourData(hours: any[]): WorkingHourData[] {
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

export function WorkingHoursEditor({ initialHours, onSave, isLoading = false }: WorkingHoursEditorProps) {
  const [workingHours, setWorkingHours] = useState<Record<DayOfWeek, WorkingHourData>>(() => {
    const defaultHours = Object.fromEntries(
      ALL_DAYS_OF_WEEK.map(day => [
        day,
        {
          dayOfWeek: day,
          openTime: day === DayOfWeek.FRIDAY ? null : "09:00",
          closeTime: day === DayOfWeek.FRIDAY ? null : "17:00",
          isClosed: day === DayOfWeek.FRIDAY
        }
      ])
    ) as Record<DayOfWeek, WorkingHourData>;

    if (initialHours) {
      const convertedHours = convertToWorkingHourData(initialHours);
      convertedHours.forEach(hour => {
        defaultHours[hour.dayOfWeek] = hour;
      });
    }

    return defaultHours;
  });

  const validateHours = (): string[] => {
    const errors: string[] = [];

    Object.values(workingHours).forEach(day => {
      const dayName = DAYS_OF_WEEK_ARABIC[day.dayOfWeek];

      if (!day.isClosed) {
        if (!day.openTime) {
          errors.push(`وقت الفتح مطلوب ليوم ${dayName}`);
        }
        if (!day.closeTime) {
          errors.push(`وقت الإغلاق مطلوب ليوم ${dayName}`);
        }
        if (day.openTime && day.closeTime && day.openTime >= day.closeTime) {
          errors.push(`وقت الفتح يجب أن يكون قبل وقت الإغلاق ليوم ${dayName}`);
        }
        if (day.openTime) {
          const [openHour] = day.openTime.split(":").map(Number);
          if (openHour < 5) {
            errors.push(`وقت الفتح ${day.openTime} غير معتاد ليوم ${dayName}. يجب أن يكون بعد الساعة 5 صباحاً`);
          }
        }
      }
    });

    return errors;
  };

  const handleSave = async () => {
    console.log("handleSave called with workingHours:", workingHours);
    
    const errors = validateHours();
    console.log("Validation errors:", errors);
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      const hoursArray = Object.values(workingHours);
      console.log("Sending hours array:", hoursArray);
      
      await onSave(hoursArray);
      toast.success("تم حفظ ساعات العمل بنجاح");
    } catch (error) {
      console.error("خطأ في حفظ ساعات العمل:", error);
      toast.error("حدث خطأ في حفظ ساعات العمل");
    }
  };

  const updateDay = (day: DayOfWeek, updates: Partial<WorkingHourData>) => {
    console.log(`updateDay called for ${day} with updates:`, updates);
    
    setWorkingHours(prev => {
      const updatedDay = {
        ...prev[day],
        ...updates
      };

      // إذا تم تحديد اليوم كمغلق، نجعل الأوقات null
      if (updates.isClosed === true) {
        updatedDay.openTime = null;
        updatedDay.closeTime = null;
      }

      console.log(`Updated day ${day}:`, updatedDay);

      return {
        ...prev,
        [day]: updatedDay
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* أيام الأسبوع */}
      <div className="space-y-4">
        {ALL_DAYS_OF_WEEK.map((day) => {
          const hours = workingHours[day];
          const arabicDay = DAYS_OF_WEEK_ARABIC[day];
          
          return (
            <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-24 font-medium">{arabicDay}</div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`closed-${day}`}
                  checked={hours.isClosed}
                  onCheckedChange={(checked) => {
                    updateDay(day, { isClosed: checked as boolean });
                  }}
                />
                <Label htmlFor={`closed-${day}`}>مغلق</Label>
              </div>

              {!hours.isClosed && (
                <>
                  <div className="flex items-center gap-2">
                    <Label>من:</Label>
                    <Input
                      type="time"
                      value={hours.openTime || ""}
                      onChange={(e) => updateDay(day, { openTime: e.target.value })}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label>إلى:</Label>
                    <Input
                      type="time"
                      value={hours.closeTime || ""}
                      onChange={(e) => updateDay(day, { closeTime: e.target.value })}
                      className="w-32"
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* زر الحفظ */}
      <Button 
        onClick={handleSave}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "جاري الحفظ..." : "حفظ ساعات العمل"}
      </Button>
    </div>
  );
}
