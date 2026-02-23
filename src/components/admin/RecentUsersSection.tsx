import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LucideUsers } from "lucide-react"
import type { AdminDashboardUser } from "@/types/shared/dashboard"

interface RecentUsersSectionProps {
  users: AdminDashboardUser[]
  loading: boolean
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    suspended: "secondary",
    banned: "destructive",
    pending: "outline",
    reviewed: "secondary",
    resolved: "default",
    rejected: "destructive",
  }
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>
}

export function RecentUsersSection({ users, loading }: RecentUsersSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <LucideUsers className="h-5 w-5" />
          Recent Users
        </h2>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <LucideUsers className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No users yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  )
}