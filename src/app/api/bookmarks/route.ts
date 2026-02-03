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
      userId,
      ...(category && {
        OR: [
          { note: { category } },
          { flashcardSet: { category } }
        ]
      })
    }

    const [totalNotesCount, totalFlashcardsCount] = await Promise.all([
      prisma.bookmark.count({
        where: {
          ...baseWhere,
          contentType: "note",
          note: {
            ...(search && { title: { contains: search } })
          }
        }
      }),
      prisma.bookmark.count({
        where: {
          ...baseWhere,
          contentType: "flashcard",
          flashcardSet: {
            ...(search && { title: { contains: search } })
          }
        }
      })
    ])

    const [noteBookmarks, flashcardBookmarks] = await Promise.all([
      prisma.bookmark.findMany({
        where: {
          ...baseWhere,
          contentType: "note",
          note: {
            ...(search && { title: { contains: search } })
          }
        },
        include: {
          note: {
            select: {
              id: true,
              title: true,
              description: true,
              visibility: true,
              category: true,
              createdAt: true,
              updatedAt: true,
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
          }
        },
        orderBy: {
          createdAt: order
        },
        skip,
        take: limit
      }),
      prisma.bookmark.findMany({
        where: {
          ...baseWhere,
          contentType: "flashcard",
          flashcardSet: {
            ...(search && { title: { contains: search } })
          }
        },
        include: {
          flashcardSet: {
            select: {
              id: true,
              title: true,
              description: true,
              visibility: true,
              category: true,
              createdAt: true,
              updatedAt: true,
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
          }
        },
        orderBy: {
          createdAt: order
        },
        skip,
        take: limit
      })
    ])

    const notes = noteBookmarks
      .map(b => b.note)
      .filter(n => n !== null)

    const flashcards = flashcardBookmarks
      .map(b => b.flashcardSet)
      .filter(f => f !== null)

    const [noteLikes, flashcardLikes, noteReports, flashcardReports] = await Promise.all([
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

    const likedNoteIds = new Set(noteLikes.map(l => l.noteId))
    const likedFlashcardIds = new Set(flashcardLikes.map(l => l.flashcardSetId))
    const reportedNoteIds = new Set(noteReports.map(r => r.noteId))
    const reportedFlashcardIds = new Set(flashcardReports.map(r => r.flashcardSetId))

    const notesWithFlags = notes.map(note => ({
      ...note,
      isBookmarked: true,
      isLiked: likedNoteIds.has(note.id),
      isReported: reportedNoteIds.has(note.id)
    }))

    const flashcardsWithFlags = flashcards.map(flashcard => ({
      ...flashcard,
      isBookmarked: true,
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
    console.error("Bookmarks API error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = Number(session.user.id)
    const body = await req.json()
    
    const { contentId, contentType } = body

    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (contentType !== "note" && contentType !== "flashcard") {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      )
    }

    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId,
        contentType,
        ...(contentType === "note" 
          ? { noteId: Number(contentId) }
          : { flashcardSetId: Number(contentId) }
        )
      }
    })

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id
        }
      })

      return NextResponse.json(
        { 
          message: "Bookmark removed",
          isBookmarked: false 
        },
        { status: 200 }
      )
    } else {
      let category = null
      
      if (contentType === "note") {
        const note = await prisma.note.findUnique({
          where: { id: Number(contentId) },
          select: { category: true }
        })
        category = note?.category || null
      } else {
        const flashcard = await prisma.flashcardSet.findUnique({
          where: { id: Number(contentId) },
          select: { category: true }
        })
        category = flashcard?.category || null
      }

      await prisma.bookmark.create({
        data: {
          userId,
          contentType,
          category,
          ...(contentType === "note"
            ? { noteId: Number(contentId) }
            : { flashcardSetId: Number(contentId) }
          )
        }
      })

      return NextResponse.json(
        { 
          message: "Bookmark added",
          isBookmarked: true 
        },
        { status: 200 }
      )
    }
  } catch (err) {
    console.error("Toggle bookmark error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}