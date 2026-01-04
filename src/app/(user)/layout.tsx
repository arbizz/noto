import { UserSidebar } from "@/components/user/Sidebar"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="flex">
        <UserSidebar />
        <main className="flex-1 min-w-0 p-4">
          {children}
        </main>
      </div>
    </>
  )
}