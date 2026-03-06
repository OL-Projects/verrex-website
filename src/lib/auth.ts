import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@/types/portal"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = (credentials.email as string).toLowerCase().trim()
        const password = credentials.password as string

        try {
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) return null

          const valid = await bcrypt.compare(password, user.password)
          if (!valid) return null

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role as UserRole
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
  pages: {
    signIn: "/portal/login",
    error: "/portal/login",
  },
})

// Helper functions for registration
export async function isEmailTaken(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  return !!user
}

export async function registerUser(data: {
  name: string
  email: string
  password: string
  role?: string
  company?: string
  phone?: string
}) {
  const hashed = await bcrypt.hash(data.password, 12)
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: hashed,
      role: data.role || "client",
      company: data.company || null,
      phone: data.phone || null,
    },
  })
}
