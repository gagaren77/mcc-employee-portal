import { auth } from "@/auth"

/**
 * Returns the current session, or throws/redirects if not authorized.
 * Use in server components or server actions.
 */
export async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED")
  }
  return session
}

/**
 * Requires the user to have one of the specified roles.
 * Throws if not authorized.
 */
export async function requireRole(roles: string[]) {
  const session = await requireUser()
  if (!roles.includes(session.user.role)) {
    throw new Error("FORBIDDEN")
  }
  return session
}

/**
 * Checks whether the given user is an Okta/SSO user (has an Account
 * row with a non-credentials provider). Such users cannot change their
 * password inside the portal — they must do it at their IdP.
 */
export async function isExternalUser(userId: string): Promise<boolean> {
  const { prisma } = await import("@/lib/prisma")
  const account = await prisma.account.findFirst({
    where: {
      userId,
      NOT: { provider: "credentials" },
    },
  })
  return !!account
}
