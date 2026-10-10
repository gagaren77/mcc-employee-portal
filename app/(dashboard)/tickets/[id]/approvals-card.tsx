"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ShieldCheck } from "lucide-react"
import { UserPicker, type Person } from "@/components/tickets/user-picker"
import { formatDateTime } from "@/lib/utils"

export interface ApprovalView {
  id: string
  approverName: string | null
  approverEmail: string
  status: string
  effective: string // status, or EXPIRED
  createdAt: string
  decidedAt: string | null
  decisionComment: string | null
  requestedByName: string | null
}

const badge: Record<string, string> = {
  PENDING: "bg-indigo-100 text-indigo-700",
  APPROVED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  EXPIRED: "bg-amber-100 text-amber-700",
}

export function ApprovalsCard({ ticketId, approvals, staff, limit }: { ticketId: string; approvals: ApprovalView[]; staff: boolean; limit: number }) {
  const router = useRouter()
  const [person, setPerson] = useState<Person | null>(null)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!person) return
    setBusy(true)
    setError("")
    const res = await fetch(`/api/tickets/${ticketId}/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: person.email, name: person.name, note }),
    })
    const d = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setError(d.error ?? "Could not send")
    setPerson(null)
    setNote("")
    router.refresh()
  }

  async function act(approvalId: string, action: "resend" | "cancel") {
    setBusy(true)
    setError("")
    const res = await fetch(`/api/tickets/${ticketId}/approvals/${approvalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    setBusy(false)
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error ?? "Failed")
    router.refresh()
  }

  if (!staff && approvals.length === 0) return null
  if (staff && limit === 0 && approvals.length === 0) return null // only Equipment / Access Request tickets use approvals
  const used = approvals.filter((a) => a.status === "PENDING" || a.status === "APPROVED").length
  const canAdd = staff && used < limit

  return (
    <div className="mcc-card p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#1a4a8a]" /> Approvals
      </h3>

      {approvals.length === 0 && <p className="text-xs text-gray-500">No approval requested yet.</p>}
      {staff && limit > 0 && <p className="text-xs text-gray-400">{limit === 1 ? "One approver" : `Up to ${limit} approvers`} for this ticket type.</p>}
      <ul className="space-y-2">
        {approvals.map((a) => (
          <li key={a.id} className="text-xs border border-gray-100 rounded-lg p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-gray-800 truncate">{a.approverName || a.approverEmail}</span>
              <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${badge[a.effective] ?? badge.PENDING}`}>{a.effective.toLowerCase()}</span>
            </div>
            <p className="text-gray-400 mt-0.5">
              {a.decidedAt ? `Decided ${formatDateTime(a.decidedAt)}` : `Requested ${formatDateTime(a.createdAt)}`}
            </p>
            {a.decisionComment && <p className="mt-1 text-gray-600 whitespace-pre-wrap">“{a.decisionComment}”</p>}
            {staff && (a.effective === "PENDING" || a.effective === "EXPIRED") && a.status === "PENDING" && (
              <div className="mt-1.5 flex gap-3">
                <button disabled={busy} onClick={() => act(a.id, "resend")} className="text-[#1a4a8a] hover:underline disabled:opacity-50">Resend</button>
                <button disabled={busy} onClick={() => act(a.id, "cancel")} className="text-red-600 hover:underline disabled:opacity-50">Cancel</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {canAdd && (
        <form onSubmit={send} className="space-y-2 border-t border-gray-100 pt-3">
          <p className="text-xs font-medium text-gray-600">Request approval from</p>
          <UserPicker value={person} onChange={setPerson} />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Optional note for the approver (e.g. budget code, urgency)"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a8a] resize-none"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button disabled={!person || busy} className="mcc-btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Send for approval
          </button>
          <p className="text-[11px] text-gray-400">They get an email with Approve / Decline buttons and a link to follow this ticket. No login needed.</p>
        </form>
      )}
    </div>
  )
}
