import { auth } from "@/auth";
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
    const rawSearch = searchParams.get("search")
    const rawVisibilty = searchParams.get("visibility")

    const category = Object.values(ContentCategory).includes(rawCategory as ContentCategory)
      ? (rawCategory as ContentCategory)
      : undefined

    const order: "asc" | "desc" = rawOrder === "desc" || rawOrder === "asc" 
      ? rawOrder 
      : "asc"

    const search = rawSearch && rawSearch.trim().length > 0
      ? rawSearch.trim()
      : undefined

    const visibility = rawVisibilty === "public" || rawVisibilty === "private"
      ? rawVisibilty
      : undefined

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
        userId,
        ...(category && { category }),
        ...(visibility && { visibility }),
        ...(search && { title: { contains: search } })
      },
      orderBy: {
        createdAt: order,
      }
    })

    return NextResponse.json(
      { message: "nice", flashcards: flashcards },
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