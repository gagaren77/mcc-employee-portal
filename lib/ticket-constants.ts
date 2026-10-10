// Pure constants/helpers — safe to import from client components (no Prisma).
export const STAFF_ROLES = ["IT", "ADMIN"] as const
export const isStaff = (role?: string | null) => !!role && (STAFF_ROLES as readonly string[]).includes(role)

export const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"] as const
export const ACTIVE_STATUSES = ["OPEN", "IN_PROGRESS", "WAITING"] as const
export const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const
export const CATEGORIES = ["Account & Password", "Hardware", "Network", "Software", "Printing", "Equipment Request", "Other"] as const

export const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  WAITING: "Waiting on requester",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
}

export const ticketNumber = (n: number) => `MCC-${n}`

/** Requesters see their own tickets (by account or by email); staff see everything. */
export function canViewTicket(
  user: { id: string; email?: string | null; role: string },
  ticket: { requesterId: string | null; requesterEmail: string }
) {
  if (isStaff(user.role)) return true
  if (ticket.requesterId && ticket.requesterId === user.id) return true
  return !!user.email && ticket.requesterEmail.toLowerCase() === user.email.toLowerCase()
}


// ─── Attachments ─────────────────────────────────────────
export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024
export const MAX_FILES_PER_UPLOAD = 10
export const MAX_ATTACHMENTS_PER_TICKET = 60
// Executable/script types are never stored.
export const BLOCKED_EXTENSIONS = [
  "exe", "bat", "cmd", "com", "scr", "msi", "msp", "js", "jse", "vbs", "vbe", "wsf", "ps1", "psm1",
  "jar", "dll", "lnk", "hta", "reg", "apk", "app", "sh", "iso", "cpl", "gadget",
]
export const extOf = (name: string) => (name.includes(".") ? name.split(".").pop()!.toLowerCase() : "")
export const isBlockedFile = (name: string) => BLOCKED_EXTENSIONS.includes(extOf(name))
export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
