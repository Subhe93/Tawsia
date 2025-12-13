export interface WorkingHour {
  id?: string | null;
  dayOfWeek: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  companyId?: string;
}

export interface WorkingHoursFormatted {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export enum DayOfWeek {
  SUNDAY = "SUNDAY",
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
}

export const DAYS_OF_WEEK_ARABIC: Record<DayOfWeek, string> = {
  [DayOfWeek.SUNDAY]: "الأحد",
  [DayOfWeek.MONDAY]: "الاثنين",
  [DayOfWeek.TUESDAY]: "الثلاثاء",
  [DayOfWeek.WEDNESDAY]: "الأربعاء",
  [DayOfWeek.THURSDAY]: "الخميس",
  [DayOfWeek.FRIDAY]: "الجمعة",
  [DayOfWeek.SATURDAY]: "السبت",
};

export const ALL_DAYS_OF_WEEK = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

export const ALL_DAYS_OF_WEEK_ARABIC = [
  DAYS_OF_WEEK_ARABIC[DayOfWeek.SUNDAY],
  DAYS_OF_WEEK_ARABIC[DayOfWeek.MONDAY],
  DAYS_OF_WEEK_ARABIC[DayOfWeek.TUESDAY],
  DAYS_OF_WEEK_ARABIC[DayOfWeek.WEDNESDAY],
  DAYS_OF_WEEK_ARABIC[DayOfWeek.THURSDAY],
  DAYS_OF_WEEK_ARABIC[DayOfWeek.FRIDAY],
  DAYS_OF_WEEK_ARABIC[DayOfWeek.SATURDAY],
];

// Helper functions
export function createDefaultWorkingHours(companyId?: string): WorkingHour[] {
  console.log("createDefaultWorkingHours called with companyId:", companyId);

  const result = ALL_DAYS_OF_WEEK.map((dayOfWeek) => ({
    id: null,
    dayOfWeek,
    openTime: dayOfWeek === DayOfWeek.FRIDAY ? null : "09:00",
    closeTime: dayOfWeek === DayOfWeek.FRIDAY ? null : "17:00",
    isClosed: dayOfWeek === DayOfWeek.FRIDAY,
    companyId,
  }));

  console.log("createDefaultWorkingHours result:", result);
  return result;
}

export function ensureCompleteWorkingHours(
  workingHours: WorkingHour[],
  companyId?: string
): WorkingHour[] {
  console.log("ensureCompleteWorkingHours called with:", {
    workingHours,
    companyId,
  });

  // تحويل الأيام العربية إلى الإنجليزية أولاً
  const normalizedWorkingHours = workingHours.map((wh) => ({
    ...wh,
    dayOfWeek: convertDayToEnglish(wh.dayOfWeek),
  }));

  const existingDays = new Set(
    normalizedWorkingHours.map((wh) => wh.dayOfWeek)
  );
  console.log("Existing days:", existingDays);

  const result = ALL_DAYS_OF_WEEK.map((dayOfWeek) => {
    const existingDay = normalizedWorkingHours.find(
      (wh) => wh.dayOfWeek === dayOfWeek
    );
    if (existingDay) {
      return existingDay;
    } else {
      // Create default day if missing
      const defaultDay = {
        id: null,
        dayOfWeek,
        openTime: dayOfWeek === DayOfWeek.FRIDAY ? null : "09:00",
        closeTime: dayOfWeek === DayOfWeek.FRIDAY ? null : "17:00",
        isClosed: dayOfWeek === DayOfWeek.FRIDAY,
        companyId,
      };
      console.log("Created default day for:", dayOfWeek, defaultDay);
      return defaultDay;
    }
  });

  console.log("Complete working hours result:", result);
  return result;
}

// دالة مساعدة لتحويل اليوم من العربية إلى الإنجليزية
function convertDayToEnglish(arabicDay: string): DayOfWeek {
  const dayMapping: Record<string, DayOfWeek> = {
    الأحد: DayOfWeek.SUNDAY,
    الاثنين: DayOfWeek.MONDAY,
    الثلاثاء: DayOfWeek.TUESDAY,
    الأربعاء: DayOfWeek.WEDNESDAY,
    الخميس: DayOfWeek.THURSDAY,
    الجمعة: DayOfWeek.FRIDAY,
    السبت: DayOfWeek.SATURDAY,
    // إضافة التحويل من الأحرف الصغيرة
    sunday: DayOfWeek.SUNDAY,
    monday: DayOfWeek.MONDAY,
    tuesday: DayOfWeek.TUESDAY,
    wednesday: DayOfWeek.WEDNESDAY,
    thursday: DayOfWeek.THURSDAY,
    friday: DayOfWeek.FRIDAY,
    saturday: DayOfWeek.SATURDAY,
  };

  // إذا كان اليوم بالفعل من نوع DayOfWeek
  if (Object.values(DayOfWeek).includes(arabicDay as DayOfWeek)) {
    return arabicDay as DayOfWeek;
  }

  // البحث في الخريطة (بغض النظر عن حالة الأحرف)
  const normalizedDay = arabicDay.toLowerCase();
  return dayMapping[normalizedDay] || dayMapping[arabicDay] || DayOfWeek.SUNDAY;
}

export function formatWorkingHoursForDisplay(
  workingHours: WorkingHour[]
): WorkingHoursFormatted {
  console.log("formatWorkingHoursForDisplay called with:", workingHours);

  // Ensure complete working hours before formatting
  const completeWorkingHours = ensureCompleteWorkingHours(workingHours);
  console.log("Complete working hours for display:", completeWorkingHours);

  const result = completeWorkingHours.reduce((acc, wh) => {
    acc[DAYS_OF_WEEK_ARABIC[wh.dayOfWeek as keyof typeof DAYS_OF_WEEK_ARABIC]] =
      {
        open: wh.openTime || "",
        close: wh.closeTime || "",
        closed: wh.isClosed,
      };
    return acc;
  }, {} as WorkingHoursFormatted);

  console.log("Formatted working hours:", result);
  return result;
}

export function getCurrentDayStatus(workingHours: WorkingHour[]) {
  console.log("getCurrentDayStatus called with:", workingHours);

  if (!workingHours || workingHours.length === 0) {
    return { status: "closed", message: "لم يتم تحديد ساعات العمل" };
  }

  const now = new Date();
  const currentDay = now.getDay();
  const dayKeys = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];

  console.log("Current day:", currentDay, "dayKeys:", dayKeys);

  // Ensure complete working hours
  const completeWorkingHours = ensureCompleteWorkingHours(workingHours);
  const todaySchedule = completeWorkingHours.find(
    (day) => day.dayOfWeek === dayKeys[currentDay]
  );

  console.log("Today schedule:", todaySchedule);

  if (!todaySchedule || todaySchedule.isClosed) {
    return { status: "closed", message: "مغلق اليوم" };
  }

  const currentTime = now.toTimeString().slice(0, 5);
  console.log(
    "Current time:",
    currentTime,
    "openTime:",
    todaySchedule.openTime,
    "closeTime:",
    todaySchedule.closeTime
  );

  if (
    todaySchedule.openTime &&
    todaySchedule.closeTime &&
    currentTime >= todaySchedule.openTime &&
    currentTime <= todaySchedule.closeTime
  ) {
    return { status: "open", message: "مفتوح الآن" };
  }

  return { status: "closed", message: "مغلق الآن" };
}

// New function to validate working hours
export function validateWorkingHours(workingHours: WorkingHour[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  console.log("Validating working hours:", workingHours); // للتأكد من البيانات

  // تحويل الأيام العربية إلى الإنجليزية أولاً
  const normalizedWorkingHours = workingHours.map((wh) => ({
    ...wh,
    dayOfWeek: convertDayToEnglish(wh.dayOfWeek),
  }));

  // التحقق من البيانات الأصلية أولاً
  normalizedWorkingHours.forEach((day) => {
    console.log(
      "Validating day:",
      day.dayOfWeek,
      "isClosed:",
      day.isClosed,
      "openTime:",
      day.openTime,
      "closeTime:",
      day.closeTime
    );

    const dayName =
      DAYS_OF_WEEK_ARABIC[day.dayOfWeek as keyof typeof DAYS_OF_WEEK_ARABIC] ||
      day.dayOfWeek;

    if (!day.isClosed) {
      // التحقق من وجود الأوقات
      if (!day.openTime) {
        errors.push(`وقت الفتح مطلوب ليوم ${dayName}`);
      }
      if (!day.closeTime) {
        errors.push(`وقت الإغلاق مطلوب ليوم ${dayName}`);
      }

      if (day.openTime && day.closeTime) {
        // التحقق من تنسيق الوقت
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(day.openTime)) {
          errors.push(
            `تنسيق وقت الفتح غير صحيح ليوم ${dayName}. يجب أن يكون بتنسيق HH:MM`
          );
        }
        if (!timeRegex.test(day.closeTime)) {
          errors.push(
            `تنسيق وقت الإغلاق غير صحيح ليوم ${dayName}. يجب أن يكون بتنسيق HH:MM`
          );
        }

        // التحقق من ترتيب الأوقات
        if (day.openTime >= day.closeTime) {
          errors.push(`وقت الفتح يجب أن يكون قبل وقت الإغلاق ليوم ${dayName}`);
        }

        // التحقق من معقولية الأوقات
        const [openHour] = day.openTime.split(":").map(Number);
        if (openHour < 5) {
          errors.push(
            `وقت الفتح ${day.openTime} غير معتاد ليوم ${dayName}. يجب أن يكون بعد الساعة 5 صباحاً`
          );
        }
      }
    } else {
      // التأكد من أن الأوقات null عندما يكون اليوم مغلقاً
      if (day.openTime !== null || day.closeTime !== null) {
        errors.push(`يجب أن تكون الأوقات فارغة عندما يكون ${dayName} مغلقاً`);
      }
    }
  });

  console.log("Validation errors:", errors); // للتأكد من الأخطاء
  console.log("Validation result:", { isValid: errors.length === 0, errors });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Function to normalize working hours from database
export function normalizeWorkingHours(workingHours: any[]): WorkingHour[] {
  console.log("normalizeWorkingHours called with:", workingHours);

  const result = workingHours.map((wh) => ({
    id: wh.id || null,
    dayOfWeek: convertDayToEnglish(wh.dayOfWeek),
    openTime: wh.openTime || null,
    closeTime: wh.closeTime || null,
    isClosed: wh.isClosed || false,
    companyId: wh.companyId,
  }));

  console.log("normalizeWorkingHours result:", result);
  return result;
}
