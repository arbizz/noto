// app/api/admin/reports/[id]/actions/route.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ReportStatus } from "@/generated/prisma/enums"
import { NextRequest, NextResponse } from "next/server"

type ActionType = "update_status" | "delete_content" | "validate_content"

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
    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: { role: true }
    })

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    const reportId = Number(params.id)
    if (isNaN(reportId)) {
      return NextResponse.json(
        { error: "Invalid report ID" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { action, status } = body as {
      action: ActionType
      status?: ReportStatus
    }

    // Get the report first
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        note: true,
        flashcardSet: true
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    let result

    switch (action) {
      case "update_status":
        if (!status || !Object.values(ReportStatus).includes(status)) {
          return NextResponse.json(
            { error: "Valid status is required" },
            { status: 400 }
          )
        }

        result = await prisma.report.update({
          where: { id: reportId },
          data: {
            status
          }
        })

        return NextResponse.json(
          { 
            message: "Report status updated successfully",
            report: result
          },
          { status: 200 }
        )

      case "validate_content":
        // Mark report as reviewed and content as validated
        result = await prisma.report.update({
          where: { id: reportId },
          data: {
            status: "reviewed"
          }
        })

        return NextResponse.json(
          {
            message: "Content validated successfully",
            report: result
          },
          { status: 200 }
        )

      case "delete_content":
        // Delete the reported content and update all related reports
        if (report.contentType === "note" && report.noteId) {
          // Update all reports first, then delete note
          await prisma.report.updateMany({
            where: { 
              noteId: report.noteId,
              status: { in: ["pending", "reviewed"] }
            },
            data: {
              status: "resolved"
            }
          })
          
          // Delete the note (cascades will handle related data)
          await prisma.note.delete({
            where: { id: report.noteId }
          })

          return NextResponse.json(
            {
              message: "Note deleted successfully and all related reports resolved"
            },
            { status: 200 }
          )
        } else if (report.contentType === "flashcard" && report.flashcardSetId) {
          // Update all reports first, then delete flashcard set
          await prisma.report.updateMany({
            where: { 
              flashcardSetId: report.flashcardSetId,
              status: { in: ["pending", "reviewed"] }
            },
            data: {
              status: "resolved"
            }
          })
          
          // Delete the flashcard set (cascades will handle related data)
          await prisma.flashcardSet.delete({
            where: { id: report.flashcardSetId }
          })

          return NextResponse.json(
            {
              message: "Flashcard set deleted successfully and all related reports resolved"
            },
            { status: 200 }
          )
        } else {
          return NextResponse.json(
            { error: "No content found to delete" },
            { status: 400 }
          )
        }

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