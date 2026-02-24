import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(session.user.id) },
            select: { status: true, suspendedUntil: true, score: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({
            status: user.status,
            suspendedUntil: user.suspendedUntil,
            score: user.score
        })
    } catch (err) {
        console.error("User status API error:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
