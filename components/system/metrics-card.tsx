"use client"

import Link from "next/link"
import { Activity, ChevronRight } from "lucide-react"
import { formatBytes } from "@/lib/ticket-constants"
import { useMetrics, tone, toneBar, toneText } from "@/components/system/use-metrics"

function Gauge({ label, pct, detail }: { label: string; pct: number | null; detail: string }) {
  const t = pct === null ? "green" : tone(pct)
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`text-sm font-bold ${pct === null ? "text-gray-300" : toneText[t]}`}>{pct === null ? "—" : `${Math.round(pct)}%`}</span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${toneBar[t]}`} style={{ width: `${pct ?? 0}%` }} />
      </div>
      <p className="mt-1 truncate text-[11px] text-gray-400">{detail}</p>
    </div>
  )
}

/** Compact CPU / memory / disk tiles for IT & Admin. Click for the detailed view. */
export function MetricsCard() {
  const { latest, error } = useMetrics(10_000, 2)
  const disk = latest?.disks[0]
  return (
    <Link href="/it-help/system" className="mcc-card block p-4 hover:shadow-md transition-shadow" aria-label="Open detailed system metrics">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Activity className="w-4 h-4 text-[#1a4a8a]" />
          Server health
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">IT only</span>
        </h3>
        <span className="flex items-center text-xs font-medium text-[#1a4a8a]">
          Details <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
      {error && !latest ? (
        <p className="text-xs text-gray-400">Metrics unavailable ({error}).</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <Gauge label="CPU" pct={latest ? latest.cpu.pct : null} detail={latest ? `${latest.cpu.count} cores · load ${latest.cpu.load1.toFixed(2)}` : "loading…"} />
          <Gauge
            label="Memory"
            pct={latest ? (latest.memory.used / latest.memory.total) * 100 : null}
            detail={latest ? `${formatBytes(latest.memory.used)} of ${formatBytes(latest.memory.total)}` : "loading…"}
          />
          <Gauge label="Disk" pct={disk ? disk.pct : null} detail={disk ? `${formatBytes(disk.used)} of ${formatBytes(disk.total)}` : "loading…"} />
        </div>
      )}
    </Link>
  )
}
