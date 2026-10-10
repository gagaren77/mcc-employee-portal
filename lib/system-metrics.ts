import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { attachmentsDir } from "@/lib/attachments"
import type { Metrics, DiskInfo } from "@/lib/system-metrics-types"

// Server health numbers for IT/Admin. Inside the container /proc shows the host's CPU and memory,
// and statfs on "/" shows the host disk (same figures `df` gives), so these describe the server.

interface CpuTimes { idle: number; total: number }

function readCpuTimes(): CpuTimes[] {
  try {
    const rows = fs.readFileSync("/proc/stat", "utf8").split("\n").filter((l) => /^cpu\d*\s/.test(l))
    return rows.map((l) => {
      const n = l.trim().split(/\s+/).slice(1, 9).map(Number)
      const idle = (n[3] || 0) + (n[4] || 0) // idle + iowait
      return { idle, total: n.reduce((a, b) => a + b, 0) }
    })
  } catch {
    const cpus = os.cpus()
    const one = (t: { user: number; nice: number; sys: number; idle: number; irq: number }) => ({
      idle: t.idle,
      total: t.user + t.nice + t.sys + t.idle + t.irq,
    })
    const all = cpus.map((c) => one(c.times))
    const sum = all.reduce((a, b) => ({ idle: a.idle + b.idle, total: a.total + b.total }), { idle: 0, total: 0 })
    return [sum, ...all]
  }
}

const pctBetween = (a: CpuTimes, b: CpuTimes) => {
  const dt = b.total - a.total
  return dt > 0 ? Math.max(0, Math.min(100, (1 - (b.idle - a.idle) / dt) * 100)) : 0
}

async function sampleCpu(ms = 300) {
  const a = readCpuTimes()
  await new Promise((r) => setTimeout(r, ms))
  const b = readCpuTimes()
  const per = b.map((t, i) => pctBetween(a[i] ?? t, t))
  return { total: per[0] ?? 0, cores: per.slice(1) }
}

function readMemory() {
  try {
    const m: Record<string, number> = {}
    for (const l of fs.readFileSync("/proc/meminfo", "utf8").split("\n")) {
      const r = l.match(/^(\w+):\s+(\d+)/)
      if (r) m[r[1]] = Number(r[2]) * 1024
    }
    const total = m.MemTotal
    const available = m.MemAvailable ?? m.MemFree
    return {
      total,
      available,
      used: total - available,
      cached: (m.Cached || 0) + (m.Buffers || 0),
      swapTotal: m.SwapTotal || 0,
      swapUsed: (m.SwapTotal || 0) - (m.SwapFree || 0),
    }
  } catch {
    const total = os.totalmem()
    const free = os.freemem()
    return { total, available: free, used: total - free, cached: 0, swapTotal: 0, swapUsed: 0 }
  }
}

function disk(label: string, p: string): DiskInfo | null {
  try {
    const s = fs.statfsSync(p)
    const total = s.blocks * s.bsize
    const used = (s.blocks - s.bfree) * s.bsize
    const avail = s.bavail * s.bsize
    return { label, path: p, total, used, available: avail, pct: total ? (used / (used + avail)) * 100 : 0 }
  } catch {
    return null
  }
}

function readDisks(): DiskInfo[] {
  const out: DiskInfo[] = []
  const root = disk("Server disk", "/")
  if (root) out.push(root)
  try {
    const data = path.dirname(attachmentsDir())
    const sameFs = fs.statSync("/").dev === fs.statSync(data).dev
    if (!sameFs) {
      const d = disk("Data volume", data)
      if (d) out.push(d)
    }
  } catch {
    /* data dir not created yet */
  }
  return out
}

let attachCache: { at: number; bytes: number; files: number } | null = null
function attachmentUsage() {
  if (attachCache && Date.now() - attachCache.at < 60_000) return attachCache
  let bytes = 0
  let files = 0
  try {
    const dir = attachmentsDir()
    for (const f of fs.readdirSync(dir)) {
      try {
        const st = fs.statSync(path.join(dir, f))
        if (st.isFile()) {
          bytes += st.size
          files++
        }
      } catch {
        /* removed while scanning */
      }
    }
  } catch {
    /* no attachments yet */
  }
  attachCache = { at: Date.now(), bytes, files }
  return attachCache
}

function dbBytes() {
  try {
    const url = (process.env.DATABASE_URL || "file:./prisma/dev.db").replace(/^file:/, "")
    const abs = path.isAbsolute(url) ? url : path.resolve(process.cwd(), "prisma", url)
    return fs.statSync(abs).size
  } catch {
    return null
  }
}

function hostUptime() {
  try {
    return Number(fs.readFileSync("/proc/uptime", "utf8").split(" ")[0])
  } catch {
    return os.uptime()
  }
}

export async function collectMetrics(): Promise<Metrics> {
  const cpu = await sampleCpu()
  const load = os.loadavg()
  const mem = process.memoryUsage()
  const att = attachmentUsage()
  return {
    at: Date.now(),
    cpu: { pct: cpu.total, cores: cpu.cores, count: cpu.cores.length || os.cpus().length, load1: load[0], load5: load[1], load15: load[2] },
    memory: readMemory(),
    disks: readDisks(),
    host: { uptimeSec: hostUptime() },
    app: { uptimeSec: process.uptime(), rss: mem.rss, heapUsed: mem.heapUsed, node: process.version },
    storage: { dbBytes: dbBytes(), attachmentBytes: att.bytes, attachmentFiles: att.files },
  }
}
