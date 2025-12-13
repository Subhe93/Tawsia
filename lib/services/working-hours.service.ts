import prisma from '@/lib/prisma'
import { 
  WorkingHour, 
  ensureCompleteWorkingHours, 
  normalizeWorkingHours,
  validateWorkingHours,
  createDefaultWorkingHours 
} from '@/lib/types/working-hours'

export class WorkingHoursService {
  /**
   * جلب ساعات العمل لشركة معينة
   */
  static async getWorkingHours(companyId: string): Promise<WorkingHour[]> {
    try {
      console.log('getWorkingHours called for company:', companyId)
      
      const workingHours = await prisma.workingHours.findMany({
        where: { companyId },
        orderBy: { dayOfWeek: 'asc' }
      })

      console.log('Raw working hours from database:', workingHours)

      // إذا لم تكن هناك ساعات عمل، إنشاء الافتراضية
      if (workingHours.length === 0) {
        console.log('No working hours found, creating defaults')
        return await this.createDefaultWorkingHours(companyId)
      }

      // تطبيع البيانات وضمان اكتمالها
      const normalizedHours = normalizeWorkingHours(workingHours)
      console.log('Normalized hours:', normalizedHours)
      
      const completeHours = ensureCompleteWorkingHours(normalizedHours, companyId)
      console.log('Complete hours:', completeHours)
      
      return completeHours
    } catch (error) {
      console.error('خطأ في جلب ساعات العمل:', error)
      throw new Error('فشل في جلب ساعات العمل')
    }
  }

  /**
   * تحديث ساعات العمل لشركة معينة
   */
  static async updateWorkingHours(companyId: string, workingHours: WorkingHour[]): Promise<WorkingHour[]> {
    try {
      console.log('WorkingHoursService.updateWorkingHours called with:', { companyId, workingHours })

      // التحقق من صحة البيانات
      const validation = validateWorkingHours(workingHours)
      if (!validation.isValid) {
        throw new Error(`بيانات ساعات العمل غير صحيحة: ${validation.errors.join(', ')}`)
      }

      // ضمان اكتمال البيانات
      const completeWorkingHours = ensureCompleteWorkingHours(workingHours, companyId)
      console.log('Complete working hours:', completeWorkingHours)

      // استخدام transaction لضمان اتساق البيانات
      const updatedHours = await prisma.$transaction(async (tx) => {
        const upsertPromises = completeWorkingHours.map(hours => 
          tx.workingHours.upsert({
            where: {
              companyId_dayOfWeek: {
                companyId,
                dayOfWeek: hours.dayOfWeek
              }
            },
            update: {
              openTime: hours.isClosed ? null : hours.openTime,
              closeTime: hours.isClosed ? null : hours.closeTime,
              isClosed: hours.isClosed
            },
            create: {
              companyId,
              dayOfWeek: hours.dayOfWeek,
              openTime: hours.isClosed ? null : hours.openTime,
              closeTime: hours.isClosed ? null : hours.closeTime,
              isClosed: hours.isClosed
            }
          })
        )

        await Promise.all(upsertPromises)

        // جلب البيانات المحدثة
        return await tx.workingHours.findMany({
          where: { companyId },
          orderBy: { dayOfWeek: 'asc' }
        })
      })

      console.log('Database updated hours:', updatedHours)
      const normalizedHours = normalizeWorkingHours(updatedHours)
      console.log('Normalized hours:', normalizedHours)

      return normalizedHours
    } catch (error) {
      console.error('خطأ في تحديث ساعات العمل:', error)
      throw error
    }
  }

  /**
   * إنشاء ساعات العمل الافتراضية لشركة جديدة
   */
  static async createDefaultWorkingHours(companyId: string): Promise<WorkingHour[]> {
    try {
      console.log('createDefaultWorkingHours called for company:', companyId)
      
      const defaultHours = createDefaultWorkingHours(companyId)
      console.log('Default hours created:', defaultHours)

      const createdHours = await prisma.workingHours.createMany({
        data: defaultHours.map(hours => ({
          companyId,
          dayOfWeek: hours.dayOfWeek,
          openTime: hours.openTime,
          closeTime: hours.closeTime,
          isClosed: hours.isClosed
        }))
      })

      console.log('Created hours in database:', createdHours)

      // جلب البيانات المحدثة
      const workingHours = await prisma.workingHours.findMany({
        where: { companyId },
        orderBy: { dayOfWeek: 'asc' }
      })

      console.log('Retrieved created hours:', workingHours)
      const normalizedHours = normalizeWorkingHours(workingHours)
      console.log('Normalized created hours:', normalizedHours)

      return normalizedHours
    } catch (error) {
      console.error('خطأ في إنشاء ساعات العمل الافتراضية:', error)
      throw new Error('فشل في إنشاء ساعات العمل الافتراضية')
    }
  }

  /**
   * حذف ساعات العمل لشركة معينة
   */
  static async deleteWorkingHours(companyId: string): Promise<void> {
    try {
      await prisma.workingHours.deleteMany({
        where: { companyId }
      })
    } catch (error) {
      console.error('خطأ في حذف ساعات العمل:', error)
      throw new Error('فشل في حذف ساعات العمل')
    }
  }

  /**
   * نسخ ساعات العمل من شركة إلى أخرى
   */
  static async copyWorkingHours(fromCompanyId: string, toCompanyId: string): Promise<WorkingHour[]> {
    try {
      const sourceHours = await this.getWorkingHours(fromCompanyId)
      
      // حذف الساعات الموجودة في الشركة الهدف
      await this.deleteWorkingHours(toCompanyId)
      
      // نسخ الساعات مع تحديث companyId
      const copiedHours = sourceHours.map(hours => ({
        ...hours,
        id: null,
        companyId: toCompanyId
      }))

      return await this.updateWorkingHours(toCompanyId, copiedHours)
    } catch (error) {
      console.error('خطأ في نسخ ساعات العمل:', error)
      throw new Error('فشل في نسخ ساعات العمل')
    }
  }

  /**
   * التحقق من وجود ساعات عمل لشركة معينة
   */
  static async hasWorkingHours(companyId: string): Promise<boolean> {
    try {
      const count = await prisma.workingHours.count({
        where: { companyId }
      })
      return count > 0
    } catch (error) {
      console.error('خطأ في التحقق من وجود ساعات العمل:', error)
      return false
    }
  }

  /**
   * جلب ساعات العمل لعدة شركات دفعة واحدة
   */
  static async getMultipleCompaniesWorkingHours(companyIds: string[]): Promise<Record<string, WorkingHour[]>> {
    try {
      const workingHours = await prisma.workingHours.findMany({
        where: {
          companyId: { in: companyIds }
        },
        orderBy: { dayOfWeek: 'asc' }
      })

      const result: Record<string, WorkingHour[]> = {}

      // تجميع الساعات حسب الشركة
      companyIds.forEach(companyId => {
        const companyHours = workingHours.filter(wh => wh.companyId === companyId)
        if (companyHours.length > 0) {
          const normalizedHours = normalizeWorkingHours(companyHours)
          result[companyId] = ensureCompleteWorkingHours(normalizedHours, companyId)
        } else {
          // إنشاء ساعات افتراضية إذا لم تكن موجودة
          result[companyId] = createDefaultWorkingHours(companyId)
        }
      })

      return result
    } catch (error) {
      console.error('خطأ في جلب ساعات العمل لعدة شركات:', error)
      throw new Error('فشل في جلب ساعات العمل لعدة شركات')
    }
  }
}
