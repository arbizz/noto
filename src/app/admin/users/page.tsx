"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { FilterConfig, InputFilter } from "@/components/shared/InputFilter"
import { PagePagination } from "@/components/shared/PagePagination"
import { PaginationMeta } from "@/types/shared/pagination"
import { UserStatus } from "@/generated/prisma/enums"
import { LucideSearch } from "lucide-react"

type UserSummary = {
  id: number
  name: string | null
  email: string
  image: string | null
  role: "user" | "admin"
  status: UserStatus
  score: number
  createdAt: Date
  _count: {
    contents: number
    reports: number
  }
}

type StatusFilter = UserStatus | "all"

export default function AdminUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [users, setUsers] = useState<UserSummary[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "")
  const [status, setStatus] = useState<StatusFilter>(
    (searchParams.get("status") as UserStatus) ?? "all"
  )
  const [order, setOrder] = useState<"asc" | "desc">(
    searchParams.get("order") === "asc" ? "asc" : "desc"
  )
  const [scoreMin, setScoreMin] = useState(searchParams.get("scoreMin") ?? "")
  const [scoreMax, setScoreMax] = useState(searchParams.get("scoreMax") ?? "")

  const handleUpdateQuery = useCallback(
    (paramsObj: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(paramsObj)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      router.push(`?${params.toString()}`)
    },
    [searchParams, router]
  )

  function handleSearch() {
    setSearch(searchInput)
    handleUpdateQuery({ search: searchInput || undefined, page: undefined })
  }

  function getStatusBadgeVariant(status: UserStatus) {
    switch (status) {
      case "active":
        return "outline"
      case "suspended":
        return "secondary"
      case "banned":
        return "destructive"
      default:
        return "default"
    }
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/users?${searchParams.toString()}`, {
          method: "GET",
        })

        if (!res.ok) throw new Error("Failed to fetch users")

        const data = await res.json()
        const { users, pagination }: { users: UserSummary[]; pagination: PaginationMeta } = data

        const requestedPage = parseInt(searchParams.get("page") ?? "1")

        if (requestedPage > pagination.totalPages && pagination.totalPages > 0) {
          handleUpdateQuery({ page: String(pagination.totalPages) })
          return
        }

        if (requestedPage < 1) {
          handleUpdateQuery({ page: "1" })
          return
        }

        setUsers(users)
        setPagination(pagination)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [searchParams, handleUpdateQuery])

  const filters: FilterConfig[] = [
    {
      type: "status",
      value: status,
      onChange: (value) => {
        const v = value as StatusFilter
        setStatus(v)
        handleUpdateQuery({ status: v === "all" ? undefined : v, page: undefined })
      },
      placeholder: "Status",
    },
    {
      type: "order",
      value: order,
      onChange: (value) => {
        const v = value as "asc" | "desc"
        setOrder(v)
        handleUpdateQuery({ order: v })
      },
    },
  ]

  return (
    <>
      <section className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          Manage and review all registered users
        </p>
      </section>

      <section className="mb-8 flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
        {/* Search */}
        <div className="flex w-full gap-3">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch()
            }}
            className="flex-1"
          />
          <Button type="button" size="icon" onClick={handleSearch}>
            <LucideSearch />
          </Button>
        </div>

        {/* Filters */}
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
          {/* Status */}
          <div className="space-y-2">
            <Label className="ml-1">Status:</Label>
            <Select
              value={status}
              onValueChange={(value) => {
                const v = value as StatusFilter
                setStatus(v)
                handleUpdateQuery({ status: v === "all" ? undefined : v, page: undefined })
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label className="ml-1">Order:</Label>
            <Select
              value={order}
              onValueChange={(value) => {
                const v = value as "asc" | "desc"
                setOrder(v)
                handleUpdateQuery({ order: v })
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest</SelectItem>
                <SelectItem value="asc">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Score Min */}
          <div className="space-y-2">
            <Label className="ml-1">Min Score:</Label>
            <Input
              type="number"
              placeholder="0"
              min={0}
              max={100}
              value={scoreMin}
              onChange={(e) => setScoreMin(e.target.value)}
              onBlur={() =>
                handleUpdateQuery({ scoreMin: scoreMin || undefined, page: undefined })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  handleUpdateQuery({ scoreMin: scoreMin || undefined, page: undefined })
              }}
            />
          </div>

          {/* Score Max */}
          <div className="space-y-2">
            <Label className="ml-1">Max Score:</Label>
            <Input
              type="number"
              placeholder="100"
              min={0}
              max={100}
              value={scoreMax}
              onChange={(e) => setScoreMax(e.target.value)}
              onBlur={() =>
                handleUpdateQuery({ scoreMax: scoreMax || undefined, page: undefined })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  handleUpdateQuery({ scoreMax: scoreMax || undefined, page: undefined })
              }}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No users found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Contents</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name ?? "(no name)"}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"} className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)} className="capitalize">
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono font-semibold ${user.score <= 15
                          ? "text-destructive"
                          : user.score <= 30
                            ? "text-yellow-500"
                            : "text-green-600"
                          }`}>
                          {user.score}
                        </span>
                      </TableCell>
                      <TableCell>{user._count.contents}</TableCell>
                      <TableCell>{user._count.reports}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 flex justify-center">
        {pagination && pagination.totalPages > 1 && !isLoading && (
          <PagePagination pagination={pagination} searchParams={searchParams} />
        )}
      </section>
    </>
  )
}