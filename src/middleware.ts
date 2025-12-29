import { auth } from "@/auth"
import { NextResponse } from "next/server"

const publicRoutes = ["/", "/login", "/register"]
const userRoutes = ["/dashboard", "/flashcards", "/notes"]
const adminRoutes = ["/admin"]

export const runtime = "nodejs"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const user = req.auth?.user

  if (!user) {
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (publicRoutes.includes(pathname)) {
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
    return NextResponse.redirect(new URL("/dashboard", req.url))
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
    "/dashboard/:path*",
    "/flashcards/:path*",
    "/notes/:path*",
    "/admin/:path*",
  ],
}
