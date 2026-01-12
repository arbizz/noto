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
        flashcards: true
      }
    })

    if (!flashcardSet?.flashcards) return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    )

    return NextResponse.json(
      { message: "success", flashcards: flashcardSet.flashcards },
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