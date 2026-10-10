"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Pencil, Eye, EyeOff, Pin, PinOff, Trash2 } from "lucide-react"

export function AnnouncementRowActions({ id, published, pinned, title }: { id: string; published: boolean; pinned: boolean; title: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function call(method: "PATCH" | "DELETE", body?: Record<string, unknown>) {
    setBusy(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (res.ok) router.refresh()
      else setError((await res.json().catch(() => ({}))).error ?? "Failed")
    } catch {
      setError("Network error")
    } finally {
      setBusy(false)
    }
  }

  const btn = "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button type="button" disabled={busy} onClick={() => call("PATCH", { pinned: !pinned })} className={btn} title={pinned ? "Unpin" : "Pin to top"}>
        {pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        {pinned ? "Unpin" : "Pin"}
      </button>
      <button type="button" disabled={busy} onClick={() => call("PATCH", { published: !published })} className={btn} title={published ? "Hide from the portal" : "Show on the portal"}>
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        {published ? "Unpublish" : "Publish"}
      </button>
      <Link href={`/admin/announcements/${id}`} className={btn}>
        <Pencil className="w-3.5 h-3.5" /> Edit
      </Link>
      <button
        type="button"
        disabled={busy}
        onClick={() => confirm(`Delete "${title}"? This cannot be undone.`) && call("DELETE")}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
        aria-label="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      {error && <span className="w-full text-right text-xs text-red-600">{error}</span>}
    </div>
  )
}
