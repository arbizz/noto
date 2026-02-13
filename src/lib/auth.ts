import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/generated/prisma/enums"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY!,
      from: process.env.AUTH_RESEND_EMAIL_FROM!,
    })
  ],
  callbacks: {
    async signIn({ user }) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
        select: { status: true, role: true }
      })

      if (!existingUser) {
        return true
      }

      if (existingUser.status !== "active") {
        return false
      }

      if (user.email === process.env.ADMIN_EMAIL && existingUser.role !== UserRole.admin) {
        await prisma.user.update({
          where: { email: user.email! },
          data: { role: UserRole.admin }
        })
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true, name: true }
        })

        token.id = dbUser?.id || user.id
        token.role = dbUser?.role || user.role
        token.name = dbUser?.name || user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.name = token.name as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-request"
  },
})