import { auth } from "@/lib/auth"
import { ContentCategory } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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
    const searchParams = req.nextUrl.searchParams
    
    const rawCategory = searchParams.get("category")
    const rawOrder = searchParams.get("order")
    const rawSearch = searchParams.get("search")
    const rawPage = searchParams.get("page")
    const limit = 12

    const category = rawCategory && Object.values(ContentCategory).includes(rawCategory as ContentCategory)
      ? (rawCategory as ContentCategory)
      : undefined

    const order: "asc" | "desc" = rawOrder === "asc" 
      ? "asc" 
      : "desc"

    const search = rawSearch && rawSearch.trim().length > 0
      ? rawSearch.trim()
      : undefined

    const page = rawPage && !isNaN(Number(rawPage)) && Number(rawPage) > 0
      ? Number(rawPage)
      : 1

    const skip = (page - 1) * limit

    const baseWhere = {
      visibility: "public" as const,
      userId: { not: userId },
      ...(category && { category }),
      ...(search && { title: { contains: search } })
    }

    const [totalNotesCount, totalFlashcardsCount] = await Promise.all([
      prisma.content.count({ 
        where: { 
          ...baseWhere,
          contentType: 'note'
        } 
      }),
      prisma.content.count({ 
        where: { 
          ...baseWhere,
          contentType: 'flashcard'
        } 
      })
    ])

    const [notes, flashcards] = await Promise.all([
      prisma.content.findMany({
        where: {
          ...baseWhere,
          contentType: 'note'
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
        },
        orderBy: {
          createdAt: order
        },
        skip,
        take: limit
      }),
      prisma.content.findMany({
        where: {
          ...baseWhere,
          contentType: 'flashcard'
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
        },
        orderBy: {
          createdAt: order
        },
        skip,
        take: limit
      })
    ])

    const [noteBookmarks, flashcardBookmarks, noteLikes, flashcardLikes, noteReports, flashcardReports] = await Promise.all([
      prisma.bookmark.findMany({
        where: {
          userId,
          contentType: "note",
          contentId: { in: notes.map(n => n.id) }
        },
        select: { contentId: true }
      }),
      prisma.bookmark.findMany({
        where: {
          userId,
          contentType: "flashcard",
          contentId: { in: flashcards.map(f => f.id) }
        },
        select: { contentId: true }
      }),
      prisma.like.findMany({
        where: {
          userId,
          contentType: "note",
          contentId: { in: notes.map(n => n.id) }
        },
        select: { contentId: true }
      }),
      prisma.like.findMany({
        where: {
          userId,
          contentType: "flashcard",
          contentId: { in: flashcards.map(f => f.id) }
        },
        select: { contentId: true }
      }),
      prisma.report.findMany({
        where: {
          userId,
          contentType: "note",
          contentId: { in: notes.map(n => n.id) }
        },
        select: { contentId: true }
      }),
      prisma.report.findMany({
        where: {
          userId,
          contentType: "flashcard",
          contentId: { in: flashcards.map(f => f.id) }
        },
        select: { contentId: true }
      })
    ])

    const bookmarkedNoteIds = new Set(noteBookmarks.map(b => b.contentId))
    const bookmarkedFlashcardIds = new Set(flashcardBookmarks.map(b => b.contentId))
    const likedNoteIds = new Set(noteLikes.map(l => l.contentId))
    const likedFlashcardIds = new Set(flashcardLikes.map(l => l.contentId))
    const reportedNoteIds = new Set(noteReports.map(r => r.contentId))
    const reportedFlashcardIds = new Set(flashcardReports.map(r => r.contentId))

    const notesWithFlags = notes.map(note => ({
      ...note,
      isBookmarked: bookmarkedNoteIds.has(note.id),
      isLiked: likedNoteIds.has(note.id),
      isReported: reportedNoteIds.has(note.id)
    }))

    const flashcardsWithFlags = flashcards.map(flashcard => ({
      ...flashcard,
      isBookmarked: bookmarkedFlashcardIds.has(flashcard.id),
      isLiked: likedFlashcardIds.has(flashcard.id),
      isReported: reportedFlashcardIds.has(flashcard.id)
    }))

    const totalNPages = Math.ceil(totalNotesCount / limit)
    const totalFPages = Math.ceil(totalFlashcardsCount / limit)

    return NextResponse.json(
      {
        notes: notesWithFlags,
        flashcards: flashcardsWithFlags,
        pagination: {
          npagination: {
            totalItems: totalNotesCount,
            totalPages: totalNPages,
            currentPage: page,
            pageSize: limit,
            hasNextPage: page < totalNPages,
            hasPreviousPage: page > 1
          },
          fpagination: {
            totalItems: totalFlashcardsCount,
            totalPages: totalFPages,
            currentPage: page,
            pageSize: limit,
            hasNextPage: page < totalFPages,
            hasPreviousPage: page > 1
          }
        }
      }, 
      { status: 200 }
    )
  } catch (err) {
    console.error("Discover API error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}