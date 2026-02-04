import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ details: string }> }
) {
  try {
    const { details } = await context.params

    console.log("details received:", details)

    // Parse details format: "note-123" or "flashcard-456"
    const match = details.match(/^(note|flashcard)-(\d+)$/)
    
    if (!match) {
      console.log("Invalid details format:", details)
      return NextResponse.json(
        { error: "Invalid details format. Use 'note-{id}' or 'flashcard-{id}'" },
        { status: 400 }
      )
    }

    const [, contentType, contentIdStr] = match
    const contentId = Number(contentIdStr)

    console.log("Parsed:", { contentType, contentId })

    if (isNaN(contentId)) {
      return NextResponse.json(
        { error: "Invalid content ID" },
        { status: 400 }
      )
    }

    // Fetch the content
    const content = await prisma.content.findUnique({
      where: {
        id: contentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    })

    console.log("Content found:", !!content)

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      )
    }

    // Verify content type matches
    const dbContentType = content.contentType.toLowerCase()
    const requestedType = contentType === "flashcard" ? "flashcard" : "note"
    
    console.log("Type check:", { dbContentType, requestedType })
    
    if (dbContentType !== requestedType) {
      return NextResponse.json(
        { error: "Content type mismatch" },
        { status: 400 }
      )
    }

    // Only allow public content in explore
    if (content.visibility !== "public") {
      return NextResponse.json(
        { error: "Content not accessible" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { content },
      { status: 200 }
    )
  } catch (err) {
    console.error("Explore detail API error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}