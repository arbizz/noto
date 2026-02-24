import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { checkScoreRecovery } from "@/lib/score-recovery"

const publicRoutes = ["/", "/login", "/register"]
const statusPages = ["/banned", "/suspended"]
const userRoutes = ["/dashboard", "/flashcards", "/notes", "/discover", "/bookmarks"]
const adminRoutes = ["/admin"]

export const runtime = "nodejs"

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const user = req.auth?.user

  // Not logged in
  if (!user) {
    if (publicRoutes.includes(pathname) || statusPages.includes(pathname)) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Logged in user on public routes → redirect to dashboard
  if (publicRoutes.includes(pathname)) {
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Enforce ban/suspend for non-admin users
  if (user.role === "user") {
    const dbUser = await prisma.user.findUnique({
      where: { id: Number(user.id) },
      select: { status: true, suspendedUntil: true, score: true }
    })

    if (dbUser) {
      // Auto-activate expired suspensions
      if (
        dbUser.status === "suspended" &&
        dbUser.suspendedUntil &&
        new Date(dbUser.suspendedUntil) <= new Date()
      ) {
        await prisma.user.update({
          where: { id: Number(user.id) },
          data: { status: "active", suspendedUntil: null }
        })
        // Status cleared — if on /suspended, redirect to dashboard
        if (pathname === "/suspended") {
          return NextResponse.redirect(new URL("/dashboard", req.url))
        }
      } else if (dbUser.status === "banned") {
        // Banned: only allow /banned page, block everything else
        if (pathname !== "/banned") {
          return NextResponse.redirect(new URL("/banned", req.url))
        }
        return NextResponse.next()
      } else if (dbUser.status === "suspended") {
        // Suspended: only allow /suspended page, block everything else
        if (pathname !== "/suspended") {
          return NextResponse.redirect(new URL("/suspended", req.url))
        }
        return NextResponse.next()
      }

      // Active user on /banned or /suspended → redirect to dashboard
      if (dbUser.status === "active" && statusPages.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

      // Score recovery check (only for active users, non-blocking)
      if (dbUser.status === "active" && dbUser.score < 100) {
        try {
          await checkScoreRecovery(Number(user.id))
        } catch {
          // Non-blocking
        }
      }
    }
  }

  if (userRoutes.some(route => pathname.startsWith(route))) {
    if (user.role !== "user") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
  }

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/banned",
    "/suspended",
    "/dashboard/:path*",
    "/flashcards/:path*",
    "/discover/:path*",
    "/bookmarks/:path*",
    "/notes/:path*",
    "/admin/:path*",
  ],
}
