import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bookmark, PlusCircle, AlertTriangle } from "lucide-react"
import { CATEGORY_LABEL, linkKind } from "@/lib/quick-link-constants"
import { QuickLinkRowActions } from "./quick-link-row-actions"

export default async function AdminQuickLinksPage() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) redirect("/dashboard")

  const links = await prisma.quickLink.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "asc" }] })
  const groups = links.reduce<Record<string, typeof links>>((acc, l) => ((acc[l.category] ??= []).push(l), acc), {})
  const unset = links.filter((l) => linkKind(l.url) === "unset").length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#1a4a8a]" />
            Quick Links Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Choose where each link goes, group and reorder them, or hide ones you don&apos;t need.</p>
        </div>
        <Link href="/admin/quick-links/new" className="mcc-btn-primary flex items-center gap-2 text-sm">
          <PlusCircle className="w-4 h-4" />
          Add Link
        </Link>
      </div>

      {unset > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{unset} link{unset === 1 ? " has" : "s have"} no real address yet (shown as &quot;Not set up yet&quot; to employees). Click Edit and paste the correct link.</span>
        </div>
      )}

      {links.length === 0 && <div className="mcc-card p-10 text-center text-sm text-gray-400">No links yet. Click &quot;Add Link&quot; to create one.</div>}

      {Object.entries(groups).map(([category, items]) => (
        <div key={category} className="mcc-card p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">{CATEGORY_LABEL[category] ?? category}</h2>
          <div className="divide-y divide-gray-100">
            {items.map((l, i) => {
              const kind = linkKind(l.url)
              return (
                <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${l.isActive ? "text-gray-900" : "text-gray-400"}`}>
                      {l.title}
                      {!l.isActive && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">Hidden</span>}
                      {kind === "unset" && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Not set up</span>}
                    </p>
                    <p className="truncate text-xs text-gray-400" title={l.url}>{l.url}{l.description ? ` · ${l.description}` : ""}</p>
                  </div>
                  <QuickLinkRowActions id={l.id} isActive={l.isActive} title={l.title} first={i === 0} last={i === items.length - 1} />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
