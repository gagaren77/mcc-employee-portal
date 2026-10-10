"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

export function SyncButton() {
  const router = useRouter()
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)

  async function sync() {
    setBusy(true)
    setMsg("")
    const res = await fetch("/api/tickets/sync", { method: "POST" })
    const d = await res.json().catch(() => ({}))
    setBusy(false)
    if (d.error) setMsg(d.error)
    else if (d.initialized) setMsg("Mailbox sync started — new emails from now on will become tickets.")
    else setMsg(`${d.created} new, ${d.commented} replies`)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      {msg && <span className="text-xs text-gray-500">{msg}</span>}
      <button onClick={sync} disabled={busy} className="mcc-btn-secondary text-sm inline-flex items-center gap-1.5 disabled:opacity-60">
        <RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} /> Check mailbox
      </button>
    </div>
  )
}
