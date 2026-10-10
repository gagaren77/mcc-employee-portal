/**
 * Public base URL of the portal. Every link we put in an email MUST be built
 * with this helper so moving to a new domain is a config change only.
 */
export function appUrl(path = ""): string {
  const base = (process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/+$/, "")
  return path ? `${base}${path.startsWith("/") ? path : "/" + path}` : base
}
