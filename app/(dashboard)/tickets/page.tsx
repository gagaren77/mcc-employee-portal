import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Ticket } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ticketNumber } from "@/lib/tickets"
import { formatDateTime } from "@/lib/utils"
import { StatusBadge } from "@/components/tickets/badges"

export default async function MyTicketsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const tickets = await prisma.ticket.findMany({
    where: { OR: [{ requesterId: session.user.id }, { requesterEmail: (session.user.email ?? "").toLowerCase() }] },
    orderBy: { lastActivityAt: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[#1a4a8a]" />
            My Tickets
          </h1>
          <p className="text-gray-500 text-sm mt-1">Requests you've sent to IT, including ones you emailed to techsupport@mccollege.edu.</p>
        </div>
        <Link href="/tickets/new" className="mcc-btn-primary text-sm inline-flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New ticket
        </Link>
      </div>

      <div className="mcc-card divide-y divide-gray-100">
        {tickets.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">No tickets yet.</p>
        ) : (
          tickets.map((t) => (
            <Link key={t.id} href={`/tickets/${t.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-gray-50">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  <span className="text-gray-400 font-normal mr-2">{ticketNumber(t.number)}</span>
                  {t.subject}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Updated {formatDateTime(t.lastActivityAt)}</p>
              </div>
              <StatusBadge status={t.status} />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
