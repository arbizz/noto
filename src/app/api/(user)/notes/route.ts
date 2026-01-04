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

    const category = Object.values(ContentCategory).includes(rawCategory as ContentCategory)
      ? (rawCategory as ContentCategory)
      : undefined

    const order: "asc" | "desc" = rawOrder === "desc" || rawOrder === "asc" 
      ? rawOrder 
      : "asc"

    const search = rawSearch && rawSearch.trim().length > 0
      ? rawSearch.trim()
      : undefined

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
        userId,
        ...(category && { category }),
        ...(search && { title: { contains: search } })
      },
      orderBy: {
        createdAt: order
      }
    })

    return NextResponse.json(
      { message: "nice", notes: notes },
      { status: 200 }
    )
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 })
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
    const { title, description, content, visibility, category } = body

    if (!title || !content) {
      return NextResponse.json(
        { message: "" },
        { status: 400 },
      )
    }

    if (category === "") {
      const { id } = await prisma.note.create({
        data: {
          userId,
          title,
          description,
          content,
          visibility,
          category: "other",
        },
        select: {
          id: true,
        }
      })

      return NextResponse.json(
        { message: "Note Created", id: id },
        { status: 201 }
      )
    }

    const { id } = await prisma.note.create({
      data: {
        userId,
        title,
        description,
        content,
        visibility,
        category,
      },
      select: {
        id: true,
      }
    })

    return NextResponse.json(
      { message: "Note Created", id: id },
      { status: 201 }
    )
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}