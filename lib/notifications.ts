import { prisma } from "@/lib/prisma"
import { isStaff, ticketNumber } from "@/lib/ticket-constants"

export interface NotificationItem {
  id: string
  kind: "announcement" | "event" | "ticket"
  title: string
  text: string
  href: string
  at: string // ISO
  unread: boolean
}

const WINDOW_DAYS = 14
const snippet = (s: string, n = 90) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s).replace(/\s+/g, " ")

/**
 * What the bell shows for one user. Nothing is stored per notification: items are derived from
 * announcements, events and tickets in the last 14 days, and "unread" means newer than the user's
 * notificationsSeenAt.
 */
export async function loadNotifications(user: { id: string; email: string; name?: string | null; role: string }, seenAt: Date) {
  const floor = new Date(Date.now() - WINDOW_DAYS * 86_400_000)
  const staff = isStaff(user.role)
  const items: NotificationItem[] = []
  const push = (i: Omit<NotificationItem, "unread" | "at"> & { at: Date }) =>
    items.push({ ...i, at: i.at.toISOString(), unread: i.at > seenAt })

  const [announcements, events, mine, newTickets, assignedReplies, assignments] = await Promise.all([
    prisma.announcement.findMany({ where: { published: true, createdAt: { gte: floor }, NOT: { authorId: user.id } }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.event.findMany({ where: { published: true, createdAt: { gte: floor }, startDate: { gte: new Date() } }, orderBy: { createdAt: "desc" }, take: 10 }),
    // Updates on tickets I opened: staff replies, status changes, approval decisions.
    prisma.ticketComment.findMany({
      where: {
        createdAt: { gte: floor },
        isInternal: false,
        ticket: { OR: [{ requesterId: user.id }, { requesterEmail: user.email }] },
        NOT: { authorId: user.id },
        OR: [{ source: { not: "SYSTEM" } }, { body: { startsWith: "Status:" } }, { body: { startsWith: "Approved by" } }, { body: { startsWith: "Declined by" } }],
      },
      include: { ticket: { select: { id: true, number: true, subject: true, requesterEmail: true } } },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    staff
      ? prisma.ticket.findMany({ where: { createdAt: { gte: floor }, NOT: { requesterId: user.id } }, orderBy: { createdAt: "desc" }, take: 10 })
      : Promise.resolve([] as any[]),
    // Requester replies on tickets assigned to me.
    staff
      ? prisma.ticketComment.findMany({
          where: { createdAt: { gte: floor }, isInternal: false, source: { not: "SYSTEM" }, ticket: { assigneeId: user.id } },
          include: { ticket: { select: { id: true, number: true, subject: true, requesterEmail: true } } },
          orderBy: { createdAt: "desc" },
          take: 15,
        })
      : Promise.resolve([] as any[]),
    // "Assigned to <me>" notes written by someone else.
    staff
      ? prisma.ticketComment.findMany({
          where: { createdAt: { gte: floor }, source: "SYSTEM", body: { contains: `Assigned to ${user.name || user.email}` }, ticket: { assigneeId: user.id } },
          include: { ticket: { select: { id: true, number: true, subject: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : Promise.resolve([] as any[]),
  ])

  for (const a of announcements as any[])
    push({ id: `a:${a.id}`, kind: "announcement", title: a.title, text: snippet(a.content), href: "/announcements", at: a.createdAt })
  for (const e of events as any[])
    push({ id: `e:${e.id}`, kind: "event", title: `New event: ${e.title}`, text: e.location ? `${e.location}` : "See Events & Calendar", href: "/events", at: e.createdAt })

  for (const c of mine as any[]) {
    const n = ticketNumber(c.ticket.number)
    const system = c.source === "SYSTEM"
    push({
      id: `tc:${c.id}`,
      kind: "ticket",
      title: system ? `${n}: ${snippet(c.body, 60)}` : `${n}: ${c.authorName || "IT"} replied`,
      text: system ? c.ticket.subject : snippet(c.body),
      href: `/tickets/${c.ticket.id}`,
      at: c.createdAt,
    })
  }
  for (const t of newTickets as any[])
    push({ id: `nt:${t.id}`, kind: "ticket", title: `New ticket ${ticketNumber(t.number)}`, text: snippet(t.subject), href: `/tickets/${t.id}`, at: t.createdAt })
  for (const c of assignedReplies as any[]) {
    if (c.authorId === user.id) continue
    // Only the requester's own replies matter here; staff replies are not "news" to the assignee.
    if (c.authorEmail && c.ticket.requesterEmail && c.authorEmail.toLowerCase() !== c.ticket.requesterEmail.toLowerCase()) continue
    push({ id: `ar:${c.id}`, kind: "ticket", title: `${ticketNumber(c.ticket.number)}: ${c.authorName || "Requester"} replied`, text: snippet(c.body), href: `/tickets/${c.ticket.id}`, at: c.createdAt })
  }
  for (const c of assignments as any[]) {
    if (c.authorName && c.authorName === (user.name || user.email)) continue // assigned it to myself
    push({ id: `as:${c.id}`, kind: "ticket", title: `${ticketNumber(c.ticket.number)} assigned to you`, text: snippet(c.ticket.subject), href: `/tickets/${c.ticket.id}`, at: c.createdAt })
  }

  // De-duplicate (a comment can match two rules) and keep the newest 12.
  const seen = new Set<string>()
  const unique = items.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)))
  unique.sort((a, b) => b.at.localeCompare(a.at))
  const top = unique.slice(0, 12)
  return { unread: Math.min(99, unique.filter((i) => i.unread).length), items: top }
}
