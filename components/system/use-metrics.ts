"use client"

import { useEffect, useRef, useState } from "react"
import type { Metrics } from "@/lib/system-metrics-types"

/** Polls the metrics API while the tab is visible. Keeps the last `keep` samples for sparklines. */
export function useMetrics(intervalMs: number, keep = 60) {
  const [history, setHistory] = useState<Metrics[]>([])
  const [error, setError] = useState("")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let stop = false
    async function tick() {
      if (!document.hidden) {
        try {
          const res = await fetch("/api/system/metrics", { cache: "no-store" })
          if (!res.ok) throw new Error(res.status === 403 ? "Not allowed" : "Unavailable")
          const m: Metrics = await res.json()
          if (!stop) {
            setError("")
            setHistory((h) => [...h.slice(-(keep - 1)), m])
          }
        } catch (e) {
          if (!stop) setError(e instanceof Error ? e.message : "Unavailable")
        }
      }
      if (!stop) timer.current = setTimeout(tick, intervalMs)
    }
    tick()
    return () => {
      stop = true
      if (timer.current) clearTimeout(timer.current)
    }
  }, [intervalMs, keep])

  return { latest: history[history.length - 1] ?? null, history, error }
}

export const tone = (pct: number) => (pct >= 90 ? "red" : pct >= 70 ? "amber" : "green")
export const toneBar = { green: "bg-green-500", amber: "bg-amber-500", red: "bg-red-500" } as const
export const toneText = { green: "text-green-700", amber: "text-amber-700", red: "text-red-700" } as const

export function formatUptime(sec: number) {
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`
}
