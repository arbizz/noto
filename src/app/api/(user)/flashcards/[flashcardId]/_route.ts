import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

export async function PATCH(req: Request, { params }: { params: Promise<{ flashcardId: string }> }) {
  try {
    const { flashcardId: id } = await params
    const session = await auth()

    if (!session?.user) return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )

    const userId = Number(session.user.id)
    const flashcardId = Number(id)

    const body = await req.json()

    const { title, description, category, visibility, flashcards } = body

    const updated = await prisma.flashcardSet.update({
      where: {
        id: flashcardId,
        userId
      },
      data: {
        title,
        description,
        category,
        visibility,
        flashcards
      }
    })

    return NextResponse.json(
      { message: "nice", data: updated },
      { status: 200 }
    )
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}