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
    const { action, reason, duration } = body as {
      action: ActionType
      reason?: string
      duration?: number // days (for suspend)
    }

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
        // Cannot ban an already banned user
        if (targetUser.status === "banned") {
          return NextResponse.json({ error: "User is already banned" }, { status: 400 })
        }

        // Ban is permanent — suspendedUntil is null
        const updated = await prisma.user.update({
          where: { id: userId },
          data: {
            status: "banned",
            suspendedUntil: null
          },
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
        // Cannot suspend a banned user (downgrade) or already suspended user
        if (targetUser.status === "banned") {
          return NextResponse.json({ error: "Cannot suspend a banned user. Use activate first." }, { status: 400 })
        }
        if (targetUser.status === "suspended") {
          return NextResponse.json({ error: "User is already suspended" }, { status: 400 })
        }

        // Suspend with duration — default 7 days
        const suspendDays = duration && duration > 0 ? duration : 7
        const suspendedUntil = new Date()
        suspendedUntil.setDate(suspendedUntil.getDate() + suspendDays)

        const updated = await prisma.user.update({
          where: { id: userId },
          data: {
            status: "suspended",
            suspendedUntil
          },
          select: { id: true, name: true, email: true, status: true, suspendedUntil: true },
        })

        await createNotification({
          userId,
          type: "score_reduced",
          title: "Account Suspended",
          message: reason
            ? `Your account has been suspended for ${suspendDays} days. Reason: ${reason}`
            : `Your account has been suspended for ${suspendDays} days.`,
          link: undefined,
        })

        return NextResponse.json({
          message: `User suspended for ${suspendDays} days`,
          user: updated,
          suspendedUntil,
        })
      }

      case "activate": {
        // Activate — clear suspendedUntil
        const updated = await prisma.user.update({
          where: { id: userId },
          data: {
            status: "active",
            suspendedUntil: null
          },
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