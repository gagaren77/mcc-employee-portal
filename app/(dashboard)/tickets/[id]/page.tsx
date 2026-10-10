import { notFound, redirect } from "next/navigation"
import { SystemNote } from "@/components/tickets/system-note"
import { Linkify } from "@/components/tickets/linkify"
import Link from "next/link"
import { Mail, Globe } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { approvalLimit, canViewTicket, isStaff, ticketNumber } from "@/lib/tickets"
import { formatDateTime } from "@/lib/utils"
import { PriorityBadge, StatusBadge } from "@/components/tickets/badges"
import { AttachmentGallery } from "@/components/tickets/attachment-gallery"
import { ReplyBox, StaffControls } from "./ticket-actions"
import { ApprovalsCard, type ApprovalView } from "./approvals-card"

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { comments: { orderBy: { createdAt: "asc" } }, assignee: { select: { id: true, name: true, email: true } } },
  })
  if (!ticket || !canViewTicket(session.user, ticket)) notFound()

  const staff = isStaff(session.user.role)
  const comments = staff ? ticket.comments : ticket.comments.filter((c) => !c.isInternal)
  const hiddenComments = new Set(ticket.comments.filter((c) => c.isInternal).map((c) => c.id))
  const allAttachments = await prisma.ticketAttachment.findMany({ where: { ticketId: id }, orderBy: { createdAt: "asc" } })
  const visibleAttachments = staff ? allAttachments : allAttachments.filter((a) => !a.commentId || !hiddenComments.has(a.commentId))
  const attachmentsFor = (commentId: string | null) =>
    visibleAttachments
      .filter((a) => (a.commentId ?? null) === commentId)
      .map((a) => ({ id: a.id, filename: a.filename, mimeType: a.mimeType, size: a.size, previewable: a.previewable }))
  const approvalRows = await prisma.ticketApproval.findMany({ where: { ticketId: id }, orderBy: { createdAt: "asc" } })
  const approvals: ApprovalView[] = approvalRows.map((a: any) => ({
    id: a.id,
    approverName: a.approverName,
    approverEmail: staff ? a.approverEmail : "",
    status: a.status,
    effective: a.status === "PENDING" && a.expiresAt < new Date() ? "EXPIRED" : a.status,
    createdAt: a.createdAt.toISOString(),
    decidedAt: a.decidedAt ? a.decidedAt.toISOString() : null,
    decisionComment: a.decisionComment,
    requestedByName: a.requestedByName,
  }))
  const agents = staff
    ? await prisma.user.findMany({
        where: { role: { in: ["IT", "ADMIN"] }, isActive: true },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      })
    : []

  return (
    <div className="space-y-5">
      <div>
        <Link href={staff ? "/tickets/queue" : "/tickets"} className="text-xs text-[#1a4a8a] hover:underline">
          ← {staff ? "Ticket queue" : "My tickets"}
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mt-1">
          <span className="text-gray-400 font-normal mr-2">{ticketNumber(ticket.number)}</span>
          {ticket.subject}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <span className="text-xs text-gray-500">{ticket.category}</span>
          <span className="text-xs text-gray-400 inline-flex items-center gap-1">
            {ticket.source === "EMAIL" ? <Mail className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            via {ticket.source === "EMAIL" ? "email" : "portal"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="mcc-card p-5">
            <p className="text-xs text-gray-500 mb-2">
              {ticket.requesterName || ticket.requesterEmail} · {formatDateTime(ticket.createdAt)}
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words"><Linkify text={ticket.description} /></p>
            <AttachmentGallery attachments={attachmentsFor(null)} />
          </div>

          {comments.map((c) =>
            c.source === "SYSTEM" ? (
              <SystemNote key={c.id} body={c.body} meta={`${c.authorName} · ${formatDateTime(c.createdAt)}`} />
            ) : (
              <div key={c.id} className={`mcc-card p-5 ${c.isInternal ? "border-amber-300 bg-amber-50" : ""}`}>
                <p className="text-xs text-gray-500 mb-2">
                  <span className="font-medium text-gray-700">{c.authorName || c.authorEmail || "Unknown"}</span> · {formatDateTime(c.createdAt)}
                  {c.source === "EMAIL" && " · via email"}
                  {c.isInternal && <span className="ml-2 text-amber-700 font-medium">Internal note</span>}
                </p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{c.body}</p>
                <AttachmentGallery attachments={attachmentsFor(c.id)} />
              </div>
            )
          )}

          {ticket.status === "CLOSED" ? (
            <p className="text-sm text-gray-500 text-center">This ticket is closed. Open a new ticket if you need more help.</p>
          ) : (
            <ReplyBox ticketId={ticket.id} staff={staff} />
          )}
        </div>

        <div className="space-y-4">
          {staff && (
            <StaffControls ticketId={ticket.id} status={ticket.status} priority={ticket.priority} category={ticket.category} assigneeId={ticket.assigneeId} agents={agents} approvalsApproved={approvals.some((a) => a.status === "APPROVED")} />
          )}
          <ApprovalsCard ticketId={ticket.id} approvals={approvals} staff={staff} limit={approvalLimit(ticket.category)} />
          <div className="mcc-card p-4 text-xs text-gray-600 space-y-1.5">
            <div className="flex justify-between"><span>Requester</span><span className="font-medium text-right">{ticket.requesterName || ticket.requesterEmail}</span></div>
            <div className="flex justify-between"><span>Email</span><span className="font-medium text-right break-all">{ticket.requesterEmail}</span></div>
            <div className="flex justify-between"><span>Assigned to</span><span className="font-medium">{ticket.assignee?.name ?? ticket.assignee?.email ?? "Unassigned"}</span></div>
            <div className="flex justify-between"><span>Created</span><span className="font-medium">{formatDateTime(ticket.createdAt)}</span></div>
            {ticket.resolvedAt && <div className="flex justify-between"><span>Resolved</span><span className="font-medium">{formatDateTime(ticket.resolvedAt)}</span></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
