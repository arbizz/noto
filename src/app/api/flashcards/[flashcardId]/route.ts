import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, { params }: { params: Promise<{ flashcardId: string }>}) {
  try {
    const { flashcardId: id } = await params
    const session = await auth()

    if (!session?.user) return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )

    const userId = Number(session.user.id)
    const flashcardId = Number(id)
    
    if (isNaN(flashcardId)) return NextResponse.json(
      { error: "Invalid Flashcard ID" },
      { status: 400 }
    )

    const flashcardSet = await prisma.content.findUnique({
      where: {
        id: flashcardId,
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        visibility: true,
        category: true,
        content: true
      }
    })

    if (!flashcardSet) return NextResponse.json(
      { error: "Flashcard set not found or access denied." },
      { status: 404 }
    )

    return NextResponse.json(
      { data: flashcardSet },
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

export async function PATCH(req: Request, { params }: { params: Promise<{ flashcardId: string }> }) {
  try {
    const { flashcardId: id } = await params
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = Number(session.user.id)
    const flashcardId = Number(id)

    if (isNaN(flashcardId)) {
      return NextResponse.json(
        { error: "Invalid Flashcard ID" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { title, description, category, visibility, flashcards: content } = body

    if (typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      )
    }

    if (!Array.isArray(content) || content.length === 0) {
      return NextResponse.json(
        { error: "Flashcards are required and must not be empty." },
        { status: 400 }
      )
    }

    const existingFlashcard = await prisma.content.findUnique({
      where: { id: flashcardId, userId }
    })

    if (!existingFlashcard) {
      return NextResponse.json(
        { error: "Flashcard set not found or access denied." },
        { status: 404 }
      )
    }

    const updated = await prisma.content.update({
      where: {
        id: flashcardId,
        userId,
      },
      data: {
        title,
        description,
        category,
        visibility,
        content,
      },
    })

    return NextResponse.json(
      { message: "Flashcard set updated successfully", data: updated },
      { status: 200 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Server error during update" },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ flashcardId: string }> }) {
  try {
    const { flashcardId: id } = await params
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = Number(session.user.id)
    const flashcardId = Number(id)

    await prisma.content.delete({
      where: {
        userId,
        id: flashcardId
      }
    })

    return NextResponse.json(
      { message: "Success" },
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