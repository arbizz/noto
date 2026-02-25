"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { FollowButton } from "@/components/user/FollowButton"
import { LucideUsers, LucideCalendar, LucideStickyNote } from "lucide-react"

interface UserProfileHeaderProps {
    user: {
        id: number
        name: string | null
        image: string | null
        createdAt: string
        followersCount: number
        followingCount: number
        isFollowing: boolean
        isOwnProfile: boolean
    }
    onFollowToggle?: (isFollowing: boolean) => void
}

export function UserProfileHeader({ user, onFollowToggle }: UserProfileHeaderProps) {
    return (
        <Card>
            <CardContent className="flex items-center gap-6 p-6">
                {/* Avatar */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name || "User"}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary">
                            {(user.name || "?")[0]?.toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-bold truncate">{user.name || "Unnamed User"}</h2>
                        {!user.isOwnProfile && (
                            <FollowButton
                                userId={user.id}
                                initialIsFollowing={user.isFollowing}
                                onToggle={onFollowToggle}
                            />
                        )}
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <LucideUsers className="h-4 w-4" />
                            <strong className="text-foreground">{user.followersCount}</strong> followers
                        </span>
                        <span className="flex items-center gap-1.5">
                            <LucideStickyNote className="h-4 w-4" />
                            <strong className="text-foreground">{user.followingCount}</strong> following
                        </span>
                        <span className="flex items-center gap-1.5">
                            <LucideCalendar className="h-4 w-4" />
                            Joined {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                month: "long",
                                year: "numeric"
                            })}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
