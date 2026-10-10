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

