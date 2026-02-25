"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ContentCategory, ReportReason } from "@/generated/prisma/enums"
import { toast } from "sonner"

import { NFCard } from "@/components/user/NFCard"
import { UserProfileHeader } from "@/components/user/UserProfileHeader"
import { ReportDialog } from "@/components/user/ReportDialog"
import { PagePagination } from "@/components/shared/PagePagination"
import { FilterConfig, InputFilter } from "@/components/shared/InputFilter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CategoryFilter } from "@/types/shared/filter"
import { PaginationMeta } from "@/types/shared/pagination"
import { ContentWithExtras } from "@/types/shared/nf-extras"

type UserProfile = {
    id: number
    name: string | null
    image: string | null
    createdAt: string
    followersCount: number
    followingCount: number
    isFollowing: boolean
    isOwnProfile: boolean
}

type ReportDialogState = {
    open: boolean
    contentId: number | null
    contentType: "note" | "flashcard" | null
    contentTitle: string
}

export default function UserPublicProfilePage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [user, setUser] = useState<UserProfile | null>(null)
    const [notes, setNotes] = useState<ContentWithExtras[]>([])
    const [flashcards, setFlashcards] = useState<ContentWithExtras[]>([])
    const [npagination, setNPagination] = useState<PaginationMeta | null>(null)
    const [fpagination, setFPagination] = useState<PaginationMeta | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const [reportDialog, setReportDialog] = useState<ReportDialogState>({
        open: false,
        contentId: null,
        contentType: null,
        contentTitle: ""
    })

    const [search, setSearch] = useState(() => searchParams.get("search") ?? "")
    const [category, setCategory] = useState<CategoryFilter>(() => {
        const cat = searchParams.get("category")
        return (cat && Object.values(ContentCategory).includes(cat as ContentCategory))
            ? (cat as ContentCategory)
            : "all"
    })
    const [order, setOrder] = useState<"asc" | "desc">(() => {
        const value = searchParams.get("order")
        return value === "asc" ? "asc" : "desc"
    })
    const [type, setType] = useState<"note" | "card">(() => {
        const typeParam = searchParams.get("type")
        return typeParam === "card" ? "card" : "note"
    })

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

    // Content interactions
    async function handleToggleBookmark(contentId: number, contentType: "note" | "flashcard", e: React.MouseEvent) {
        e.stopPropagation()
        try {
            const res = await fetch("/api/bookmarks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentId, contentType })
            })
            if (!res.ok) throw new Error("Failed to toggle bookmark")
            const data = await res.json()

            const updater = (prev: ContentWithExtras[]) =>
                prev.map(item => item.id === contentId ? { ...item, isBookmarked: data.isBookmarked } : item)

            if (contentType === "note") setNotes(updater)
            else setFlashcards(updater)

            toast(data.isBookmarked ? "Bookmarked" : "Bookmark removed", { description: data.message })
        } catch (error) {
            console.error("Error toggling bookmark:", error)
            toast.error("Error toggling bookmark")
        }
    }

    async function handleToggleLike(contentId: number, contentType: "note" | "flashcard", e: React.MouseEvent) {
        e.stopPropagation()
        try {
            const res = await fetch("/api/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentId, contentType })
            })
            if (!res.ok) throw new Error("Failed to toggle like")
            const data = await res.json()

            const updater = (prev: ContentWithExtras[]) =>
                prev.map(item =>
                    item.id === contentId
                        ? { ...item, isLiked: data.isLiked, _count: { ...item._count, likes: item._count.likes + (data.isLiked ? 1 : -1) } }
                        : item
                )

            if (contentType === "note") setNotes(updater)
            else setFlashcards(updater)

            toast(data.isLiked ? "Liked" : "Like removed", { description: data.message })
        } catch (error) {
            console.error("Error toggling like:", error)
            toast.error("Error toggling like")
        }
    }

    function handleOpenReportDialog(contentId: number, contentType: "note" | "flashcard", contentTitle: string, isReported: boolean, e: React.MouseEvent) {
        e.stopPropagation()
        if (isReported) {
            toast.info("Already reported", { description: "You have already reported this content" })
            return
        }
        setReportDialog({ open: true, contentId, contentType, contentTitle })
    }

    async function handleSubmitReport(contentId: number, contentType: "note" | "flashcard", reason: ReportReason, description?: string) {
        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentId, contentType, reason, description })
            })
            const data = await res.json()
            if (!res.ok) {
                if (res.status === 400 && data.isReported) {
                    toast.info("Already reported", { description: data.error })
                    return
                }
                throw new Error(data.error || "Failed to submit report")
            }

            const updater = (prev: ContentWithExtras[]) =>
                prev.map(item => item.id === contentId ? { ...item, isReported: true } : item)

            if (contentType === "note") setNotes(updater)
            else setFlashcards(updater)

            toast.success("Content reported", { description: data.message })
        } catch (error) {
            console.error("Error submitting report:", error)
            toast.error(error instanceof Error ? error.message : "Error submitting report")
        }
    }

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const res = await fetch(
                    `/api/users/${id}/public?${searchParams.toString()}`,
                    { method: "GET" }
                )

                if (!res.ok) {
                    if (res.status === 404) {
                        toast.error("User not found")
                        router.push("/discover")
                        return
                    }
                    throw new Error("Failed to fetch data")
                }

                const data = await res.json()
                setUser(data.user)
                setNotes(data.notes)
                setFlashcards(data.flashcards)
                setNPagination(data.pagination.npagination)
                setFPagination(data.pagination.fpagination)

                // Page bounds check
                const requestedPage = parseInt(searchParams.get("page") ?? "1")
                const activePag = type === "note" ? data.pagination.npagination : data.pagination.fpagination

                if (requestedPage > activePag.totalPages && activePag.totalPages > 0) {
                    handleUpdateQuery({ page: String(activePag.totalPages) })
                    return
                }
                if (requestedPage < 1) {
                    handleUpdateQuery({ page: "1" })
                    return
                }
            } catch (error) {
                console.error("Error fetching user profile:", error)
                setUser(null)
                setNotes([])
                setFlashcards([])
            } finally {
                setIsLoading(false)
            }
        }

        if (id) fetchData()
    }, [id, searchParams, type, handleUpdateQuery, router])

    const activePagination = type === "note" ? npagination : fpagination

    const filters: FilterConfig[] = [
        {
            type: "search",
            placeholder: "Search",
            value: search,
            onChange: setSearch,
            onSearch: () => handleUpdateQuery({ search: search || undefined, page: "1" }),
        },
        {
            type: "category",
            placeholder: "Category",
            value: category,
            onChange: (value) => {
                const v = value as CategoryFilter
                setCategory(v)
                handleUpdateQuery({ category: v === "all" ? undefined : v, page: "1" })
            }
        },
        {
            type: "order",
            placeholder: "Order",
            value: order,
            onChange: (value) => {
                const v = value as "asc" | "desc"
                setOrder(v)
                handleUpdateQuery({ order: v, page: "1" })
            },
        }
    ]

    if (isLoading && !user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-muted-foreground">User not found</p>
            </div>
        )
    }

    return (
        <>
            <section className="mb-6">
                <UserProfileHeader
                    user={user}
                    onFollowToggle={(isFollowing) => {
                        setUser(prev => prev ? {
                            ...prev,
                            isFollowing,
                            followersCount: prev.followersCount + (isFollowing ? 1 : -1)
                        } : prev)
                    }}
                />
            </section>

            <section className="mb-8 flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Public Content</h3>

                <Tabs
                    value={type}
                    onValueChange={(value) => {
                        const v = value as "note" | "card"
                        setType(v)
                        handleUpdateQuery({ type: v, page: "1" })
                    }}
                >
                    <TabsList className="w-full">
                        <TabsTrigger value="note">Notes</TabsTrigger>
                        <TabsTrigger value="card">Flashcards</TabsTrigger>
                    </TabsList>

                    <InputFilter
                        filters={filters}
                        showSearch
                        showCategory
                        showOrder
                    />

                    <TabsContent value="note" className="mt-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-muted-foreground">Loading...</p>
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-muted-foreground">No public notes</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
                                {notes.map((n) => (
                                    <NFCard
                                        key={n.id}
                                        content={n}
                                        onClick={() => router.push(`/discover/note-${n.id}`)}
                                        onBookmark={(e) => handleToggleBookmark(n.id, "note", e)}
                                        onLike={(e) => handleToggleLike(n.id, "note", e)}
                                        onReport={(e) => handleOpenReportDialog(n.id, "note", n.title, n.isReported, e)}
                                        showActions={!user.isOwnProfile}
                                        hideBadge
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="card" className="mt-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-muted-foreground">Loading...</p>
                            </div>
                        ) : flashcards.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-muted-foreground">No public flashcards</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
                                {flashcards.map((f) => (
                                    <NFCard
                                        key={f.id}
                                        content={f}
                                        onClick={() => router.push(`/discover/flashcard-${f.id}`)}
                                        onBookmark={(e) => handleToggleBookmark(f.id, "flashcard", e)}
                                        onLike={(e) => handleToggleLike(f.id, "flashcard", e)}
                                        onReport={(e) => handleOpenReportDialog(f.id, "flashcard", f.title, f.isReported, e)}
                                        showActions={!user.isOwnProfile}
                                        hideBadge
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </section>

            <section className="mt-10 flex justify-center">
                {activePagination && activePagination.totalPages > 1 && !isLoading && (
                    <PagePagination
                        pagination={activePagination}
                        searchParams={searchParams}
                    />
                )}
            </section>

            <ReportDialog
                open={reportDialog.open}
                onOpenChange={(open: boolean) => setReportDialog(prev => ({ ...prev, open }))}
                onSubmit={async (reason: ReportReason, description?: string) => {
                    await handleSubmitReport(
                        reportDialog.contentId!,
                        reportDialog.contentType!,
                        reason,
                        description
                    )
                }}
                contentTitle={reportDialog.contentTitle}
                contentType={reportDialog.contentType || "note"}
            />
        </>
    )
}
