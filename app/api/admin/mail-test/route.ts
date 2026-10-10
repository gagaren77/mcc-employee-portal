import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { z } from "zod"
import { sendTestEmail } from "@/lib/mailer"
import { graphConfigured, listInboxMessages } from "@/lib/graph"

// Admin-only diagnostics for the Microsoft 365 mail connection.
//   GET  -> is Graph configured? can we read the support inbox? (returns counts only, no message content)
//   POST { to } -> send a test email from the support mailbox
async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!graphConfigured()) return NextResponse.json({ configured: false })
  try {
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    const msgs = await listInboxMessages(since, undefined, 10)
    return NextResponse.json({ configured: true, canRead: true, messagesLast24h: msgs.length })
  } catch (e) {
    return NextResponse.json({ configured: true, canRead: false, error: (e as Error).message }, { status: 502 })
  }
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const parsed = z.object({ to: z.string().email() }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Valid 'to' email required" }, { status: 400 })
  try {
    await sendTestEmail(parsed.data.to)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 })
  }
}
