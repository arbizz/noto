import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { ContentCategory } from "@/generated/prisma/enums"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
      const session = await auth()
      if (!session?.user) {
          return NextResponse.json(
              { error: "Unauthorized" },
              { status: 401 }
          )
      }

      const currentUserId = Number(session.user.id)
      const { id } = await params
      const targetUserId = Number(id)

      if (isNaN(targetUserId)) {
          return NextResponse.json(
              { error: "Invalid user ID" },
              { status: 400 }
          )
      }

      // Fetch user profile
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
          _count: {
            select: {
              followers: true,
              following: true
            }
          }
        }
      })

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }

      const followRecord = currentUserId !== targetUserId
        ? await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: targetUserId
            }
          }
        })
        : null

      const isFollowing = !!followRecord
      const isOwnProfile = currentUserId === targetUserId

      const searchParams = req.nextUrl.searchParams
      const rawCategory = searchParams.get("category")
      const rawOrder = searchParams.get("order")
      const rawSearch = searchParams.get("search")
      const rawPage = searchParams.get("page")
      const limit = 12

      const category = rawCategory && Object.values(ContentCategory).includes(rawCategory as ContentCategory)
        ? (rawCategory as ContentCategory)
        : undefined

      const order: "asc" | "desc" = rawOrder === "asc" ? "asc" : "desc"

      const search = rawSearch && rawSearch.trim().length > 0
        ? rawSearch.trim()
        : undefined

      const page = rawPage && !isNaN(Number(rawPage)) && Number(rawPage) > 0
        ? Number(rawPage)
        : 1

      const skip = (page - 1) * limit

      const baseWhere = {
        userId: targetUserId,
        visibility: "public" as const,
        ...(category && { category }),
        ...(search && { title: { contains: search } })
      }

      const [totalNotesCount, totalFlashcardsCount] = await Promise.all([
        prisma.content.count({
          where: { ...baseWhere, contentType: "note" }
        }),
        prisma.content.count({
          where: { ...baseWhere, contentType: "flashcard" }
        })
      ])

      const contentSelect = {
        id: true,
        title: true,
        description: true,
        contentType: true,
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

      const [notes, flashcards] = await Promise.all([
        prisma.content.findMany({
          where: { ...baseWhere, contentType: "note" },
          select: contentSelect,
          orderBy: { createdAt: order },
          skip,
          take: limit
        }),
        prisma.content.findMany({
          where: { ...baseWhere, contentType: "flashcard" },
          select: contentSelect,
          orderBy: { createdAt: order },
          skip,
          take: limit
        })
      ])

      const allContentIds = [...notes.map(n => n.id), ...flashcards.map(f => f.id)]

      const [likes, bookmarks, reports] = await Promise.all([
        prisma.like.findMany({
          where: { userId: currentUserId, contentId: { in: allContentIds } },
          select: { contentId: true, contentType: true }
        }),
        prisma.bookmark.findMany({
          where: { userId: currentUserId, contentId: { in: allContentIds } },
          select: { contentId: true, contentType: true }
        }),
        prisma.report.findMany({
          where: { userId: currentUserId, contentId: { in: allContentIds } },
          select: { contentId: true, contentType: true }
        })
      ])

      const likedIds = new Set(likes.map(l => `${l.contentType}-${l.contentId}`))
      const bookmarkedIds = new Set(bookmarks.map(b => `${b.contentType}-${b.contentId}`))
      const reportedIds = new Set(reports.map(r => `${r.contentType}-${r.contentId}`))

      const notesWithFlags = notes.map(note => ({
        ...note,
        isLiked: likedIds.has(`note-${note.id}`),
        isBookmarked: bookmarkedIds.has(`note-${note.id}`),
        isReported: reportedIds.has(`note-${note.id}`)
      }))

      const flashcardsWithFlags = flashcards.map(flashcard => ({
        ...flashcard,
        isLiked: likedIds.has(`flashcard-${flashcard.id}`),
        isBookmarked: bookmarkedIds.has(`flashcard-${flashcard.id}`),
        isReported: reportedIds.has(`flashcard-${flashcard.id}`)
      }))

      const totalNPages = Math.ceil(totalNotesCount / limit)
      const totalFPages = Math.ceil(totalFlashcardsCount / limit)

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
          createdAt: user.createdAt,
          followersCount: user._count.followers,
          followingCount: user._count.following,
          isFollowing,
          isOwnProfile
        },
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
      }, { status: 200 })
  } catch (err) {
    console.error("User public profile API error:", err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
