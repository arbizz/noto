/* eslint-disable @typescript-eslint/no-explicit-any */
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

    const allReports = await prisma.report.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        content: {
          select: {
            id: true,
            title: true,
            category: true,
            visibility: true,
            contentType: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: order
      }
    })

    const groupedMap = new Map<string, any>()

    for (const report of allReports) {
      const contentKey = `${report.contentType}-${report.contentId}`
      
      if (!groupedMap.has(contentKey)) {
        groupedMap.set(contentKey, {
          contentId: report.contentId,
          contentType: report.contentType,
          content: report.content,
          contentOwner: report.content?.user,
          reports: [],
          totalReports: 0,
          latestReportDate: report.createdAt,
          statuses: new Set<ReportStatus>(),
          reasons: new Map<ReportReason, number>()
        })
      }

      const group = groupedMap.get(contentKey)!
      
      group.reports.push({
        id: report.id,
        userId: report.userId,
        user: report.user,
        reason: report.reason,
        description: report.description,
        status: report.status,
        createdAt: report.createdAt
      })
      
      group.totalReports++
      group.statuses.add(report.status)
      
      const currentCount = group.reasons.get(report.reason) || 0
      group.reasons.set(report.reason, currentCount + 1)
      
      if (new Date(report.createdAt) > new Date(group.latestReportDate)) {
        group.latestReportDate = report.createdAt
      }
    }

    const groupedReports = Array.from(groupedMap.values()).map(group => ({
      contentId: group.contentId,
      contentType: group.contentType,
      content: group.content,
      contentOwner: group.contentOwner,
      totalReports: group.totalReports,
      latestReportDate: group.latestReportDate,
      statuses: Array.from(group.statuses),
      reasons: Object.fromEntries(group.reasons),
      reporters: group.reports.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        userName: r.user.name,
        userEmail: r.user.email,
        userImage: r.user.image,
        reason: r.reason,
        description: r.description,
        status: r.status,
        createdAt: r.createdAt
      })),
      primaryStatus: group.statuses.has("pending" as ReportStatus) 
        ? "pending" 
        : group.statuses.has("reviewed" as ReportStatus)
        ? "reviewed"
        : group.statuses.has("resolved" as ReportStatus)
        ? "resolved"
        : "rejected"
    }))

    groupedReports.sort((a, b) => {
      const dateA = new Date(a.latestReportDate).getTime()
      const dateB = new Date(b.latestReportDate).getTime()
      return order === "desc" ? dateB - dateA : dateA - dateB
    })

    const totalItems = groupedReports.length
    const totalPages = Math.ceil(totalItems / limit)
    const paginatedReports = groupedReports.slice(skip, skip + limit)

    return NextResponse.json(
      {
        reports: paginatedReports,
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
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = Number(session.user.id)
    const body = await req.json()

    const { contentId, contentType, reason, description } = body

    if (!contentId || !contentType || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (contentType !== "note" && contentType !== "flashcard") {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      )
    }

    const existingReport = await prisma.report.findFirst({
      where: {
        userId,
        contentType,
        contentId: Number(contentId)
      }
    })

    if (existingReport) {
      return NextResponse.json(
        { 
          error: "You have already reported this content",
          isReported: true 
        },
        { status: 400 }
      )
    }

    await prisma.report.create({
      data: {
        userId,
        contentType,
        contentId: Number(contentId),
        reason,
        description: description || null,
        status: "pending"
      }
    })

    return NextResponse.json(
      { 
        message: "Content reported successfully",
        isReported: true 
      },
      { status: 200 }
    )
  } catch (err) {
    console.error("Report error:", err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}