import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
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

    const { id } = await params
    const [contentType, contentIdStr] = id.split("-")
    const contentId = Number(contentIdStr)

    if (!["note", "flashcard"].includes(contentType) || isNaN(contentId)) {
      return NextResponse.json(
        { error: "Invalid content identifier" },
        { status: 400 }
      )
    }

    const reports = await prisma.report.findMany({
      where: {
        contentId: contentId,
        contentType: contentType as "note" | "flashcard"
      },
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

    const content = await prisma.content.findUnique({
      where: {
        id: contentId,
        contentType: contentType as "note" | "flashcard"
      },
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

    const reasonCounts = reports.reduce((acc, report) => {
      acc[report.reason] = (acc[report.reason] || 0) + 1
      return acc
    }, {} as Record<string, number>)

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