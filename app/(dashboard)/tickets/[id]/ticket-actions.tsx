"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { CATEGORIES, PRIORITIES, STATUSES, STATUS_LABEL } from "@/lib/ticket-constants"
import { FilePicker } from "@/components/tickets/file-picker"
import { uploadFiles } from "@/components/tickets/upload"

interface Agent {
  id: string
  name: string | null
  email: string
}

export function ReplyBox({ ticketId, staff }: { ticketId: string; staff: boolean }) {
  const router = useRouter()
  const [body, setBody] = useState("")
  const [internal, setInternal] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, isInternal: internal }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setLoading(false)
      return setError(data.error ?? "Could not send")
    }
    if (files.length) {
      const failed = await uploadFiles(ticketId, files, data.commentId)
      if (failed.length) setError(`Reply sent, but these files could not be uploaded: ${failed.join(", ")}`)
    }
    setLoading(false)
    setFiles([])
    setBody("")
    setInternal(false)
    router.refresh()
  }

  return (
    <form onSubmit={send} className="mcc-card p-4 space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder={internal ? "Internal note (only IT/Admin can see this)…" : staff ? "Reply to the requester (they'll get an email)…" : "Add a reply…"}
        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a8a] resize-none ${internal ? "border-amber-300 bg-amber-50" : "border-gray-200"}`}
      />
      <FilePicker files={files} onChange={setFiles} onError={setError} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between">
        {staff ? (
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
            Internal note (not emailed, hidden from requester)
          </label>
        ) : (
          <span />
        )}
        <button disabled={loading || !body.trim()} className="mcc-btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-60">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {internal ? "Add note" : "Send reply"}
        </button>
      </div>
    </form>
  )
}

export function StaffControls({
  ticketId,
  status,
  priority,
  category,
  assigneeId,
  agents,
}: {
  ticketId: string
  status: string
  priority: string
  category: string
  assigneeId: string | null
  agents: Agent[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function patch(change: Record<string, unknown>) {
    setBusy(true)
    setError("")
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(change),
    })
    setBusy(false)
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error ?? "Update failed")
    router.refresh()
  }

  const sel = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4a8a] disabled:opacity-60"
  return (
    <div className="mcc-card p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-800">Manage</h3>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
        <select className={sel} disabled={busy} value={status} onChange={(e) => patch({ status: e.target.value })}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
        <select className={sel} disabled={busy} value={category} onChange={(e) => patch({ category: e.target.value })}>
          {!(CATEGORIES as readonly string[]).includes(category) && <option value={category}>{category}</option>}
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
        <select className={sel} disabled={busy} value={priority} onChange={(e) => patch({ priority: e.target.value })}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p[0] + p.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Assignee</label>
        <select className={sel} disabled={busy} value={assigneeId ?? ""} onChange={(e) => patch({ assigneeId: e.target.value || null })}>
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name ?? a.email}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
