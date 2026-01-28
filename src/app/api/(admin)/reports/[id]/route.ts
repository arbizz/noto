// app/api/admin/reports/[id]/route.ts
import { auth } from "@/auth"
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

    const reportId = Number(params.id)
    if (isNaN(reportId)) {
      return NextResponse.json(
        { error: "Invalid report ID" },
        { status: 400 }
      )
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            status: true
          }
        },
        note: {
          select: {
            id: true,
            title: true,
            description: true,
            content: true,
            category: true,
            visibility: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
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
        },
        flashcardSet: {
          select: {
            id: true,
            title: true,
            description: true,
            flashcards: true,
            category: true,
            visibility: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
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
        }
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ report }, { status: 200 })
  } catch (err) {
    console.error("Report detail API error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}