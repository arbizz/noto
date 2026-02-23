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
        select: { status: true }
      })

      if (existingUser && existingUser.status !== "active") {
        return false
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true, name: true }
        })

        const isAdminEmail = user.email === process.env.ADMIN_EMAIL
        const currentRole = dbUser?.role

        if (isAdminEmail && currentRole !== UserRole.admin) {
          await prisma.user.update({
            where: { email: user.email! },
            data: { role: UserRole.admin }
          })
          token.role = UserRole.admin
        } else {
          token.role = currentRole
        }

        token.id = dbUser?.id || user.id
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