import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"
import { NextRequest, NextResponse } from "next/server"

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
        const { followingId } = body

        if (!followingId) {
            return NextResponse.json(
                { error: "Missing followingId" },
                { status: 400 }
            )
        }

        const targetId = Number(followingId)

        if (userId === targetId) {
            return NextResponse.json(
                { error: "Cannot follow yourself" },
                { status: 400 }
            )
        }

        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: targetId },
            select: { id: true, name: true }
        })

        if (!targetUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Toggle follow
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetId
                }
            }
        })

        if (existingFollow) {
            await prisma.follow.delete({
                where: { id: existingFollow.id }
            })

            return NextResponse.json(
                {
                    message: "Unfollowed",
                    isFollowing: false
                },
                { status: 200 }
            )
        } else {
            await prisma.follow.create({
                data: {
                    followerId: userId,
                    followingId: targetId
                }
            })

            // Send notification to the followed user
            const followerUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true }
            })

            await createNotification({
                userId: targetId,
                type: "new_follower",
                title: "New Follower",
                message: `${followerUser?.name || "Someone"} started following you`,
                link: `/user/${userId}`
            })

            return NextResponse.json(
                {
                    message: "Followed",
                    isFollowing: true
                },
                { status: 200 }
            )
        }
    } catch (err) {
        console.error("Follow toggle error:", err)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
