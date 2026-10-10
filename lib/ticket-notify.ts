import { sendMail, SUPPORT_MAILBOX } from "@/lib/graph"
import { emailLayout, emailButton } from "@/lib/mailer"
import { appUrl } from "@/lib/app-url"
import { ticketLink } from "@/lib/ticket-links"
import { ticketNumber, STATUS_LABEL } from "@/lib/ticket-constants"

interface T {
  id: string
  number: number
  subject: string
  requesterEmail: string
  requesterName?: string | null
  category?: string
  priority?: string
  status?: string
  accessToken?: string | null
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
const tag = (t: T) => `[${ticketNumber(t.number)}]`
const para = (s: string) => `<p style="font-size:14px;line-height:1.55;margin:0 0 12px">${s}</p>`
const quote = (s: string) =>
  `<div style="background:#f3f4f6;border-left:3px solid #1a4a8a;padding:10px 14px;margin:0 0 14px;font-size:14px;white-space:pre-wrap">${esc(s)}</div>`
const firstName = (n?: string | null) => (n ? " " + esc(n.split(" ")[0]) : "")

// Notifications must never break the action that triggered them.
async function safe(label: string, fn: () => Promise<void>) {
  try {
    await fn()
  } catch (e) {
    console.error(`[ticket-notify] ${label} failed:`, (e as Error).message)
  }
}

export const notifyRequesterReceived = (t: T) =>
  safe("received", async () => {
    const href = await ticketLink(t)
    await sendMail({
      to: [t.requesterEmail],
      subject: `${tag(t)} We received your request: ${t.subject}`,
      html: emailLayout(
        `Ticket ${ticketNumber(t.number)} received`,
        para(`Hi${firstName(t.requesterName)},`) +
          para("IT Department has received your request and will get back to you soon.") +
          quote(t.subject) +
          para(`To add information, just reply to this email (keep <b>${esc(tag(t))}</b> in the subject).`) +
          emailButton(href, "View ticket")
      ),
    })
  })

export const notifyRequesterReply = (t: T, from: string, body: string) =>
  safe("reply", async () => {
    const href = await ticketLink(t)
    await sendMail({
      to: [t.requesterEmail],
      subject: `${tag(t)} ${t.subject}`,
      html: emailLayout(
        `New reply on ${ticketNumber(t.number)}`,
        para(`<b>${esc(from)}</b> replied:`) +
          quote(body) +
          para(`Reply to this email to respond, or open the ticket.`) +
          emailButton(href, "View ticket")
      ),
    })
  })

export const notifyRequesterStatus = (t: T, status: string) =>
  safe("status", async () => {
    const href = await ticketLink(t)
    await sendMail({
      to: [t.requesterEmail],
      subject: `${tag(t)} ${STATUS_LABEL[status] ?? status}: ${t.subject}`,
      html: emailLayout(
        `${ticketNumber(t.number)} is now ${STATUS_LABEL[status] ?? status}`,
        para(esc(t.subject)) +
          (status === "RESOLVED" ? para("If this isn't fixed, reply to this email and the ticket will reopen.") : "") +
          emailButton(href, "View ticket")
      ),
    })
  })

/**
 * Heads-up for the support team about a ticket created in the portal (email tickets are already
 * in the shared inbox). Sent from the support mailbox to itself; the importer ignores mail
 * sent by the support mailbox, so this cannot loop.
 */
export const notifyTeamNewTicket = (t: T, description: string) =>
  safe("team", async () => {
    await sendMail({
      to: [process.env.TICKET_NOTIFY_EMAIL || SUPPORT_MAILBOX],
      subject: `${tag(t)} New portal ticket: ${t.subject}`,
      html: emailLayout(
        `New ticket ${ticketNumber(t.number)}`,
        para(`${esc(t.requesterName || t.requesterEmail)} &middot; ${esc(t.category ?? "")} &middot; ${esc(t.priority ?? "")}`) +
          quote(description.slice(0, 1500)) +
          emailButton(appUrl(`/tickets/${t.id}`), "Open in queue")
      ),
    })
  })

// ─── Approvals ───────────────────────────────────────────

/**
 * Email to the person asked to approve. Buttons open a confirmation page (never a one-click action),
 * so mail scanners that pre-fetch links cannot approve or decline by accident. The subject carries
 * [MCC-n], so if the approver simply replies, the reply is added to the ticket.
 */
export const notifyApprover = (
  t: T,
  description: string,
  a: { approverEmail: string; approverName?: string | null; token: string; note?: string | null; requestedByName?: string | null }
) =>
  safe("approver", async () => {
    const review = appUrl(`/approve/${a.token}`)
    const track = await ticketLink(t)
    await sendMail({
      to: [a.approverEmail],
      subject: `${tag(t)} Approval needed: ${t.subject}`,
      html: emailLayout(
        "Your approval is requested",
        para(`Hi${firstName(a.approverName)},`) +
          para(
            `${esc(a.requestedByName || "IT")} is asking for your approval on a request from <b>${esc(t.requesterName || t.requesterEmail)}</b>` +
              (t.category ? ` (${esc(t.category)})` : "") +
              ":"
          ) +
          `<p style="font-size:15px;font-weight:600;margin:0 0 8px">${esc(t.subject)}</p>` +
          quote(description.slice(0, 1500)) +
          (a.note ? para("<b>Note from IT:</b>") + quote(a.note) : "") +
          `<p style="margin:0 0 16px">${emailButton(`${review}?choice=approve`, "Approve", "#15803d")}&nbsp;&nbsp;${emailButton(`${review}?choice=decline`, "Decline", "#b91c1c")}</p>` +
          para(`You'll be asked to confirm on the next page. No login needed.`) +
          para(`You can also <a href="${esc(track)}" style="color:#1a4a8a">track this ticket</a>, or reply to this email with questions — your reply is added to the ticket.`)
      ),
    })
  })

/** Tell the requester and the support team that an approver decided. */
export const notifyDecision = (t: T, approverName: string, decision: "APPROVED" | "DECLINED", comment?: string | null) =>
  safe("decision", async () => {
    const href = await ticketLink(t)
    const word = decision === "APPROVED" ? "approved" : "declined"
    const body =
      para(`<b>${esc(approverName)}</b> ${word} this request.`) +
      para(esc(t.subject)) +
      (comment ? quote(comment) : "") +
      emailButton(href, "View ticket")
    await sendMail({
      to: [t.requesterEmail],
      subject: `${tag(t)} ${decision === "APPROVED" ? "Approved" : "Declined"}: ${t.subject}`,
      html: emailLayout(`Request ${word}`, body),
    })
    await sendMail({
      to: [process.env.TICKET_NOTIFY_EMAIL || SUPPORT_MAILBOX],
      subject: `${tag(t)} ${decision === "APPROVED" ? "Approved" : "Declined"} by ${approverName}: ${t.subject}`,
      html: emailLayout(`Approval ${word}`, body.replace(href, appUrl(`/tickets/${t.id}`))),
    })
  })
