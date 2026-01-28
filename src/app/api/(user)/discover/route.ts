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
      ...(category && { category }),
      ...(search && { title: { contains: search } })
    }

    const [totalNotesCount, totalFlashcardsCount] = await Promise.all([
      prisma.note.count({ where: baseWhere }),
      prisma.flashcardSet.count({ where: baseWhere })
    ])

    const [notes, flashcards] = await Promise.all([
      prisma.note.findMany({
        where: baseWhere,
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
      prisma.flashcardSet.findMany({
        where: baseWhere,
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

    // Get user's bookmarks, likes, and reports
    const [noteBookmarks, flashcardBookmarks, noteLikes, flashcardLikes, noteReports, flashcardReports] = await Promise.all([
      prisma.bookmark.findMany({
        where: {
          userId,
          contentType: "note",
          noteId: { in: notes.map(n => n.id) }
        },
        select: { noteId: true }
      }),
      prisma.bookmark.findMany({
        where: {
          userId,
          contentType: "flashcard",
          flashcardSetId: { in: flashcards.map(f => f.id) }
        },
        select: { flashcardSetId: true }
      }),
      prisma.like.findMany({
        where: {
          userId,
          contentType: "note",
          noteId: { in: notes.map(n => n.id) }
        },
        select: { noteId: true }
      }),
      prisma.like.findMany({
        where: {
          userId,
          contentType: "flashcard",
          flashcardSetId: { in: flashcards.map(f => f.id) }
        },
        select: { flashcardSetId: true }
      }),
      prisma.report.findMany({
        where: {
          userId,
          contentType: "note",
          noteId: { in: notes.map(n => n.id) }
        },
        select: { noteId: true }
      }),
      prisma.report.findMany({
        where: {
          userId,
          contentType: "flashcard",
          flashcardSetId: { in: flashcards.map(f => f.id) }
        },
        select: { flashcardSetId: true }
      })
    ])

    const bookmarkedNoteIds = new Set(noteBookmarks.map(b => b.noteId))
    const bookmarkedFlashcardIds = new Set(flashcardBookmarks.map(b => b.flashcardSetId))
    const likedNoteIds = new Set(noteLikes.map(l => l.noteId))
    const likedFlashcardIds = new Set(flashcardLikes.map(l => l.flashcardSetId))
    const reportedNoteIds = new Set(noteReports.map(r => r.noteId))
    const reportedFlashcardIds = new Set(flashcardReports.map(r => r.flashcardSetId))

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