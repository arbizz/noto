import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ReportStatus, UserStatus } from "@/generated/prisma/enums"
import { NextRequest, NextResponse } from "next/server"
import { createNotification, createBulkNotifications } from "@/lib/notifications"

type ActionType = "set_reviewed" | "delete_content" | "reduce_score"
type PenaltyLevel = 1 | 2 | 3

const PENALTY_AMOUNTS = {
  1: 10,  // Minor violation
  2: 15,  // Moderate violation
  3: 25   // Severe violation
} as const

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
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

    // Parse ID format: "note-123" or "flashcard-456"
    const [contentType, contentIdStr] = params.id.split("-")
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

    // Get all reports for this content
    const reports = await prisma.report.findMany({
      where: contentType === "note"
        ? { noteId: contentId, contentType: "note" }
        : { flashcardSetId: contentId, contentType: "flashcard" }
    })

    if (reports.length === 0) {
      return NextResponse.json(
        { error: "No reports found for this content" },
        { status: 404 }
      )
    }

    // Get content to find owner
    let contentOwnerId: number | null = null
    if (contentType === "note") {
      const note = await prisma.note.findUnique({
        where: { id: contentId },
        select: { userId: true }
      })
      contentOwnerId = note?.userId ?? null
    } else {
      const flashcardSet = await prisma.flashcardSet.findUnique({
        where: { id: contentId },
        select: { userId: true }
      })
      contentOwnerId = flashcardSet?.userId ?? null
    }

    if (!contentOwnerId) {
      return NextResponse.json(
        { error: "Content or content owner not found" },
        { status: 404 }
      )
    }

    switch (action) {
      case "set_reviewed":
        // Update all reports for this content to "reviewed"
        await prisma.report.updateMany({
          where: contentType === "note"
            ? { noteId: contentId, contentType: "note" }
            : { flashcardSetId: contentId, contentType: "flashcard" },
          data: {
            status: "reviewed"
          }
        })

        const reporterNotifications = reports.map(report => ({
          userId: report.userId,
          type: "report_reviewed" as const,
          title: "Report Sedang Ditinjau",
          message: `Laporan Anda untuk ${contentType === "note" ? "catatan" : "flashcard"} sedang ditinjau oleh admin.`,
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
        // Validate penalty level
        if (!penaltyLevel || ![1, 2, 3].includes(penaltyLevel)) {
          return NextResponse.json(
            { error: "Valid penalty level (1, 2, or 3) is required" },
            { status: 400 }
          )
        }

        const penaltyAmount = PENALTY_AMOUNTS[penaltyLevel]

        // Get current user data
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
        
        // Determine new status based on score
        let newStatus: UserStatus = "active"
        if (newScore <= 15) {
          newStatus = "banned"
        } else if (newScore <= 30) {
          newStatus = "suspended"
        }

        // Update user score and status
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

        // Mark all reports as resolved
        await prisma.report.updateMany({
          where: contentType === "note"
            ? { noteId: contentId, contentType: "note" }
            : { flashcardSetId: contentId, contentType: "flashcard" },
          data: {
            status: "resolved"
          }
        })

        await createNotification({
          userId: contentOwnerId,
          type: "score_reduced",
          title: "Peringatan: Skor Dikurangi",
          message: `Skor Anda dikurangi ${penaltyAmount} poin karena pelanggaran konten. Skor sekarang: ${newScore}.`,
          link: undefined
        })
        // Notify reporters that issue is resolved
        const resolvedNotifications = reports.map(report => ({
          userId: report.userId,
          type: "report_resolved" as const,
          title: "Laporan Diselesaikan",
          message: `Terima kasih! Laporan Anda telah ditindaklanjuti oleh admin.`,
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
        // Update all reports first, then delete content
        await prisma.report.updateMany({
          where: contentType === "note"
            ? { noteId: contentId, contentType: "note" }
            : { flashcardSetId: contentId, contentType: "flashcard" },
          data: {
            status: "resolved"
          }
        })
        
        // Delete the content (cascades will handle related data)
        if (contentType === "note") {
          await prisma.note.delete({
            where: { id: contentId }
          })
        } else {
          await prisma.flashcardSet.delete({
            where: { id: contentId }
          })
        }

        await createNotification({
          userId: contentOwnerId,
          type: "content_deleted",
          title: "Konten Dihapus",
          message: `${contentType === "note" ? "Catatan" : "Flashcard set"} Anda telah dihapus karena melanggar ketentuan.`,
          link: undefined
        })
        // Notify reporters
        const deletedNotifications = reports.map(report => ({
          userId: report.userId,
          type: "report_resolved" as const,
          title: "Laporan Diselesaikan",
          message: `Konten yang Anda laporkan telah dihapus. Terima kasih atas laporannya!`,
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