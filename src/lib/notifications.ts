import { prisma } from "@/lib/prisma"
import { NotificationType } from "@/generated/prisma/enums"

type CreateNotificationParams = {
  userId: number
  type: NotificationType
  title: string
  message: string
  link?: string
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link
}: CreateNotificationParams) {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link: link || null
    }
  })
}

export async function createBulkNotifications(
  notifications: CreateNotificationParams[]
) {
  return await prisma.notification.createMany({
    data: notifications.map(n => ({
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link || null
    }))
  })
}