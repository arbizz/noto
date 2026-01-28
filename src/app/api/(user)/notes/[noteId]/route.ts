import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ noteId: string }> }) {
  try {
    const { noteId: id } = await params
    const session = await auth()

    if (!session?.user) return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )

    const userId = Number(session.user.id)
    const noteId = Number(id)
    if (isNaN(noteId)) return NextResponse.json(
      { error: "Invalid Note ID" },
      { status: 400 }
    )

    const note = await prisma.note.findUnique({
      where: {
        id: noteId,
        userId
      }
    })

    if (!note) return NextResponse.json(
      { error: "Note not found or access denied." },
      { status: 404 }
    )

    return NextResponse.json(
      { note: note },
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

export async function DELETE(_req: Request, { params }: { params: Promise<{ noteId: string }> }) {
  try {
    const { noteId: id } = await params
    const session = await auth()

    if (!session?.user) return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )

    const userId = Number(session.user.id)
    const noteId = Number(id)

    await prisma.note.delete({
      where: {
        userId,
        id: noteId
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

export async function PATCH(req: Request, { params }: { params: Promise<{ noteId: string }> }) {
  try {
    const { noteId: id } = await params
    const session = await auth()

    if (!session?.user) return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )

    const userId = Number(session.user.id)
    const noteId = Number(id)
    if (isNaN(noteId)) return NextResponse.json(
      { error: "Invalid Note ID" },
      { status: 400 }
    )

    const body = await req.json()
    const { title, description, content, visibility, category } = body

    if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
            { error: "Title is required." },
            { status: 400 } 
        )
    }

    const existingNote = await prisma.note.findUnique({
        where: { id: noteId, userId }
    })

    if (!existingNote) {
        return NextResponse.json(
            { error: "Note not found or access denied." },
            { status: 404 } // Not Found
        )
    }

    const updatedNote = await prisma.note.update({
      data: {
        title,
        description,
        content,
        visibility,
        category
      },
      where: {
        id: noteId,
        userId
      }
    })

    return NextResponse.json(
      { message: "Note updated successfully", note: updatedNote },
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