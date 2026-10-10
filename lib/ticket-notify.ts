import { sendMail, SUPPORT_MAILBOX } from "@/lib/graph"
import { emailLayout, emailButton } from "@/lib/mailer"
import { appUrl } from "@/lib/app-url"
import { ticketNumber, STATUS_LABEL } from "@/lib/tickets"

interface T {
  id: string
  number: number
  subject: string
  requesterEmail: string
  requesterName?: string | null
  category?: string
  priority?: string
  status?: string
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
const tag = (t: T) => `[${ticketNumber(t.number)}]`
const link = (t: T) => appUrl(`/tickets/${t.id}`)
const para = (s: string) => `<p style="font-size:14px;line-height:1.55;margin:0 0 12px">${s}</p>`
const quote = (s: string) =>
  `<div style="background:#f3f4f6;border-left:3px solid #1a4a8a;padding:10px 14px;margin:0 0 14px;font-size:14px;white-space:pre-wrap">${esc(s)}</div>`

// Notifications must never break the action that triggered them.
async function safe(label: string, fn: () => Promise<void>) {
  try {
    await fn()
  } catch (e) {
    console.error(`[ticket-notify] ${label} failed:`, (e as Error).message)
  }
}

export const notifyRequesterReceived = (t: T) =>
  safe("received", () =>
    sendMail({
      to: [t.requesterEmail],
      subject: `${tag(t)} We received your request: ${t.subject}`,
      html: emailLayout(
        `Ticket ${ticketNumber(t.number)} received`,
        para(`Hi${t.requesterName ? " " + esc(t.requesterName.split(" ")[0]) : ""}, IT has received your request and will get back to you.`) +
          quote(t.subject) +
          para(`To add information, just reply to this email (keep <b>${esc(tag(t))}</b> in the subject) or use the portal.`) +
          emailButton(link(t), "View ticket")
      ),
    })
  )

export const notifyRequesterReply = (t: T, from: string, body: string) =>
  safe("reply", () =>
    sendMail({
      to: [t.requesterEmail],
      subject: `${tag(t)} ${t.subject}`,
      html: emailLayout(
        `New reply on ${ticketNumber(t.number)}`,
        para(`<b>${esc(from)}</b> replied:`) +
          quote(body) +
          para(`Reply to this email to respond, or open the ticket in the portal.`) +
          emailButton(link(t), "View ticket")
      ),
    })
  )

export const notifyRequesterStatus = (t: T, status: string) =>
  safe("status", () =>
    sendMail({
      to: [t.requesterEmail],
      subject: `${tag(t)} ${STATUS_LABEL[status] ?? status}: ${t.subject}`,
      html: emailLayout(
        `${ticketNumber(t.number)} is now ${STATUS_LABEL[status] ?? status}`,
        para(esc(t.subject)) +
          (status === "RESOLVED"
            ? para("If this isn't fixed, reply to this email and the ticket will reopen.")
            : "") +
          emailButton(link(t), "View ticket")
      ),
    })
  )

/**
 * Heads-up for the support team about a ticket created in the portal (email tickets are already
 * in the shared inbox). Sent from the support mailbox to itself; the importer ignores mail
 * sent by the support mailbox, so this cannot loop.
 */
export const notifyTeamNewTicket = (t: T, description: string) =>
  safe("team", () =>
    sendMail({
      to: [process.env.TICKET_NOTIFY_EMAIL || SUPPORT_MAILBOX],
      subject: `${tag(t)} New portal ticket: ${t.subject}`,
      html: emailLayout(
        `New ticket ${ticketNumber(t.number)}`,
        para(`${esc(t.requesterName || t.requesterEmail)} &middot; ${esc(t.category ?? "")} &middot; ${esc(t.priority ?? "")}`) +
          quote(description.slice(0, 1500)) +
          emailButton(link(t), "Open in queue")
      ),
    })
  )
