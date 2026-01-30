// app/api/admin/reports/route.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ReportStatus, ReportReason } from "@/generated/prisma/enums"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams
    
    const rawStatus = searchParams.get("status")
    const rawReason = searchParams.get("reason")
    const rawOrder = searchParams.get("order")
    const rawPage = searchParams.get("page")
    const limit = 20

    const status = rawStatus && Object.values(ReportStatus).includes(rawStatus as ReportStatus)
      ? (rawStatus as ReportStatus)
      : undefined

    const reason = rawReason && Object.values(ReportReason).includes(rawReason as ReportReason)
      ? (rawReason as ReportReason)
      : undefined

    const order: "asc" | "desc" = rawOrder === "asc" 
      ? "asc" 
      : "desc"

    const page = rawPage && !isNaN(Number(rawPage)) && Number(rawPage) > 0
      ? Number(rawPage)
      : 1

    const skip = (page - 1) * limit

    const where = {
      ...(status && { status }),
      ...(reason && { reason })
    }

    const [totalItems, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
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
          },
          note: {
            select: {
              id: true,
              title: true,
              category: true,
              visibility: true,
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          flashcardSet: {
            select: {
              id: true,
              title: true,
              category: true,
              visibility: true,
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: order
        },
        skip,
        take: limit
      })
    ])

    const totalPages = Math.ceil(totalItems / limit)

    return NextResponse.json(
      {
        reports,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      },
      { status: 200 }
    )
  } catch (err) {
    console.error("Reports API error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);
    const body = await req.json();
    const { contentId, contentType, reason, description } = body;

    // Validasi input
    if (!contentId || !contentType || !["note", "flashcard"].includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Cek apakah user sudah melakukan report sebelumnya
    const existingReport = await prisma.report.findFirst({
      where: {
        userId,
        ...(contentType === "note" 
          ? { noteId: contentId, contentType: "note" }
          : { flashcardSetId: contentId, contentType: "flashcard" }
        )
      }
    });

    if (existingReport) {
      // Hapus report jika sudah ada
      await prisma.report.delete({
        where: { id: existingReport.id }
      });

      return NextResponse.json(
        {
          isReported: false,
          message: "Report removed successfully"
        },
        { status: 200 }
      );
    }

    // Validasi reason
    if (!reason || !Object.values(ReportReason).includes(reason as ReportReason)) {
      return NextResponse.json(
        { error: "Invalid report reason" },
        { status: 400 }
      );
    }

    // Validasi description (optional, max 100 chars)
    if (description && description.length > 100) {
      return NextResponse.json(
        { error: "Description too long (max 100 characters)" },
        { status: 400 }
      );
    }

    // Buat report baru
    await prisma.report.create({
      data: {
        userId,
        contentType,
        reason: reason as ReportReason,
        description: description?.trim() || null,
        ...(contentType === "note" 
          ? { noteId: contentId }
          : { flashcardSetId: contentId }
        )
      }
    });

    return NextResponse.json(
      {
        isReported: true,
        message: "Content reported successfully. Our team will review it shortly."
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Toggle report error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

