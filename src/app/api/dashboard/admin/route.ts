import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    // Check if user is authenticated and is admin
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

    // Get all statistics
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
      // Total users
      prisma.user.count(),
      
      // Total notes
      prisma.note.count(),
      
      // Total flashcards
      prisma.flashcardSet.count(),
      
      // Total reports
      prisma.report.count(),
      
      // Pending reports
      prisma.report.count({
        where: { status: "pending" }
      }),
      
      // Active users
      prisma.user.count({
        where: { status: "active" }
      }),
      
      // Suspended users
      prisma.user.count({
        where: { status: "suspended" }
      }),
      
      // Banned users
      prisma.user.count({
        where: { status: "banned" }
      }),
      
      // Public notes
      prisma.note.count({
        where: { visibility: "public" }
      }),
      
      // Public flashcards
      prisma.flashcardSet.count({
        where: { visibility: "public" }
      })
    ])

    // Get recent reports (last 5)
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
        note: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        flashcardSet: {
          select: {
            id: true,
            title: true,
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

    // Get recent users (last 5)
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
            notes: true,
            flashcardSets: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Get content statistics by category
    const notesByCategory = await prisma.note.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    })

    const flashcardsByCategory = await prisma.flashcardSet.groupBy({
      by: ['category'],
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