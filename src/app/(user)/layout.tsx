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
        <main>
          {children}
        </main>
      </div>
    </>
  )
}