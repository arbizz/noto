"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "../ui/button"
import { LucideBookmark, LucideGlobe, LucideHome, LucideLayers, LucideLogOut, LucidePanelLeft, LucideSettings, LucideStickyNote, LucideUser, LucideUsers } from "lucide-react"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Separator } from "../ui/separator"

function UserSidebar() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <>
      <aside className={`${isOpen ? "w-64" : "w-16"} sticky top-0 flex flex-col justify-between h-screen bg-sidebar ring ring-sidebar-ring transition-all duration-200 ease-linear`}>
        <div>
          <div className="relative h-16">
            <Link
              href="/dashboard"
              className="absolute top-3 left-3 p-2 size-fit rounded-sm hover:bg-sidebar-accent"
            >
              <Image src="/placeholder.svg" alt="Noto logo" width={24} height={24} />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute top-3 right-3 p-2 size-fit z-10 rounded-sm bg-sidebar hover:bg-sidebar-accent"
            >
              <LucidePanelLeft size={24} className="size-fit" />
            </Button>
          </div>
          <Separator />
          <nav className="flex flex-col items-center justify-center p-3 gap-2">
            <SidebarLink href="/dashboard" label="Dashboard">
              <LucideHome size={24} className="size-fit" />
            </SidebarLink>
            <SidebarLink href="/notes" label="Notes">
              <LucideStickyNote size={24} className="size-fit" />
            </SidebarLink>
            <SidebarLink href="/flashcards" label="Flashcards">
              <LucideLayers size={24} className="size-fit" />
            </SidebarLink>
            <SidebarLink href="/discover" label="Discover">
              <LucideGlobe size={24} className="size-fit" />
            </SidebarLink>
            <SidebarLink href="/bookmarks" label="Bookmarks">
              <LucideBookmark size={24} className="size-fit" />
            </SidebarLink>
            <SidebarLink href="/following" label="Following">
              <LucideUsers size={24} className="size-fit" />
            </SidebarLink>
            <SidebarLink href="/profile" label="Profile">
              <LucideUser size={24} className="size-fit" />
            </SidebarLink>
          </nav>
        </div>
        <div className="p-3">
          <Button variant="destructive" size="icon" onClick={() => signOut()} className="flex items-center justify-start gap-2 h-fit w-full">
            <span className="p-2">
              <LucideLogOut size={24} className="size-fit" />
            </span>
            <p className="overflow-x-hidden">Sign out</p>
          </Button>
        </div>
      </aside>
    </>
  )
}

function SidebarLink({
  children,
  href,
  label,
}: {
  children: React.ReactNode,
  href: string,
  label: string,
}) {
  const pathname = usePathname()
  const isActive = pathname == href

  return (
    <Button
      variant="ghost"
      className={`h-fit w-full p-2 ${isActive && "bg-sidebar-accent text-sidebar-accent-foreground"}`}
      asChild
    >
      <Link href={href} className="flex flex-row items-center justify-start p-2 gap-2 w-full">
        <span>{children}</span>
        <p className="overflow-x-hidden">{label}</p>
      </Link>
    </Button>
  )
}

export { UserSidebar }