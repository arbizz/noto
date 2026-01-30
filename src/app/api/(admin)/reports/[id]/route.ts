import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
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

    // Parse ID format: "note-123" or "flashcard-456"
    const [contentType, contentIdStr] = params.id.split("-")
    const contentId = Number(contentIdStr)

    if (!["note", "flashcard"].includes(contentType) || isNaN(contentId)) {
      return NextResponse.json(
        { error: "Invalid content identifier" },
        { status: 400 }
      )
    }

    // Get all reports for this content
    const reports = await prisma.report.findMany({
      where: contentType === "note"
        ? { noteId: contentId, contentType: "note" }
        : { flashcardSetId: contentId, contentType: "flashcard" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            status: true,
            score: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    if (reports.length === 0) {
      return NextResponse.json(
        { error: "No reports found for this content" },
        { status: 404 }
      )
    }

    // Get content details
    let content = null
    if (contentType === "note") {
      content = await prisma.note.findUnique({
        where: { id: contentId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              score: true,
              status: true
            }
          },
          _count: {
            select: {
              likes: true,
              bookmarks: true,
              reports: true
            }
          }
        }
      })
    } else {
      content = await prisma.flashcardSet.findUnique({
        where: { id: contentId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              score: true,
              status: true
            }
          },
          _count: {
            select: {
              likes: true,
              bookmarks: true,
              reports: true
            }
          }
        }
      })
    }

    // Count reasons
    const reasonCounts = reports.reduce((acc, report) => {
      acc[report.reason] = (acc[report.reason] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get status distribution
    const statusCounts = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      contentId,
      contentType,
      content,
      totalReports: reports.length,
      reasonCounts,
      statusCounts,
      reports: reports.map(r => ({
        id: r.id,
        userId: r.userId,
        user: r.user,
        reason: r.reason,
        description: r.description,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      })),
      latestReport: reports[0]
    }, { status: 200 })
  } catch (err) {
    console.error("Report detail API error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}