"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bell, Calendar, Megaphone, Ticket } from "lucide-react"
import type { NotificationItem } from "@/lib/notifications"

const icons = { announcement: Megaphone, event: Calendar, ticket: Ticket } as const
const tint = { announcement: "bg-amber-100 text-amber-700", event: "bg-green-100 text-green-700", ticket: "bg-blue-100 text-blue-700" } as const

function ago(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<NotificationItem[]>([])
  const box = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (document.hidden) return
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" })
      if (!res.ok) return
      const d = await res.json()
      setUnread(d.unread)
      setItems(d.items)
    } catch {
      /* offline: keep what we have */
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 60_000)
    const onVisible = () => !document.hidden && load()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      clearInterval(t)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [load])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  async function markAllRead() {
    setUnread(0)
    setItems((l) => l.map((i) => ({ ...i, unread: false })))
    await fetch("/api/notifications/read", { method: "POST" }).catch(() => {})
  }

  return (
    <div className="relative" ref={box}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c9a227] text-white text-[10px] font-bold leading-[18px] text-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <button onClick={markAllRead} disabled={unread === 0} className="text-xs font-medium text-[#1a4a8a] hover:underline disabled:opacity-40 disabled:no-underline">
              Mark all as read
            </button>
          </div>
          <div className="max-h-[26rem] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">You&apos;re all caught up.</p>
            ) : (
              items.map((i) => {
                const Icon = icons[i.kind]
                return (
                  <Link
                    key={i.id}
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className={`flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 ${i.unread ? "bg-blue-50/50" : ""}`}
                  >
                    <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${tint[i.kind]}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className={`text-sm text-gray-900 ${i.unread ? "font-semibold" : "font-medium"}`}>{i.title}</span>
                        {i.unread && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#1a4a8a]" aria-label="unread" />}
                      </span>
                      <span className="block truncate text-xs text-gray-500">{i.text}</span>
                      <span className="block text-[11px] text-gray-400">{ago(i.at)}</span>
                    </span>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
