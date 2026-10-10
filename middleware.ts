import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isAuthPage = nextUrl.pathname.startsWith("/auth")
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth")
  // Token-protected pages/APIs that must work without a login (emailed approval links and ticket-tracking links).
  // Each route validates its own unguessable token.
  const isTokenLink = ["/t/", "/approve/", "/api/t/", "/api/approvals/"].some((p) => nextUrl.pathname.startsWith(p))
  const isHealth = nextUrl.pathname === "/api/health" // healthchecks have no session
  const isPublic = isAuthPage || isApiAuth || isTokenLink || isHealth

  // Allow public routes through
  if (isPublic) return NextResponse.next()

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
