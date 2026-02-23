import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { createNotification } from "@/lib/notifications"

type ActionType = "ban" | "suspend" | "activate"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: { role: true },
    })

    if (admin?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const userId = Number(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Prevent admin from modifying themselves
    if (userId === Number(session.user.id)) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 })
    }

    const body = await req.json()
    const { action, reason } = body as { action: ActionType; reason?: string }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, status: true, role: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (targetUser.role === "admin") {
      return NextResponse.json({ error: "Cannot modify admin accounts" }, { status: 400 })
    }

    switch (action) {
      case "ban": {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { status: "banned" },
          select: { id: true, name: true, email: true, status: true },
        })

        await createNotification({
          userId,
          type: "score_reduced",
          title: "Account Banned",
          message: reason
            ? `Your account has been banned. Reason: ${reason}`
            : "Your account has been banned due to repeated violations.",
          link: undefined,
        })

        return NextResponse.json({
          message: "User banned successfully",
          user: updated,
        })
      }

      case "suspend": {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { status: "suspended" },
          select: { id: true, name: true, email: true, status: true },
        })

        await createNotification({
          userId,
          type: "score_reduced",
          title: "Account Suspended",
          message: reason
            ? `Your account has been suspended. Reason: ${reason}`
            : "Your account has been suspended temporarily.",
          link: undefined,
        })

        return NextResponse.json({
          message: "User suspended successfully",
          user: updated,
        })
      }

      case "activate": {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { status: "active" },
          select: { id: true, name: true, email: true, status: true },
        })

        await createNotification({
          userId,
          type: "report_resolved",
          title: "Account Activated",
          message: "Your account has been reactivated. Welcome back!",
          link: undefined,
        })

        return NextResponse.json({
          message: "User activated successfully",
          user: updated,
        })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (err) {
    console.error("User action API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}