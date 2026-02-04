import { ContentCategory } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    
    const rawCategory = searchParams.get("category")
    const rawOrder = searchParams.get("order")
    const rawSearch = searchParams.get("search")
    const rawPage = searchParams.get("page")
    const limit = 12

    const category = rawCategory && Object.values(ContentCategory).includes(rawCategory as ContentCategory)
      ? (rawCategory as ContentCategory)
      : undefined

    const order: "asc" | "desc" = rawOrder === "asc" 
      ? "asc" 
      : "desc"

    const search = rawSearch && rawSearch.trim().length > 0
      ? rawSearch.trim()
      : undefined

    const page = rawPage && !isNaN(Number(rawPage)) && Number(rawPage) > 0
      ? Number(rawPage)
      : 1

    const skip = (page - 1) * limit

    const baseWhere = {
      visibility: "public" as const,
      ...(category && { category }),
      ...(search && { title: { contains: search } })
    }

    const [totalNotesCount, totalFlashcardsCount] = await Promise.all([
      prisma.content.count({ 
        where: { 
          ...baseWhere,
          contentType: 'note'
        } 
      }),
      prisma.content.count({ 
        where: { 
          ...baseWhere,
          contentType: 'flashcard'
        } 
      })
    ])

    const [notes, flashcards] = await Promise.all([
      prisma.content.findMany({
        where: {
          ...baseWhere,
          contentType: 'note'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          _count: {
            select: {
              likes: true
            }
          }
        },
        orderBy: {
          createdAt: order
        },
        skip,
        take: limit
      }),
      prisma.content.findMany({
        where: {
          ...baseWhere,
          contentType: 'flashcard'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          _count: {
            select: {
              likes: true
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

    const totalNPages = Math.ceil(totalNotesCount / limit)
    const totalFPages = Math.ceil(totalFlashcardsCount / limit)

    return NextResponse.json(
      {
        notes,
        flashcards,
        pagination: {
          npagination: {
            totalItems: totalNotesCount,
            totalPages: totalNPages,
            currentPage: page,
            pageSize: limit,
            hasNextPage: page < totalNPages,
            hasPreviousPage: page > 1
          },
          fpagination: {
            totalItems: totalFlashcardsCount,
            totalPages: totalFPages,
            currentPage: page,
            pageSize: limit,
            hasNextPage: page < totalFPages,
            hasPreviousPage: page > 1
          }
        }
      }, 
      { status: 200 }
    )
  } catch (err) {
    console.error("Explore API error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}