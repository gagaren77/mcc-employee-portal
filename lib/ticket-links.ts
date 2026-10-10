import { prisma } from "@/lib/prisma"
import { appUrl } from "@/lib/app-url"
import { newToken } from "@/lib/tokens"

/**
 * Ticket links in emails open a read-only page WITHOUT login (/t/<token>) while this is on.
 * Set TICKET_LINKS_PUBLIC=false (e.g. once everyone signs in with Okta) and every link requires login instead.
 */
export const publicLinksEnabled = () => (process.env.TICKET_LINKS_PUBLIC ?? "true").toLowerCase() !== "false"

/** Older tickets have no token yet; create one on first use. */
export async function ensureAccessToken(ticket: { id: string; accessToken?: string | null }): Promise<string> {
  if (ticket.accessToken) return ticket.accessToken
  await prisma.ticket.updateMany({ where: { id: ticket.id, accessToken: null }, data: { accessToken: newToken() } })
  const t = await prisma.ticket.findUnique({ where: { id: ticket.id }, select: { accessToken: true } })
  return t!.accessToken!
}

/** The link to put in emails for a ticket. */
export async function ticketLink(ticket: { id: string; accessToken?: string | null }): Promise<string> {
  return publicLinksEnabled() ? appUrl(`/t/${await ensureAccessToken(ticket)}`) : appUrl(`/tickets/${ticket.id}`)
}
