import { AdminSidebar } from "@/components/admin/Sidebar"

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-8">
          {children}
        </main>
      </div>
    </>
  )
}