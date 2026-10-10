import { notFound, redirect } from "next/navigation"
import { Linkify } from "@/components/tickets/linkify"
import { Mail, Globe } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { publicLinksEnabled } from "@/lib/ticket-links"
import { publicTicketContent } from "@/lib/ticket-public"
import { ticketNumber } from "@/lib/ticket-constants"
import { formatDateTime } from "@/lib/utils"
import { PublicShell } from "@/components/public-shell"
import { AttachmentGallery } from "@/components/tickets/attachment-gallery"
import { PriorityBadge, StatusBadge } from "@/components/tickets/badges"

// Read-only ticket view reached from an emailed link, without login. Shows no email addresses and no internal notes.
export default async function PublicTicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (token.length < 20) notFound()
  const ticket = await prisma.ticket.findFirst({ where: { accessToken: token } })
  if (!ticket) notFound()

  // Links are closed (e.g. once everyone uses Okta): send people through the normal login instead.
  if (!publicLinksEnabled()) redirect(`/tickets/${ticket.id}`)

  const [{ comments, forComment }, approvals] = await Promise.all([
    publicTicketContent(ticket.id),
    prisma.ticketApproval.findMany({ where: { ticketId: ticket.id, NOT: { status: "CANCELLED" } }, orderBy: { createdAt: "asc" } }),
  ])
  const base = `/api/t/${token}/attachments`

  return (
    <PublicShell>
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          <span className="text-gray-400 font-normal mr-2">{ticketNumber(ticket.number)}</span>
          {ticket.subject}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <span className="text-xs text-gray-500">{ticket.category}</span>
          <span className="text-xs text-gray-400 inline-flex items-center gap-1">
            {ticket.source === "EMAIL" ? <Mail className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            opened {formatDateTime(ticket.createdAt)}
          </span>
        </div>
      </div>

      <div className="mcc-card p-5">
        <p className="text-xs text-gray-500 mb-2">{ticket.requesterName || "Requester"} · {formatDateTime(ticket.createdAt)}</p>
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words"><Linkify text={ticket.description} /></p>
        <AttachmentGallery attachments={forComment(null)} basePath={base} />
      </div>

      {approvals.length > 0 && (
        <div className="mcc-card p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Approvals</h2>
          <ul className="space-y-1.5 text-sm">
            {approvals.map((a: any) => {
              const expired = a.status === "PENDING" && a.expiresAt < new Date()
              return (
                <li key={a.id} className="flex items-center justify-between">
                  <span className="text-gray-700">{a.approverName || "Approver"}</span>
                  <span className="text-xs capitalize text-gray-500">{expired ? "expired" : a.status.toLowerCase()}{a.decidedAt ? ` · ${formatDateTime(a.decidedAt)}` : ""}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {comments.map((c: any) =>
        c.source === "SYSTEM" ? (
          <p key={c.id} className="text-xs text-gray-400 text-center">{c.body} — {formatDateTime(c.createdAt)}</p>
        ) : (
          <div key={c.id} className="mcc-card p-5">
            <p className="text-xs text-gray-500 mb-2">
              <span className="font-medium text-gray-700">{c.authorName || "Unknown"}</span> · {formatDateTime(c.createdAt)}
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{c.body}</p>
            <AttachmentGallery attachments={forComment(c.id)} basePath={base} />
          </div>
        )
      )}

      <p className="text-xs text-gray-400 text-center">To add information, reply to the email you received about this ticket.</p>
    </PublicShell>
  )
}
