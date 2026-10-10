import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { lookupApproval } from "@/lib/approvals"
import { ticketLink } from "@/lib/ticket-links"
import { publicTicketContent } from "@/lib/ticket-public"
import { ticketNumber } from "@/lib/ticket-constants"
import { formatDateTime } from "@/lib/utils"
import { PublicShell } from "@/components/public-shell"
import { AttachmentGallery } from "@/components/tickets/attachment-gallery"
import { ApproveActions } from "./approve-actions"

export default async function ApprovePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ choice?: string }>
}) {
  const { token } = await params
  const { choice } = await searchParams
  const found = await lookupApproval(token)

  if (found.state === "invalid") {
    return (
      <PublicShell>
        <div className="mcc-card p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h1 className="font-semibold text-gray-800">This link isn't valid</h1>
          <p className="text-sm text-gray-500 mt-1">It may have been replaced by a newer email. Please use the most recent approval email, or contact IT.</p>
        </div>
      </PublicShell>
    )
  }

  const { approval, effective } = found
  const t = approval.ticket
  const track = await ticketLink(t)
  const { forComment } = await publicTicketContent(t.id)

  const done =
    effective === "APPROVED" ? { icon: CheckCircle2, color: "text-green-700 bg-green-50", text: "You approved this request." } :
    effective === "DECLINED" ? { icon: XCircle, color: "text-red-700 bg-red-50", text: "You declined this request." } :
    effective === "CANCELLED" ? { icon: Clock, color: "text-gray-600 bg-gray-100", text: "IT cancelled this approval request. No action is needed." } :
    effective === "EXPIRED" ? { icon: Clock, color: "text-amber-700 bg-amber-50", text: "This approval request expired. Ask IT to send a new one." } :
    null

  return (
    <PublicShell>
      <div>
        <p className="text-xs text-gray-500">Approval requested from {approval.approverName || approval.approverEmail}</p>
        <h1 className="text-xl font-bold text-gray-900 mt-1">
          <span className="text-gray-400 font-normal mr-2">{ticketNumber(t.number)}</span>
          {t.subject}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          From {t.requesterName || "a staff member"} · {t.category} · {formatDateTime(t.createdAt)}
        </p>
      </div>

      <div className="mcc-card p-5">
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{t.description}</p>
        <AttachmentGallery attachments={forComment(null)} basePath={`/api/approvals/${token}/attachments`} />
      </div>

      {approval.note && (
        <div className="mcc-card p-5 bg-amber-50 border-amber-200">
          <p className="text-xs font-semibold text-amber-800 mb-1">Note from {approval.requestedByName || "IT"}</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{approval.note}</p>
        </div>
      )}

      {done ? (
        <div className={`rounded-xl p-4 flex items-start gap-3 ${done.color}`}>
          <done.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">{done.text}</p>
            {approval.decidedAt && <p className="text-xs opacity-75 mt-0.5">{formatDateTime(approval.decidedAt)}</p>}
            {approval.decisionComment && <p className="mt-1 whitespace-pre-wrap">“{approval.decisionComment}”</p>}
          </div>
        </div>
      ) : (
        <ApproveActions token={token} defaultChoice={choice === "approve" || choice === "decline" ? choice : undefined} />
      )}

      <p className="text-sm text-center">
        <a href={track} className="text-[#1a4a8a] hover:underline">Track this ticket →</a>
      </p>
    </PublicShell>
  )
}
