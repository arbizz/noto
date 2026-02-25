import { auth } from "@/lib/auth"
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
    const type = searchParams.get("type") || "following"
    const rawPage = searchParams.get("page")
    const rawSearch = searchParams.get("search")
    const limit = 12

    const page = rawPage && !isNaN(Number(rawPage)) && Number(rawPage) > 0
      ? Number(rawPage)
      : 1

    const search = rawSearch && rawSearch.trim().length > 0
      ? rawSearch.trim()
      : undefined

    const skip = (page - 1) * limit

    if (type === "following") {
      const where = {
        followerId: userId,
        ...(search && {
          following: {
            name: { contains: search }
          }
        })
      }

      const [totalItems, follows] = await Promise.all([
        prisma.follow.count({ where }),
        prisma.follow.findMany({
          where,
          include: {
            following: {
              select: {
                id: true,
                name: true,
                image: true,
                _count: {
                  select: {
                    followers: true,
                    contents: {
                      where: { visibility: "public" }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit
        })
      ])

      const totalPages = Math.ceil(totalItems / limit)

      return NextResponse.json({
        users: follows.map(f => ({
          id: f.following.id,
          name: f.following.name,
          image: f.following.image,
          followersCount: f.following._count.followers,
          publicContentCount: f.following._count.contents,
          followedAt: f.createdAt
        })),
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }, { status: 200 })
    } else {
      const where = {
        followingId: userId,
        ...(search && {
          follower: {
            name: { contains: search }
          }
        })
      }

      const [totalItems, follows] = await Promise.all([
        prisma.follow.count({ where }),
        prisma.follow.findMany({
          where,
          include: {
            follower: {
              select: {
                id: true,
                name: true,
                image: true,
                _count: {
                  select: {
                    followers: true,
                    contents: {
                      where: { visibility: "public" }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit
        })
      ])

      const totalPages = Math.ceil(totalItems / limit)

      return NextResponse.json({
        users: follows.map(f => ({
          id: f.follower.id,
          name: f.follower.name,
          image: f.follower.image,
          followersCount: f.follower._count.followers,
          publicContentCount: f.follower._count.contents,
          followedAt: f.createdAt
        })),
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }, { status: 200 })
    }
  } catch (err) {
    console.error("Follow list error:", err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
