import { prisma } from "@/lib/prisma"

/**
 * Check and apply passive score recovery for a user.
 * +1 point per 7 days of active status, max 100.
 * Only applies to active users without pending reports.
 */
export async function checkScoreRecovery(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { score: true, status: true, updatedAt: true }
    })

    if (!user || user.status !== "active" || user.score >= 100) return

    // Check if user has any pending reports against their content
    const pendingReports = await prisma.report.findFirst({
        where: {
            content: { userId },
            status: "pending"
        }
    })

    if (pendingReports) return

    const now = new Date()
    const lastUpdate = new Date(user.updatedAt)
    const daysSinceUpdate = Math.floor(
        (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    )

    const recoveryPoints = Math.floor(daysSinceUpdate / 7) // +1 per week

    if (recoveryPoints > 0) {
        const newScore = Math.min(100, user.score + recoveryPoints)
        await prisma.user.update({
            where: { id: userId },
            data: { score: newScore }
        })
    }
}
