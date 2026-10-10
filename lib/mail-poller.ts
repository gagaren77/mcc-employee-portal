import { graphConfigured } from "@/lib/graph"
import { syncSupportInbox } from "@/lib/ticket-mail"

const g = globalThis as unknown as { __mailPoller?: boolean }

/** Starts the in-process support-inbox poller once per server instance. */
export function startMailPolling() {
  if (g.__mailPoller) return
  g.__mailPoller = true
  if (!graphConfigured()) {
    console.log("[mail-poller] Graph not configured; email-to-ticket disabled")
    return
  }
  const seconds = Math.max(30, Number(process.env.MAIL_POLL_SECONDS) || 90)
  const tick = async () => {
    const r = await syncSupportInbox()
    if (!r.ok && r.error !== "Sync already running") console.error("[mail-poller]", r.error)
    else if (r.created || r.commented) console.log(`[mail-poller] created=${r.created} commented=${r.commented}`)
  }
  setTimeout(tick, 20_000) // let the DB settle after startup
  setInterval(tick, seconds * 1000)
  console.log(`[mail-poller] polling every ${seconds}s`)
}
