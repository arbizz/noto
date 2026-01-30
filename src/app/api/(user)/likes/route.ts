import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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

    const { contentId, contentType } = body

    if (!contentId || !contentType) {
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

    // Check if like exists
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        contentType,
        ...(contentType === "note"
          ? { noteId: Number(contentId) }
          : { flashcardSetId: Number(contentId) }
        )
      }
    })

    if (existingLike) {
      // Remove like
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      })

      return NextResponse.json(
        { 
          message: "Like removed",
          isLiked: false 
        },
        { status: 200 }
      )
    } else {
      // Add like
      await prisma.like.create({
        data: {
          userId,
          contentType,
          ...(contentType === "note"
            ? { noteId: Number(contentId) }
            : { flashcardSetId: Number(contentId) }
          )
        }
      })

      return NextResponse.json(
        { 
          message: "Like added",
          isLiked: true 
        },
        { status: 200 }
      )
    }
  } catch (err) {
    console.error("Toggle like error:", err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}