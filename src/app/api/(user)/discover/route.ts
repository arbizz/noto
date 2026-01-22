import { auth } from "@/auth"
import { ContentCategory } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  
    const userId = Number(session.user.id)
    const searchParams = req.nextUrl.searchParams
    
    const rawCategory = searchParams.get("category")
    const rawOrder = searchParams.get("order")
    const rawSearch = searchParams.get("search")
    const rawPage = searchParams.get("page")
    const limit = 12

    const category = Object.values(ContentCategory).includes(rawCategory as ContentCategory)
      ? (rawCategory as ContentCategory)
      : undefined

    const order: "asc" | "desc" = rawOrder === "desc" || rawOrder === "asc" 
      ? rawOrder 
      : "desc"

    const search = rawSearch && rawSearch.trim().length > 0
      ? rawSearch.trim()
      : undefined

    const page = rawPage && Number(rawPage)
      ? Number(rawPage)
      : 1

    const skip = (page - 1) * limit

    const totalNotesCount = await prisma.note.count({
      where: {
        visibility: "public",
        ...(category && { category }),
        ...(search && { title: { contains: search } }),
        NOT: { userId }
      }
    })
    
    const totalFlashcardsCount = await prisma.flashcardSet.count({
      where: {
        visibility: "public",
        ...(category && { category }),
        ...(search && { title: { contains: search } }),
        NOT: { userId }
      }
    })
    
    const flashcards = await prisma.flashcardSet.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        likes: true,
        visibility: true,
        category: true,
        createdAt: true,
      },
      where: {
        ...(category && { category }),
        ...(search && { title: { contains: search } }),
        visibility: "public",
        NOT: { userId }
      },
      orderBy: {
        createdAt: order,
      },
      skip: skip,
      take:limit
    })
    
    const notes = await prisma.note.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        likes: true,
        visibility: true,
        category: true,
        createdAt: true,
      },
      where: {
        ...(category && { category }),
        ...(search && { title: { contains: search } }),
        visibility: "public",
        NOT: { userId }
      },
      orderBy: {
        createdAt: order,
      },
      skip: skip,
      take: limit
    })

    const totalFPages = Math.ceil(totalFlashcardsCount / limit)
    const totalNPages = Math.ceil(totalNotesCount / limit)

    return NextResponse.json(
      {
        message: "nice",
        notes: notes,
        flashcards: flashcards,
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
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}