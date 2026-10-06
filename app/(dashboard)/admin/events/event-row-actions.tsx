"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Pencil, Eye, EyeOff, Trash2 } from "lucide-react"

interface Props {
  id: string
  published: boolean
  title: string
}

export function EventRowActions({ id, published, title }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function togglePublished() {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error ?? "Failed to update event.")
      }
    } catch {
      alert("Network error.")
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error ?? "Failed to delete event.")
      }
    } catch {
      alert("Network error.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={togglePublished}
        disabled={busy}
        title={published ? "Unpublish (hide from portal)" : "Publish (show on portal)"}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : published ? (
          <EyeOff className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
        {published ? "Unpublish" : "Publish"}
      </button>

      <Link
        href={`/admin/events/${id}`}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border border-gray-200 hover:bg-gray-50"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </Link>

      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
