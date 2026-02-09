import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = Number(session.user.id)

    const [totalNotes, totalFlashcards, totalBookmarks, totalLikes] = await Promise.all([
      prisma.content.count({
        where: {
          userId,
          contentType: 'note'
        }
      }),
      prisma.content.count({
        where: {
          userId,
          contentType: 'flashcard'
        }
      }),
      prisma.bookmark.count({
        where: { userId }
      }),
      prisma.like.count({
        where: { userId }
      })
    ])

    const recentNotes = await prisma.content.findMany({
      where: {
        userId,
        contentType: 'note'
      },
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

    const recentFlashcards = await prisma.content.findMany({
      where: {
        userId,
        contentType: 'flashcard'
      },
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