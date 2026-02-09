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

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access only" },
        { status: 403 }
      )
    }

    const [
      totalUsers,
      totalNotes,
      totalFlashcards,
      totalReports,
      pendingReports,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      publicNotes,
      publicFlashcards
    ] = await Promise.all([
      prisma.user.count(),
      
      prisma.content.count({
        where: { contentType: 'note' }
      }),
      
      prisma.content.count({
        where: { contentType: 'flashcard' }
      }),
      
      prisma.report.count(),
      
      prisma.report.count({
        where: { status: "pending" }
      }),
      
      prisma.user.count({
        where: { status: "active" }
      }),
      
      prisma.user.count({
        where: { status: "suspended" }
      }),
      
      prisma.user.count({
        where: { status: "banned" }
      }),
      
      prisma.content.count({
        where: {
          contentType: 'note',
          visibility: "public"
        }
      }),
      
      prisma.content.count({
        where: {
          contentType: 'flashcard',
          visibility: "public"
        }
      })
    ])

    const recentReports = await prisma.report.findMany({
      select: {
        id: true,
        contentType: true,
        reason: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        content: {
          select: {
            id: true,
            title: true,
            contentType: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            contents: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    const notesByCategory = await prisma.content.groupBy({
      by: ['category'],
      where: {
        contentType: 'note'
      },
      _count: {
        id: true
      }
    })

    const flashcardsByCategory = await prisma.content.groupBy({
      by: ['category'],
      where: {
        contentType: 'flashcard'
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json(
      {
        message: "Admin dashboard data retrieved successfully",
        data: {
          stats: {
            users: {
              total: totalUsers,
              active: activeUsers,
              suspended: suspendedUsers,
              banned: bannedUsers
            },
            content: {
              totalNotes,
              totalFlashcards,
              publicNotes,
              publicFlashcards
            },
            reports: {
              total: totalReports,
              pending: pendingReports,
              reviewed: totalReports - pendingReports
            }
          },
          recents: {
            reports: recentReports,
            users: recentUsers
          },
          categories: {
            notes: notesByCategory,
            flashcards: flashcardsByCategory
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