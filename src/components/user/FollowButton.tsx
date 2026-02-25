"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LucideUserPlus, LucideUserCheck, LucideLoader2 } from "lucide-react"
import { toast } from "sonner"

interface FollowButtonProps {
    userId: number
    initialIsFollowing: boolean
    onToggle?: (isFollowing: boolean) => void
    size?: "default" | "sm" | "lg" | "icon"
}

export function FollowButton({ userId, initialIsFollowing, onToggle, size = "default" }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [isLoading, setIsLoading] = useState(false)

    async function handleToggle() {
        setIsLoading(true)
        try {
            const res = await fetch("/api/follow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ followingId: userId })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to toggle follow")
            }

            const data = await res.json()
            setIsFollowing(data.isFollowing)
            onToggle?.(data.isFollowing)

            toast(data.isFollowing ? "Followed" : "Unfollowed", {
                description: data.message
            })
        } catch (error) {
            console.error("Follow toggle error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to toggle follow")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleToggle}
            disabled={isLoading}
            variant={isFollowing ? "outline" : "default"}
            size={size}
            className="gap-2"
        >
            {isLoading ? (
                <LucideLoader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
                <LucideUserCheck className="h-4 w-4" />
            ) : (
                <LucideUserPlus className="h-4 w-4" />
            )}
            {isFollowing ? "Following" : "Follow"}
        </Button>
    )
}
