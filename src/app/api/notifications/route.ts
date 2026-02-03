import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET - Fetch user's notifications
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = Number(session.user.id)
    const searchParams = req.nextUrl.searchParams
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false })
      },
      orderBy: [
        { isRead: "asc" },
        { createdAt: "desc" }
      ],
      take: limit
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    })

    return NextResponse.json({
      notifications,
      unreadCount
    }, { status: 200 })
  } catch (err) {
    console.error("Notifications API error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH - Mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = Number(session.user.id)
    const body = await req.json()
    const { notificationIds, markAll } = body as {
      notificationIds?: number[]
      markAll?: boolean
    }

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({
        message: "All notifications marked as read"
      }, { status: 200 })
    }

    if (notificationIds && notificationIds.length > 0) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId // Ensure user owns these notifications
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({
        message: "Notifications marked as read"
      }, { status: 200 })
    }

    return NextResponse.json(
      { error: "No notification IDs provided" },
      { status: 400 }
    )
  } catch (err) {
    console.error("Notifications PATCH error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}