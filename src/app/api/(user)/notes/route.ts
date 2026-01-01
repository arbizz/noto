import { auth } from "@/auth";
import { ContentCategory } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
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