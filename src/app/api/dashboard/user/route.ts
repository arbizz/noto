import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = Number(session.user.id)

    // Get total counts
    const [totalNotes, totalFlashcards, totalBookmarks, totalLikes] = await Promise.all([
      prisma.note.count({
        where: { userId }
      }),
      prisma.flashcardSet.count({
        where: { userId }
      }),
      prisma.bookmark.count({
        where: { userId }
      }),
      prisma.like.count({
        where: { userId }
      })
    ])

    // Get recent notes (last 5)
    const recentNotes = await prisma.note.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        category: true,
        visibility: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Get recent flashcards (last 5)
    const recentFlashcards = await prisma.flashcardSet.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        category: true,
        visibility: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json(
      {
        message: "Dashboard data retrieved successfully",
        data: {
          stats: {
            totalNotes,
            totalFlashcards,
            totalBookmarks,
            totalLikes
          },
          recents: {
            notes: recentNotes,
            flashcards: recentFlashcards
          }
        }
      },
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