"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { CATEGORIES } from "@/lib/ticket-constants"
import { FilePicker } from "@/components/tickets/file-picker"
import { uploadFiles } from "@/components/tickets/upload"

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
}

/** Equipment details go at the top of the description so staff and approvers see them at a glance. */
function equipmentDescription(eq: { item: string; link: string; qty: string; cost: string; needed: string }, why: string) {
  const lines = [`Item: ${eq.item.trim()}`]
  if (eq.link.trim()) lines.push(`Link: ${eq.link.trim()}`)
  lines.push(`Quantity: ${eq.qty.trim() || "1"}`)
  if (eq.cost.trim()) lines.push(`Estimated cost: ${eq.cost.trim()}`)
  if (eq.needed) lines.push(`Needed by: ${prettyDate(eq.needed)}`)
  return `${lines.join("\n")}\n\nWhy it's needed:\n${why.trim()}`
}

export function TicketForm({ defaultCategory = "" }: { defaultCategory?: string }) {
  const router = useRouter()
  const [form, setForm] = useState({ subject: "", description: "", category: defaultCategory })
  const [eq, setEq] = useState({ item: "", link: "", qty: "1", cost: "", needed: "" })
  const isEquipment = form.category === "Equipment Request"
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, description: isEquipment ? equipmentDescription(eq, form.description) : form.description }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error ?? "Could not submit ticket")
      setLoading(false)
      return
    }
    if (files.length) {
      const failed = await uploadFiles(data.ticket.id, files)
      if (failed.length) {
        setError(`Ticket created, but these files could not be uploaded: ${failed.join(", ")}. You can add them from the ticket page.`)
        await new Promise((r) => setTimeout(r, 3500))
      }
    }
    router.push(`/tickets/${data.ticket.id}`)
  }

  const input = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a8a] bg-white"
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={input} required>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            placeholder="Brief summary"
            required
            minLength={3}
            maxLength={200}
            className={input}
          />
        </div>
      </div>
      {isEquipment && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 space-y-3">
          <p className="text-xs font-semibold text-[#1a4a8a]">Equipment details</p>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Item *</label>
            <input type="text" value={eq.item} onChange={(e) => setEq((p) => ({ ...p, item: e.target.value }))} placeholder='e.g. Dell 27" monitor' required maxLength={200} className={input} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Link to the product (optional)</label>
            <input type="url" value={eq.link} onChange={(e) => setEq((p) => ({ ...p, link: e.target.value }))} placeholder="https://..." maxLength={1000} className={input} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" min={1} max={999} value={eq.qty} onChange={(e) => setEq((p) => ({ ...p, qty: e.target.value }))} required className={input} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Estimated cost (optional)</label>
              <input type="text" value={eq.cost} onChange={(e) => setEq((p) => ({ ...p, cost: e.target.value }))} placeholder="$320 each" maxLength={60} className={input} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Needed by (optional)</label>
              <input type="date" value={eq.needed} onChange={(e) => setEq((p) => ({ ...p, needed: e.target.value }))} className={input} />
            </div>
          </div>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">{isEquipment ? "Why do you need it?" : "Description"}</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder={isEquipment ? "Who it's for, where it will be used, and why it's needed." : "What's happening? Include your room/location and any error messages."}
          rows={5}
          required
          className={`${input} resize-none`}
        />
      </div>
      <FilePicker files={files} onChange={setFiles} onError={setError} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="mcc-btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-60">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit Ticket
      </button>
    </form>
  )
}
