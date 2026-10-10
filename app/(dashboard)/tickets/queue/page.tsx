import { redirect } from "next/navigation"
import Link from "next/link"
import { Inbox } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ACTIVE_STATUSES, STATUSES, STATUS_LABEL, isStaff, ticketNumber } from "@/lib/tickets"
import { formatDateTime } from "@/lib/utils"
import { PriorityBadge, StatusBadge } from "@/components/tickets/badges"
import { SyncButton } from "./sync-button"

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; mine?: string; q?: string }>
}) {
  const session = await auth()
  if (!session?.user || !isStaff(session.user.role)) redirect("/tickets")
  const sp = await searchParams

  const status = sp.status ?? "ACTIVE"
  const q = (sp.q ?? "").trim()
  const where: Record<string, unknown> = {}
  if (status === "ACTIVE") where.status = { in: [...ACTIVE_STATUSES] }
  else if ((STATUSES as readonly string[]).includes(status)) where.status = status
  if (sp.mine === "1") where.assigneeId = session.user.id
  if (q) {
    const num = Number(q.replace(/^mcc-/i, ""))
    where.OR = [
      { subject: { contains: q } },
      { requesterEmail: { contains: q } },
      { requesterName: { contains: q } },
      ...(Number.isInteger(num) ? [{ number: num }] : []),
    ]
  }

  const [tickets, counts] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: [{ lastActivityAt: "desc" }],
      take: 200,
      include: { assignee: { select: { name: true, email: true } } },
    }),
    prisma.ticket.groupBy({ by: ["status"], _count: { _all: true } }),
  ])
  const countOf = (s: string) => counts.find((c: { status: string }) => c.status === s)?._count._all ?? 0
  const activeCount = ACTIVE_STATUSES.reduce((n, s) => n + countOf(s), 0)

  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    const merged = { status: sp.status, mine: sp.mine, q: sp.q, ...over }
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v)
    const s = p.toString()
    return `/tickets/queue${s ? "?" + s : ""}`
  }
  const tab = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium ${active ? "bg-[#1a4a8a] text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-[#1a4a8a]" />
            Ticket Queue
          </h1>
          <p className="text-gray-500 text-sm mt-1">{activeCount} active · emails to techsupport@ arrive here automatically.</p>
        </div>
        <SyncButton />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href={href({ status: undefined })} className={tab(status === "ACTIVE")}>Active ({activeCount})</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={href({ status: s })} className={tab(status === s)}>
            {STATUS_LABEL[s]} ({countOf(s)})
          </Link>
        ))}
        <Link href={href({ status: "ALL" })} className={tab(status === "ALL")}>All</Link>
        <span className="mx-1 text-gray-300">|</span>
        <Link href={href({ mine: sp.mine === "1" ? undefined : "1" })} className={tab(sp.mine === "1")}>Assigned to me</Link>
        <form className="ml-auto" action="/tickets/queue">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          {sp.mine && <input type="hidden" name="mine" value={sp.mine} />}
          <input name="q" defaultValue={q} placeholder="Search subject, email, MCC-#" className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm w-60" />
        </form>
      </div>

      <div className="mcc-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-2.5">Ticket</th>
              <th className="text-left px-4 py-2.5">Requester</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="text-left px-4 py-2.5">Priority</th>
              <th className="text-left px-4 py-2.5">Assignee</th>
              <th className="text-left px-4 py-2.5">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-gray-500 py-10">No tickets match.</td></tr>
            ) : (
              tickets.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-md">
                    <Link href={`/tickets/${t.id}`} className="font-medium text-gray-800 hover:text-[#1a4a8a] block truncate">
                      <span className="text-gray-400 font-normal mr-2">{ticketNumber(t.number)}</span>
                      {t.subject}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-[12rem]">{t.requesterName || t.requesterEmail}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3 text-gray-600">{t.assignee?.name ?? t.assignee?.email ?? <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(t.lastActivityAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
