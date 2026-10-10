"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_PRIORITIES, PRIORITY_LABEL } from "@/lib/announcement-constants"

export interface AnnouncementValues {
  id?: string
  title: string
  content: string
  category: string
  priority: string
  pinned: boolean
  published: boolean
}

const input = "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#1a4a8a] focus:ring-2 focus:ring-[#1a4a8a]/15 bg-white"

export function AnnouncementForm({ initial }: { initial?: AnnouncementValues }) {
  const router = useRouter()
  const isEdit = !!initial?.id
  const [v, setV] = useState<AnnouncementValues>(initial ?? { title: "", content: "", category: "general", priority: "NORMAL", pinned: false, published: true })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const set = <K extends keyof AnnouncementValues>(k: K, val: AnnouncementValues[K]) => setV((p) => ({ ...p, [k]: val }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(isEdit ? `/api/admin/announcements/${initial!.id}` : "/api/admin/announcements", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: v.title, content: v.content, category: v.category, priority: v.priority, pinned: v.pinned, published: v.published }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return setError(data.error ?? "Failed to save announcement.")
      router.push("/admin/announcements")
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const label = "block text-sm font-medium text-gray-700 mb-1.5"
  return (
    <form onSubmit={submit} className="mcc-card p-6 space-y-5">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      <div>
        <label className={label}>Title</label>
        <input className={input} value={v.title} onChange={(e) => set("title", e.target.value)} required maxLength={200} placeholder="Office closed Friday for staff training" />
      </div>
      <div>
        <label className={label}>Message</label>
        <textarea className={input} value={v.content} onChange={(e) => set("content", e.target.value)} required rows={7} maxLength={10000} placeholder="What do people need to know?" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>Category</label>
          <select className={input} value={v.category} onChange={(e) => set("category", e.target.value)}>
            {!(ANNOUNCEMENT_CATEGORIES as readonly string[]).includes(v.category) && <option value={v.category}>{v.category}</option>}
            {ANNOUNCEMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === "hr" || c === "it" ? c.toUpperCase() : c[0].toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Priority</label>
          <select className={input} value={v.priority} onChange={(e) => set("priority", e.target.value)}>
            {ANNOUNCEMENT_PRIORITIES.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={v.pinned} onChange={(e) => set("pinned", e.target.checked)} className="w-4 h-4 accent-[#1a4a8a]" />
          <span className="text-sm text-gray-700">Pin to the top</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} className="w-4 h-4 accent-[#1a4a8a]" />
          <span className="text-sm text-gray-700">Published (visible to everyone, and shows in their notification bell)</span>
        </label>
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={loading} className="mcc-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl disabled:opacity-60">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Saving..." : isEdit ? "Save Changes" : v.published ? "Post Announcement" : "Save Draft"}
        </button>
      </div>
    </form>
  )
}
