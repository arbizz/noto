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

    // Check if bookmark exists
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId,
        contentType,
        ...(contentType === "note" 
          ? { noteId: Number(contentId) }
          : { flashcardSetId: Number(contentId) }
        )
      }
    })

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id
        }
      })

      return NextResponse.json(
        { 
          message: "Bookmark removed",
          isBookmarked: false 
        },
        { status: 200 }
      )
    } else {
      // Get category from content
      let category = null
      
      if (contentType === "note") {
        const note = await prisma.note.findUnique({
          where: { id: Number(contentId) },
          select: { category: true }
        })
        category = note?.category || null
      } else {
        const flashcard = await prisma.flashcardSet.findUnique({
          where: { id: Number(contentId) },
          select: { category: true }
        })
        category = flashcard?.category || null
      }

      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId,
          contentType,
          category,
          ...(contentType === "note"
            ? { noteId: Number(contentId) }
            : { flashcardSetId: Number(contentId) }
          )
        }
      })

      return NextResponse.json(
        { 
          message: "Bookmark added",
          isBookmarked: true 
        },
        { status: 200 }
      )
    }
  } catch (err) {
    console.error("Toggle bookmark error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}