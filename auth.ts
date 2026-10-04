import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Okta OIDC provider — fill in your Okta credentials in .env
// import Okta from "next-auth/providers/okta"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      department?: string | null
      title?: string | null
    }
  }
  interface User {
    role: string
    department?: string | null
    title?: string | null
  }
}

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) return null
        if (!user.isActive) return null

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          department: user.department,
          title: user.title,
        }
      },
    }),

    // ─── Okta SSO ──────────────────────────────────────────────────────────
    // Uncomment and fill in your Okta credentials in .env to enable Okta SSO
    //
    // Okta({
    //   clientId: process.env.OKTA_CLIENT_ID!,
    //   clientSecret: process.env.OKTA_CLIENT_SECRET!,
    //   issuer: process.env.OKTA_ISSUER!,
    // }),
    // ───────────────────────────────────────────────────────────────────────
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.department = (user as any).department
        token.title = (user as any).title
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.department = token.department as string | null
        session.user.title = token.title as string | null
      }
      return session
    },
  },
})
