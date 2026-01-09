import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    
  }
}