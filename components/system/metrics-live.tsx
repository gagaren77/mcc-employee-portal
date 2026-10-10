"use client"

import { formatBytes } from "@/lib/ticket-constants"
import { useMetrics, tone, toneBar, toneText, formatUptime } from "@/components/system/use-metrics"

function Spark({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <div className="h-10" />
  const w = 160
  const h = 40
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (Math.min(100, Math.max(0, v)) / 100) * h}`).join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

const stroke = { green: "#22c55e", amber: "#f59e0b", red: "#ef4444" } as const

function Big({ title, pct, sub, history }: { title: string; pct: number; sub: string; history: number[] }) {
  const t = tone(pct)
  return (
    <div className="mcc-card p-5">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <p className={`mt-1 text-3xl font-bold ${toneText[t]}`}>{Math.round(pct)}%</p>
      <div className="mt-2 h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${toneBar[t]}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-gray-500">{sub}</p>
      <div className="mt-3">
        <Spark values={history} color={stroke[t]} />
        <p className="text-[10px] text-gray-400">last {Math.max(1, history.length * 5)} seconds</p>
      </div>
    </div>
  )
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-4 border-b border-gray-50 py-1.5 text-sm last:border-0">
    <span className="text-gray-500">{k}</span>
    <span className="font-medium text-gray-800 text-right">{v}</span>
  </div>
)

export function MetricsLive() {
  const { latest: m, history, error } = useMetrics(5_000, 36)
  if (!m) return <p className="text-sm text-gray-500">{error ? `Metrics unavailable (${error}).` : "Loading…"}</p>
  const memPct = (m.memory.used / m.memory.total) * 100
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Big title="CPU" pct={m.cpu.pct} sub={`${m.cpu.count} cores · load ${m.cpu.load1.toFixed(2)} / ${m.cpu.load5.toFixed(2)} / ${m.cpu.load15.toFixed(2)}`} history={history.map((h) => h.cpu.pct)} />
        <Big title="Memory" pct={memPct} sub={`${formatBytes(m.memory.used)} used of ${formatBytes(m.memory.total)} · ${formatBytes(m.memory.available)} available`} history={history.map((h) => (h.memory.used / h.memory.total) * 100)} />
        {m.disks[0] && (
          <Big
            title={m.disks[0].label}
            pct={m.disks[0].pct}
            sub={`${formatBytes(m.disks[0].used)} used of ${formatBytes(m.disks[0].total)} · ${formatBytes(m.disks[0].available)} free`}
            history={history.map((h) => h.disks[0]?.pct ?? 0)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="mcc-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">CPU cores</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {m.cpu.cores.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Core {i + 1}</span>
                  <span className={toneText[tone(c)]}>{Math.round(c)}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${toneBar[tone(c)]}`} style={{ width: `${c}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mcc-card p-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-800">Memory &amp; disks</h3>
          <Row k="Memory in use" v={formatBytes(m.memory.used)} />
          <Row k="Memory available" v={formatBytes(m.memory.available)} />
          {m.memory.cached > 0 && <Row k="Cache / buffers" v={formatBytes(m.memory.cached)} />}
          <Row k="Swap" v={m.memory.swapTotal ? `${formatBytes(m.memory.swapUsed)} of ${formatBytes(m.memory.swapTotal)}` : "none"} />
          {m.disks.map((d) => (
            <Row key={d.path} k={`${d.label} (${d.path})`} v={`${formatBytes(d.used)} of ${formatBytes(d.total)} · ${Math.round(d.pct)}%`} />
          ))}
        </div>

        <div className="mcc-card p-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-800">Portal app</h3>
          <Row k="App running for" v={formatUptime(m.app.uptimeSec)} />
          <Row k="Server up for" v={formatUptime(m.host.uptimeSec)} />
          <Row k="App memory (RSS)" v={formatBytes(m.app.rss)} />
          <Row k="Node.js" v={m.app.node} />
        </div>

        <div className="mcc-card p-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-800">Portal data</h3>
          <Row k="Database size" v={m.storage.dbBytes === null ? "—" : formatBytes(m.storage.dbBytes)} />
          <Row k="Ticket attachments" v={`${formatBytes(m.storage.attachmentBytes)} · ${m.storage.attachmentFiles} files`} />
        </div>
      </div>
      <p className="text-xs text-gray-400">Refreshes every 5 seconds while this tab is open. Figures describe the server the portal runs on.</p>
    </div>
  )
}
