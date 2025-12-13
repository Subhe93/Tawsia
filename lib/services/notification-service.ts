import { prisma } from '@/lib/prisma'

export interface CreateNotificationData {
  type: 'review' | 'message' | 'system' | 'award'
  title: string
  message: string
  companyId: string
  userId?: string
  data?: Record<string, any>
}

export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        companyId: data.companyId,
        userId: data.userId,
        data: data.data,
        isRead: false
      }
    })

    return notification
  } catch (error) {
    console.error('خطأ في إنشاء الإشعار:', error)
    throw error
  }
}

// إنشاء إشعار عند إضافة مراجعة جديدة
export async function createReviewNotification(reviewId: string, companyId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: { select: { name: true } },
      company: { select: { name: true } }
    }
  })

  if (!review) return

  await createNotification({
    type: 'review',
    title: 'مراجعة جديدة',
    message: `تم إضافة مراجعة جديدة من ${review.user.name} لشركة ${review.company.name}`,
    companyId,
    data: { reviewId }
  })
}

// إنشاء إشعار عند الرد على مراجعة
export async function createReviewReplyNotification(replyId: string, companyId: string) {
  const reply = await prisma.reviewReply.findUnique({
    where: { id: replyId },
    include: {
      user: { select: { name: true } },
      review: {
        include: {
          user: { select: { name: true } },
          company: { select: { name: true } }
        }
      }
    }
  })

  if (!reply) return

  await createNotification({
    type: 'message',
    title: 'رد على مراجعة',
    message: `تم الرد على مراجعة من ${reply.review.user.name} بواسطة ${reply.user.name}`,
    companyId,
    userId: reply.review.userId,
    data: { replyId, reviewId: reply.reviewId }
  })
}

// إنشاء إشعار نظام
export async function createSystemNotification(
  companyId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  await createNotification({
    type: 'system',
    title,
    message,
    companyId,
    data
  })
}

// إنشاء إشعار جائزة
export async function createAwardNotification(
  companyId: string,
  awardName: string,
  message: string
) {
  await createNotification({
    type: 'award',
    title: `جائزة جديدة: ${awardName}`,
    message,
    companyId,
    data: { awardName }
  })
}
