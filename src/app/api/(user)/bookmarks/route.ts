import { auth } from "@/auth"
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

    // Get user's likes
    const [noteLikes, flashcardLikes] = await Promise.all([
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
      })
    ])

    const likedNoteIds = new Set(noteLikes.map(l => l.noteId))
    const likedFlashcardIds = new Set(flashcardLikes.map(l => l.flashcardSetId))

    const notesWithLikes = notes.map(note => ({
      ...note,
      isBookmarked: true,
      isLiked: likedNoteIds.has(note.id)
    }))

    const flashcardsWithLikes = flashcards.map(flashcard => ({
      ...flashcard,
      isBookmarked: true,
      isLiked: likedFlashcardIds.has(flashcard.id)
    }))

    const totalNPages = Math.ceil(totalNotesCount / limit)
    const totalFPages = Math.ceil(totalFlashcardsCount / limit)

    return NextResponse.json(
      {
        notes: notesWithLikes,
        flashcards: flashcardsWithLikes,
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