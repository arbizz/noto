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
        const targetId = Number(req.nextUrl.searchParams.get("userId"))

        if (!targetId || isNaN(targetId)) {
            return NextResponse.json(
                { error: "Missing or invalid userId" },
                { status: 400 }
            )
        }

        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetId
                }
            }
        })

        return NextResponse.json(
            { isFollowing: !!follow },
            { status: 200 }
        )
    } catch (err) {
        console.error("Follow status error:", err)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
