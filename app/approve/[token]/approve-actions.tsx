"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

export function ApproveActions({ token, defaultChoice }: { token: string; defaultChoice?: "approve" | "decline" }) {
  const router = useRouter()
  const [choice, setChoice] = useState<"approve" | "decline" | null>(defaultChoice ?? null)
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function submit() {
    if (!choice) return
    setBusy(true)
    setError("")
    const res = await fetch(`/api/approvals/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: choice === "approve" ? "APPROVED" : "DECLINED", comment }),
    })
    const d = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setError(d.error ?? "Something went wrong")
    router.refresh()
  }

  const base = "flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
  return (
    <div className="mcc-card p-5 space-y-4">
      <h2 className="font-semibold text-gray-800">Your decision</h2>
      <div className="flex gap-3">
        <button type="button" onClick={() => setChoice("approve")} className={`${base} ${choice === "approve" ? "border-green-600 bg-green-50 text-green-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
          <CheckCircle2 className="w-4 h-4" /> Approve
        </button>
        <button type="button" onClick={() => setChoice("decline")} className={`${base} ${choice === "decline" ? "border-red-600 bg-red-50 text-red-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
          <XCircle className="w-4 h-4" /> Decline
        </button>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder={choice === "decline" ? "Reason for declining (optional, shared with IT and the requester)" : "Comment (optional)"}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a8a] resize-none"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        disabled={!choice || busy}
        onClick={submit}
        className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-50 ${choice === "decline" ? "bg-red-700" : "bg-[#1a4a8a]"}`}
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        {choice ? `Confirm: ${choice === "approve" ? "Approve" : "Decline"}` : "Choose Approve or Decline"}
      </button>
      <p className="text-xs text-gray-400">This link works once. Your name and decision are recorded on the ticket.</p>
    </div>
  )
}
