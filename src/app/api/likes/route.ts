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

    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        contentType,
        contentId: Number(contentId)
      }
    })

    if (existingLike) {
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
      await prisma.like.create({
        data: {
          userId,
          contentType,
          contentId: Number(contentId)
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