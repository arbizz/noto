"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"

import { FollowButton } from "@/components/user/FollowButton"
import { PagePagination } from "@/components/shared/PagePagination"
import { FilterConfig, InputFilter } from "@/components/shared/InputFilter"
import { Card, CardContent } from "@/components/ui/card"
import { LucideUsers, LucideStickyNote } from "lucide-react"

import { PaginationMeta } from "@/types/shared/pagination"

interface FollowedUser {
    id: number
    name: string | null
    image: string | null
    followersCount: number
    publicContentCount: number
    followedAt: string
}

export default function FollowingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [users, setUsers] = useState<FollowedUser[]>([])
    const [pagination, setPagination] = useState<PaginationMeta | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState(() => searchParams.get("search") ?? "")

    const handleUpdateQuery = useCallback((paramsObj: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString())
        for (const [key, value] of Object.entries(paramsObj)) {
            if (value !== undefined && value !== "") {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        }
        router.push(`?${params.toString()}`)
    }, [searchParams, router])

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const res = await fetch(
                    `/api/follow/list?type=following&${searchParams.toString()}`,
                    { method: "GET" }
                )
                if (!res.ok) throw new Error("Failed to fetch")
                const data = await res.json()

                setUsers(data.users)
                setPagination(data.pagination)

                const requestedPage = parseInt(searchParams.get("page") ?? "1")
                if (requestedPage > data.pagination.totalPages && data.pagination.totalPages > 0) {
                    handleUpdateQuery({ page: String(data.pagination.totalPages) })
                    return
                }
                if (requestedPage < 1) {
                    handleUpdateQuery({ page: "1" })
                    return
                }
            } catch (error) {
                console.error("Error fetching following list:", error)
                toast.error("Failed to load following list")
                setUsers([])
                setPagination(null)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [searchParams, handleUpdateQuery])

    function handleUnfollow(userId: number) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        if (pagination) {
            setPagination(prev => prev ? { ...prev, totalItems: prev.totalItems - 1 } : prev)
        }
    }

    const filters: FilterConfig[] = [
        {
            type: "search",
            placeholder: "Search users",
            value: search,
            onChange: setSearch,
            onSearch: () => handleUpdateQuery({ search: search || undefined, page: "1" }),
        }
    ]

    return (
        <>
            <section className="mb-6 flex flex-col gap-1">
                <h1>Following</h1>
                <p>Users you are following</p>
            </section>

            <section className="mb-8 flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
                <InputFilter
                    filters={filters}
                    showSearch
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">
                            {search ? "No users found" : "You are not following anyone yet"}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {users.map((u) => (
                            <Card
                                key={u.id}
                                className="group cursor-pointer transition-all hover:border-primary/40 hover:shadow-md"
                                onClick={() => router.push(`/user/${u.id}`)}
                            >
                                <CardContent className="flex items-center gap-4 p-4">
                                    {/* Avatar */}
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                                        {u.image ? (
                                            <Image
                                                src={u.image}
                                                alt={u.name || "User"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-lg font-bold text-primary">
                                                {(u.name || "?")[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{u.name || "Unnamed User"}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <LucideUsers className="h-3 w-3" />
                                                {u.followersCount} followers
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <LucideStickyNote className="h-3 w-3" />
                                                {u.publicContentCount} public
                                            </span>
                                        </div>
                                    </div>

                                    {/* Unfollow button */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <FollowButton
                                            userId={u.id}
                                            initialIsFollowing={true}
                                            onToggle={(isFollowing) => {
                                                if (!isFollowing) handleUnfollow(u.id)
                                            }}
                                            size="sm"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            <section className="mt-10 flex justify-center">
                {pagination && pagination.totalPages > 1 && !isLoading && (
                    <PagePagination
                        pagination={pagination}
                        searchParams={searchParams}
                    />
                )}
            </section>
        </>
    )
}
