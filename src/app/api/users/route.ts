import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search") ?? ""
    const status = searchParams.get("status")
    const scoreMin = searchParams.get("scoreMin")
    const scoreMax = searchParams.get("scoreMax")
    const order = searchParams.get("order") === "asc" ? "asc" : "desc"
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = 10

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (scoreMin || scoreMax) {
      where.score = {}
      if (scoreMin) (where.score as Record<string, number>).gte = parseInt(scoreMin)
      if (scoreMax) (where.score as Record<string, number>).lte = parseInt(scoreMax)
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          status: true,
          score: true,
          createdAt: true,
          _count: {
            select: {
              contents: true,
              reports: true,
            },
          },
        },
        orderBy: { createdAt: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (err) {
    console.error("Users API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}