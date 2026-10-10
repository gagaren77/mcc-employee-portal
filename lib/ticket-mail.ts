import { prisma } from "@/lib/prisma"
import { graphConfigured, listInboxMessages, SUPPORT_MAILBOX, type InboxMessage } from "@/lib/graph"
import { createTicket } from "@/lib/tickets"
import { notifyRequesterReceived } from "@/lib/ticket-notify"

const STATE_KEY = "support_inbox_since"
let running = false

export interface SyncResult {
  ok: boolean
  initialized?: boolean
  created: number
  commented: number
  skipped: number
  error?: string
}

function htmlToText(html: string): string {
  return html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** Drops the quoted previous message from a reply. */
function stripQuoted(text: string): string {
  const cut = text.search(/^(On .{5,200}wrote:|-{2,}\s*Original Message\s*-{2,}|From:\s.+|_{8,}|>+ )/m)
  const out = cut > 0 ? text.slice(0, cut) : text
  return out.trim() || text.trim()
}

function isAutomated(m: InboxMessage): boolean {
  const addr = m.from?.emailAddress.address.toLowerCase() ?? ""
  if (!addr || addr === SUPPORT_MAILBOX.toLowerCase()) return true
  if (/(mailer-daemon|postmaster|no-?reply|do-?not-?reply)@/.test(addr)) return true
  if (/^(automatic reply|auto:|undeliverable|delivery status|out of office)/i.test((m.subject ?? "").trim())) return true
  for (const h of m.internetMessageHeaders ?? []) {
    const n = h.name.toLowerCase()
    const v = h.value.toLowerCase().trim()
    if (n === "auto-submitted" && v !== "no") return true
    if (n === "x-auto-response-suppress" || n === "x-autoreply" || n === "x-autorespond") return true
    if (n === "precedence" && /(bulk|junk|list|auto_reply)/.test(v)) return true
  }
  return false
}

async function handleMessage(m: InboxMessage): Promise<"created" | "commented" | "skipped"> {
  if (isAutomated(m)) return "skipped"
  const msgId = m.internetMessageId
  if (msgId) {
    const [t, c] = await Promise.all([
      prisma.ticket.findUnique({ where: { sourceMessageId: msgId }, select: { id: true } }),
      prisma.ticketComment.findUnique({ where: { messageId: msgId }, select: { id: true } }),
    ])
    if (t || c) return "skipped"
  }

  const sender = m.from!.emailAddress
  const email = sender.address.toLowerCase()
  const subject = (m.subject ?? "(no subject)").trim()
  const raw = m.body.contentType.toLowerCase() === "html" ? htmlToText(m.body.content) : m.body.content.trim()
  const received = new Date(m.receivedDateTime)

  // Reply to an existing ticket: subject carries [MCC-1042]
  const tagMatch = subject.match(/\[MCC-(\d+)\]/i)
  if (tagMatch) {
    const ticket = await prisma.ticket.findUnique({ where: { number: Number(tagMatch[1]) } })
    if (ticket) {
      const user = await prisma.user.findFirst({ where: { email }, select: { id: true } })
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: user?.id ?? null,
          authorEmail: email,
          authorName: sender.name || email,
          body: stripQuoted(raw).slice(0, 10000),
          source: "EMAIL",
          messageId: msgId || null,
          createdAt: received,
        },
      })
      const reopen = ticket.status === "RESOLVED" || ticket.status === "WAITING"
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { lastActivityAt: received, ...(reopen ? { status: "OPEN", resolvedAt: null } : {}) },
      })
      return "commented"
    }
  }

  const ticket = await createTicket({
    subject,
    description: raw.slice(0, 10000) || "(empty message)",
    category: "Other",
    source: "EMAIL",
    requesterEmail: email,
    requesterName: sender.name || null,
    sourceMessageId: msgId || null,
    createdAt: received,
  })

  // Acknowledge, but cap per-sender acks to damp any auto-responder ping-pong.
  const recent = await prisma.ticket.count({
    where: { requesterEmail: email, source: "EMAIL", createdAt: { gt: new Date(Date.now() - 3600_000) } },
  })
  if (recent <= 3) await notifyRequesterReceived(ticket)
  return "created"
}

/**
 * Imports new mail from the shared support inbox. Read-only on the mailbox: it never marks,
 * moves or deletes messages, so engineers' view of the inbox is unchanged.
 * The first ever run only records "now" so old mail is not backfilled into tickets.
 */
export async function syncSupportInbox(): Promise<SyncResult> {
  const result: SyncResult = { ok: true, created: 0, commented: 0, skipped: 0 }
  if (!graphConfigured()) return { ...result, ok: false, error: "Microsoft Graph not configured" }
  if (running) return { ...result, ok: false, error: "Sync already running" }
  running = true
  try {
    const state = await prisma.mailSyncState.findUnique({ where: { key: STATE_KEY } })
    if (!state) {
      await prisma.mailSyncState.create({ data: { key: STATE_KEY, value: new Date().toISOString() } })
      return { ...result, initialized: true }
    }

    let since = state.value
    for (let page = 0; page < 5; page++) {
      // 5s overlap so same-second arrivals are never missed; duplicates are skipped via message-id
      const msgs = await listInboxMessages(new Date(Date.parse(since) - 5000).toISOString(), SUPPORT_MAILBOX, 50)
      if (msgs.length === 0) break
      for (const m of msgs) {
        try {
          const r = await handleMessage(m)
          if (r !== "skipped") result[r]++
          else result.skipped++
        } catch (e) {
          console.error("[mail-sync] message failed:", m.id, (e as Error).message)
          result.skipped++
        }
        since = m.receivedDateTime
      }
      await prisma.mailSyncState.update({ where: { key: STATE_KEY }, data: { value: since } })
      if (msgs.length < 50) break
    }
    return result
  } catch (e) {
    return { ...result, ok: false, error: (e as Error).message }
  } finally {
    running = false
  }
}
