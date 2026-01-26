import { auth } from "@/auth";
import { ReportReason, ReportStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verifikasi apakah user adalah admin
    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: { role: true }
    });

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;

    const rawOrder = searchParams.get("order");
    const rawStatus = searchParams.get("status");
    const rawReason = searchParams.get("reason");
    const rawPage = searchParams.get("page");
    const limit = 12;

    // Validasi order (newest/oldest)
    const order: "asc" | "desc" = rawOrder === "asc" || rawOrder === "desc"
      ? rawOrder
      : "desc";

    // Validasi status
    const status = Object.values(ReportStatus).includes(rawStatus as ReportStatus)
      ? (rawStatus as ReportStatus)
      : undefined;

    // Validasi reason
    const reason = Object.values(ReportReason).includes(rawReason as ReportReason)
      ? (rawReason as ReportReason)
      : undefined;

    // Validasi page
    const page = rawPage && Number(rawPage) > 0
      ? Number(rawPage)
      : 1;

    const skip = (page - 1) * limit;

    // Hitung total reports dengan filter
    const totalReportsCount = await prisma.report.count({
      where: {
        ...(status && { status }),
        ...(reason && { reason })
      }
    });

    // Ambil reports dengan filter, pagination, dan relasi
    const reports = await prisma.report.findMany({
      where: {
        ...(status && { status }),
        ...(reason && { reason })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            score: true,
            role: true,
            status: true,
          }
        },
        note: {
          select: {
            id: true,
            title: true,
            category: true,
            visibility: true,
          }
        },
        flashcardSet: {
          select: {
            id: true,
            title: true,
            category: true,
            visibility: true,
          }
        }
      },
      orderBy: {
        createdAt: order,
      },
      skip: skip,
      take: limit
    });

    const totalPages = Math.ceil(totalReportsCount / limit);

    return NextResponse.json(
      {
        message: "Reports fetched successfully",
        reports: reports,
        pagination: {
          totalItems: totalReportsCount,
          totalPages: totalPages,
          currentPage: page,
          pageSize: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reports API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}