import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(session.user.id) },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                score: true,
                status: true,
                suspendedUntil: true,
                createdAt: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ user })
    } catch (err) {
        console.error("Profile GET error:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { name } = body as { name?: string }

        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { error: "Name must be at least 2 characters" },
                { status: 400 }
            )
        }

        if (name.trim().length > 50) {
            return NextResponse.json(
                { error: "Name must be at most 50 characters" },
                { status: 400 }
            )
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(session.user.id) },
            data: { name: name.trim() },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                score: true,
                status: true,
            },
        })

        return NextResponse.json({
            message: "Profile updated successfully",
            user: updatedUser,
        })
    } catch (err) {
        console.error("Profile PATCH error:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
