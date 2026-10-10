"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, ArrowRight, Search, Globe, FolderOpen, Users, Heart, Wallet, Monitor, GraduationCap, type LucideIcon } from "lucide-react"
import { QUICK_LINK_CATEGORIES, CATEGORY_LABEL, linkKind } from "@/lib/quick-link-constants"

export interface TileLink {
  id: string
  title: string
  url: string
  description: string | null
  category: string
}

// One look per group: icon + colours (full class names so Tailwind keeps them).
const GROUP: Record<string, { Icon: LucideIcon; chip: string; bar: string; hover: string }> = {
  general: { Icon: Globe, chip: "bg-slate-100 text-slate-600", bar: "bg-slate-400", hover: "hover:border-slate-300" },
  sharepoint: { Icon: FolderOpen, chip: "bg-blue-100 text-blue-600", bar: "bg-blue-500", hover: "hover:border-blue-300" },
  hr: { Icon: Users, chip: "bg-purple-100 text-purple-600", bar: "bg-purple-500", hover: "hover:border-purple-300" },
  benefits: { Icon: Heart, chip: "bg-green-100 text-green-600", bar: "bg-green-500", hover: "hover:border-green-300" },
  payroll: { Icon: Wallet, chip: "bg-amber-100 text-amber-600", bar: "bg-amber-500", hover: "hover:border-amber-300" },
  it: { Icon: Monitor, chip: "bg-cyan-100 text-cyan-600", bar: "bg-cyan-500", hover: "hover:border-cyan-300" },
  students: { Icon: GraduationCap, chip: "bg-rose-100 text-rose-600", bar: "bg-rose-500", hover: "hover:border-rose-300" },
}
const look = (c: string) => GROUP[c] ?? GROUP.general

function Tile({ link }: { link: TileLink }) {
  const kind = linkKind(link.url)
  const g = look(link.category)
  const body = (
    <>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${g.chip}`}>
        <g.Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-semibold ${kind === "unset" ? "text-gray-400" : "text-gray-900 group-hover:text-[#1a4a8a]"}`}>{link.title}</span>
        <span className="block truncate text-xs text-gray-500">{kind === "unset" ? "Not set up yet" : link.description || (kind === "internal" ? "Portal page" : "Opens in a new tab")}</span>
      </span>
      {kind === "internal" && <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-[#1a4a8a]" />}
      {kind === "external" && <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-[#1a4a8a]" />}
    </>
  )
  const cls = "group flex h-[68px] items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 transition-colors"
  if (kind === "unset") return <div className={`${cls} opacity-60`}>{body}</div>
  if (kind === "internal") return <Link href={link.url} className={`${cls} hover:border-[#1a4a8a]/30 hover:bg-white hover:shadow-sm`}>{body}</Link>
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className={`${cls} hover:border-[#1a4a8a]/30 hover:bg-white hover:shadow-sm`}>
      {body}
    </a>
  )
}

export function QuickLinksBrowser({ links }: { links: TileLink[] }) {
  const [q, setQ] = useState("")
  const [only, setOnly] = useState<string | null>(null)

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const match = (l: TileLink) => !needle || l.title.toLowerCase().includes(needle) || (l.description ?? "").toLowerCase().includes(needle)
    const order = [...QUICK_LINK_CATEGORIES, ...Array.from(new Set(links.map((l) => l.category))).filter((c) => !(QUICK_LINK_CATEGORIES as readonly string[]).includes(c))]
    return order.map((c) => ({ category: c, items: links.filter((l) => l.category === c && match(l)) })).filter((g) => g.items.length > 0 && (!only || g.category === only))
  }, [links, q, only])

  const present = useMemo(() => {
    const set = new Set(links.map((l) => l.category))
    return [...QUICK_LINK_CATEGORIES, ...Array.from(set).filter((c) => !(QUICK_LINK_CATEGORIES as readonly string[]).includes(c))].filter((c) => set.has(c))
  }, [links])

  const chip = (active: boolean) => `rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-[#1a4a8a] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search links…"
            aria-label="Search quick links"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-[#1a4a8a] focus:outline-none focus:ring-2 focus:ring-[#1a4a8a]/15"
          />
        </div>
        {present.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setOnly(null)} className={chip(!only)}>All</button>
            {present.map((c) => (
              <button key={c} type="button" onClick={() => setOnly(only === c ? null : c)} className={chip(only === c)}>
                {CATEGORY_LABEL[c] ?? c}
              </button>
            ))}
          </div>
        )}
      </div>

      {groups.length === 0 && <div className="mcc-card p-10 text-center text-sm text-gray-500">No links match &quot;{q}&quot;.</div>}

      {groups.map(({ category, items }) => {
        const g = look(category)
        return (
          <section key={category} className="mcc-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3.5">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${g.chip}`}>
                <g.Icon className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-bold text-gray-900">{CATEGORY_LABEL[category] ?? category}</h2>
              <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{items.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((l) => (
                <Tile key={l.id} link={l} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
