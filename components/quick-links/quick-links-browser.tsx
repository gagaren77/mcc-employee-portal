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
      <div className="flex items-start justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${g.chip}`}>
          <g.Icon className="h-5 w-5" />
        </span>
        {kind === "internal" && <ArrowRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-[#1a4a8a]" />}
        {kind === "external" && <ArrowUpRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-[#1a4a8a]" />}
      </div>
      <div className="mt-3 min-w-0">
        <p className={`truncate text-sm font-semibold ${kind === "unset" ? "text-gray-400" : "text-gray-900 group-hover:text-[#1a4a8a]"}`}>{link.title}</p>
        <p className="mt-0.5 line-clamp-2 min-h-[2rem] text-xs leading-4 text-gray-500">{kind === "unset" ? "Not set up yet" : link.description || " "}</p>
      </div>
    </>
  )
  const cls = `group flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all ${g.hover}`
  if (kind === "unset") return <div className={`${cls} opacity-60`}>{body}</div>
  if (kind === "internal") return <Link href={link.url} className={`${cls} hover:-translate-y-0.5 hover:shadow-md`}>{body}</Link>
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className={`${cls} hover:-translate-y-0.5 hover:shadow-md`}>
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
    <div className="space-y-6">
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
          <section key={category}>
            <div className="mb-3 flex items-center gap-2">
              <span className={`h-5 w-1 rounded-full ${g.bar}`} />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700">{CATEGORY_LABEL[category] ?? category}</h2>
              <span className="text-xs text-gray-400">{items.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
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
