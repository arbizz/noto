import { AdminSidebar } from "@/components/admin/Sidebar"
import { Suspense } from "react"

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="flex">
        <AdminSidebar />
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        }>
          <main className="flex-1 min-w-0 p-8">
            {children}
          </main>
        </Suspense>
      </div>
    </>
  )
}