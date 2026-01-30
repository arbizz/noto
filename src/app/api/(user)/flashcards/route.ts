import { auth } from "@/lib/auth";
import { ContentCategory } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    const rawVisibilty = searchParams.get("visibility")
    const rawSearch = searchParams.get("search")
    const rawPage = searchParams.get("page")
    const limit = 12

    const category = rawCategory && Object.values(ContentCategory).includes(rawCategory as ContentCategory)
      ? (rawCategory as ContentCategory)
      : undefined

    const order: "asc" | "desc" = rawOrder === "asc" 
      ? "asc" 
      : "desc"

    const visibility = rawVisibilty === "public" || rawVisibilty === "private"
      ? rawVisibilty
      : undefined

    const search = rawSearch && rawSearch.trim().length > 0
      ? rawSearch.trim()
      : undefined

    const page = rawPage && !isNaN(Number(rawPage)) && Number(rawPage) > 0
      ? Number(rawPage)
      : 1

    const skip = (page - 1) * limit

    const totalFlashcardsCount = await prisma.flashcardSet.count({
      where: {
        userId,
        ...(category && { category }),
        ...(visibility && { visibility }),
        ...(search && { title: { contains: search } })
      }
    })

    const flashcards = await prisma.flashcardSet.findMany({
      where: {
        userId,
        ...(category && { category }),
        ...(visibility && { visibility }),
        ...(search && { title: { contains: search } })
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
        createdAt: order,
      },
      skip: skip,
      take: limit
    })

    const flashcardsWithFlags = flashcards.map(flashcard => ({
      ...flashcard,
      isBookmarked: false,
      isLiked: false,
      isReported: false
    }))

    const totalPages = Math.ceil(totalFlashcardsCount / limit)

    return NextResponse.json(
      { 
        message: "nice",
        flashcards: flashcardsWithFlags,
        pagination: {
          totalItems: totalFlashcardsCount,
          totalPages: totalPages,
          currentPage: page,
          pageSize: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      },
      { status: 200 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )

    const userId = Number(session.user.id)

    const body = await req.json()
    const { title, description, flashcards, visibility, category } = body

    if (!title || Object.keys(flashcards).length === 0 ) return NextResponse.json(
      { message: "" },
      { status: 400 },
    )

    if (category === "") {
      const { id } = await prisma.flashcardSet.create({
        data: {
          userId,
          title,
          description,
          flashcards,
          visibility,
          category: "other"
        },
        select: {
          id: true
        }
      })

      return NextResponse.json(
        { message: "Set Created", id: id },
        { status: 201 }
      )
    }
    
    const { id } = await prisma.flashcardSet.create({
      data: {
        userId,
        title,
        description,
        flashcards,
        visibility,
        category
      },
      select: {
        id: true
      }
    })
    
    return NextResponse.json(
      { message: "Set Created", id: id },
      { status: 201 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}