export interface DiskInfo {
  label: string
  path: string
  total: number
  used: number
  available: number
  pct: number
}

export interface Metrics {
  at: number
  cpu: { pct: number; cores: number[]; count: number; load1: number; load5: number; load15: number }
  memory: { total: number; available: number; used: number; cached: number; swapTotal: number; swapUsed: number }
  disks: DiskInfo[]
  host: { uptimeSec: number }
  app: { uptimeSec: number; rss: number; heapUsed: number; node: string }
  storage: { dbBytes: number | null; attachmentBytes: number; attachmentFiles: number }
}
