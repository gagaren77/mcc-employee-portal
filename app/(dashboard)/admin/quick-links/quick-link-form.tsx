"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { QUICK_LINK_CATEGORIES, CATEGORY_LABEL } from "@/lib/quick-link-constants"

export interface QuickLinkValues {
  id?: string
  title: string
  url: string
  description: string
  category: string
  isActive: boolean
}

const input = "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#1a4a8a] focus:ring-2 focus:ring-[#1a4a8a]/15 bg-white"

export function QuickLinkForm({ initial }: { initial?: QuickLinkValues }) {
  const router = useRouter()
  const isEdit = !!initial?.id
  const [v, setV] = useState<QuickLinkValues>(initial ?? { title: "", url: "", description: "", category: "general", isActive: true })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const set = <K extends keyof QuickLinkValues>(k: K, val: QuickLinkValues[K]) => setV((p) => ({ ...p, [k]: val }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(isEdit ? `/api/admin/quick-links/${initial!.id}` : "/api/admin/quick-links", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: v.title, url: v.url, description: v.description || null, category: v.category, isActive: v.isActive }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return setError(data.error ?? "Failed to save link.")
      router.push("/admin/quick-links")
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
        <label className={label}>Name</label>
        <input className={input} value={v.title} onChange={(e) => set("title", e.target.value)} required maxLength={80} placeholder="Paylocity" />
      </div>
      <div>
        <label className={label}>Link</label>
        <input className={input} value={v.url} onChange={(e) => set("url", e.target.value)} required maxLength={1000} placeholder="https://access.paylocity.com" />
        <p className="mt-1 text-xs text-gray-400">A web address, or a page inside this portal like <code>/hr</code>. Portal pages open in the same tab; other sites open in a new tab.</p>
      </div>
      <div>
        <label className={label}>Short description (optional)</label>
        <input className={input} value={v.description} onChange={(e) => set("description", e.target.value)} maxLength={120} placeholder="Pay stubs & time off" />
      </div>
      <div>
        <label className={label}>Group</label>
        <select className={input} value={v.category} onChange={(e) => set("category", e.target.value)}>
          {!(QUICK_LINK_CATEGORIES as readonly string[]).includes(v.category) && <option value={v.category}>{v.category}</option>}
          {QUICK_LINK_CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={v.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-[#1a4a8a]" />
        <span className="text-sm text-gray-700">Show on the portal</span>
      </label>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={loading} className="mcc-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl disabled:opacity-60">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Link"}
        </button>
      </div>
    </form>
  )
}
