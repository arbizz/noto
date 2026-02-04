import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ReportStatus, UserStatus } from "@/generated/prisma/enums"
import { NextRequest, NextResponse } from "next/server"
import { createNotification, createBulkNotifications } from "@/lib/notifications"

type ActionType = "set_reviewed" | "delete_content" | "reduce_score"
type PenaltyLevel = 1 | 2 | 3

const PENALTY_AMOUNTS = {
  1: 10,
  2: 15,
  3: 25
} as const

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const admin = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: { role: true }
    })

    if (admin?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    const { id } = await params
    const [contentType, contentIdStr] = id.split("-")
    const contentId = Number(contentIdStr)

    if (!["note", "flashcard"].includes(contentType) || isNaN(contentId)) {
      return NextResponse.json(
        { error: "Invalid content identifier" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { action, penaltyLevel } = body as {
      action: ActionType
      penaltyLevel?: PenaltyLevel
    }

    const reports = await prisma.report.findMany({
      where: {
        contentId: contentId,
        contentType: contentType as "note" | "flashcard"
      }
    })

    if (reports.length === 0) {
      return NextResponse.json(
        { error: "No reports found for this content" },
        { status: 404 }
      )
    }

    const content = await prisma.content.findUnique({
      where: {
        id: contentId,
        contentType: contentType as "note" | "flashcard"
      },
      select: { userId: true }
    })

    const contentOwnerId = content?.userId

    if (!contentOwnerId) {
      return NextResponse.json(
        { error: "Content or content owner not found" },
        { status: 404 }
      )
    }

    switch (action) {
      case "set_reviewed":
        await prisma.report.updateMany({
          where: {
            contentId: contentId,
            contentType: contentType as "note" | "flashcard"
          },
          data: {
            status: "reviewed"
          }
        })

        const reporterNotifications = reports.map(report => ({
          userId: report.userId,
          type: "report_reviewed" as const,
          title: "Report Under Review",
          message: `Your report for ${contentType === "note" ? "note" : "flashcard"} is being reviewed by admin.`,
          link: undefined
        }))

        await createBulkNotifications(reporterNotifications)

        return NextResponse.json(
          { 
            message: "All reports marked as reviewed",
            totalUpdated: reports.length
          },
          { status: 200 }
        )

      case "reduce_score":
        if (!penaltyLevel || ![1, 2, 3].includes(penaltyLevel)) {
          return NextResponse.json(
            { error: "Valid penalty level (1, 2, or 3) is required" },
            { status: 400 }
          )
        }

        const penaltyAmount = PENALTY_AMOUNTS[penaltyLevel]

        const contentOwner = await prisma.user.findUnique({
          where: { id: contentOwnerId },
          select: { score: true, status: true }
        })

        if (!contentOwner) {
          return NextResponse.json(
            { error: "Content owner not found" },
            { status: 404 }
          )
        }

        const newScore = Math.max(0, contentOwner.score - penaltyAmount)
        
        let newStatus: UserStatus = "active"
        if (newScore <= 15) {
          newStatus = "banned"
        } else if (newScore <= 30) {
          newStatus = "suspended"
        }

        const updatedUser = await prisma.user.update({
          where: { id: contentOwnerId },
          data: {
            score: newScore,
            status: newStatus
          },
          select: {
            id: true,
            name: true,
            email: true,
            score: true,
            status: true
          }
        })

        await prisma.report.updateMany({
          where: {
            contentId: contentId,
            contentType: contentType as "note" | "flashcard"
          },
          data: {
            status: "resolved"
          }
        })

        await createNotification({
          userId: contentOwnerId,
          type: "score_reduced",
          title: "Warning: Score Reduced",
          message: `Your score has been reduced by ${penaltyAmount} points due to content violation. Current score: ${newScore}.`,
          link: undefined
        })

        const resolvedNotifications = reports.map(report => ({
          userId: report.userId,
          type: "report_resolved" as const,
          title: "Report Resolved",
          message: `Thank you! Your report has been addressed by admin.`,
          link: undefined
        }))
        await createBulkNotifications(resolvedNotifications)

        return NextResponse.json(
          {
            message: `Penalty applied: -${penaltyAmount} points (Level ${penaltyLevel})`,
            user: updatedUser,
            previousScore: contentOwner.score,
            newScore,
            penaltyAmount,
            statusChanged: contentOwner.status !== newStatus,
            previousStatus: contentOwner.status,
            newStatus,
            totalReportsResolved: reports.length
          },
          { status: 200 }
        )

      case "delete_content":
        await prisma.report.updateMany({
          where: {
            contentId: contentId,
            contentType: contentType as "note" | "flashcard"
          },
          data: {
            status: "resolved"
          }
        })
        
        await prisma.content.delete({
          where: {
            id: contentId,
            contentType: contentType as "note" | "flashcard"
          }
        })

        await createNotification({
          userId: contentOwnerId,
          type: "content_deleted",
          title: "Content Deleted",
          message: `Your ${contentType === "note" ? "note" : "flashcard set"} has been deleted due to violation of terms.`,
          link: undefined
        })

        const deletedNotifications = reports.map(report => ({
          userId: report.userId,
          type: "report_resolved" as const,
          title: "Report Resolved",
          message: `The content you reported has been deleted. Thank you for your report!`,
          link: undefined
        }))
        await createBulkNotifications(deletedNotifications)

        return NextResponse.json(
          {
            message: `${contentType === "note" ? "Note" : "Flashcard set"} deleted successfully`,
            totalReportsResolved: reports.length
          },
          { status: 200 }
        )

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (err) {
    console.error("Report action API error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}