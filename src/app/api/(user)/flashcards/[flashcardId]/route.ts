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

    const flashcardSet = await prisma.flashcardSet.findUnique({
      where: {
        id: flashcardId,
        userId
      },
      select: {
        id: true,
        title: true,
        description: true,
        visibility: true,
        category: true,
        flashcards: true
      }
    })

    if (!flashcardSet) return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    )

    return NextResponse.json(
      { message: "success", data: flashcardSet },
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

export async function PATCH(
  req: Request,
  { params }: { params: { flashcardId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = Number(session.user.id)
    const flashcardId = Number(params.flashcardId)

    if (isNaN(flashcardId)) {
      return NextResponse.json(
        { error: "Invalid flashcard ID" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const {
      title,
      description,
      category,
      visibility,
      flashcards,
    } = body

    if (
      (title !== undefined && typeof title !== "string") ||
      (description !== undefined && typeof description !== "string") ||
      (flashcards !== undefined && !Array.isArray(flashcards))
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      )
    }

    const updated = await prisma.flashcardSet.update({
      where: {
        id: flashcardId,
        userId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(visibility !== undefined && { visibility }),
        ...(flashcards !== undefined && { flashcards }),
      },
    })

    return NextResponse.json(
      { message: "Updated successfully", data: updated },
      { status: 200 }
    )
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Flashcard not found" },
        { status: 404 }
      )
    }

    console.error(err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}


export async function DELETE(_req: Request, { params }: { params: { flashcardId: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = Number(session.user.id)
    const flashcardId = Number(params.flashcardId)

    await prisma.flashcardSet.delete({
      where: {
        userId,
        id: flashcardId
      }
    })

    return NextResponse.json(
      { message: "Nice" },
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