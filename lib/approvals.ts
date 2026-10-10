import { prisma } from "@/lib/prisma"
import { hashToken, newToken } from "@/lib/tokens"
import { addSystemNote } from "@/lib/tickets"
import { approvalLimit } from "@/lib/ticket-constants"
import { notifyApprover, notifyDecision } from "@/lib/ticket-notify"

const EXPIRY_DAYS = 30
const OPEN_STATES = ["OPEN", "IN_PROGRESS", "WAITING", "PENDING_APPROVAL"]

const expiry = () => new Date(Date.now() + EXPIRY_DAYS * 86400_000)

/** Moves the ticket status along with its approvals (never touches resolved/closed tickets). */
async function syncTicketStatus(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, select: { status: true } })
  if (!ticket || !OPEN_STATES.includes(ticket.status)) return
  const all = await prisma.ticketApproval.findMany({ where: { ticketId, NOT: { status: "CANCELLED" } }, select: { status: true } })
  let next = ticket.status
  if (all.some((a: { status: string }) => a.status === "PENDING")) next = "PENDING_APPROVAL"
  else if (all.some((a: { status: string }) => a.status === "DECLINED")) next = "OPEN"
  else if (all.length > 0) next = "IN_PROGRESS" // everyone approved
  else if (ticket.status === "PENDING_APPROVAL") next = "OPEN" // all requests cancelled
  if (next !== ticket.status) await prisma.ticket.update({ where: { id: ticketId }, data: { status: next, lastActivityAt: new Date() } })
}

export async function requestApproval(input: {
  ticketId: string
  approverEmail: string
  approverName?: string | null
  note?: string | null
  actor: { id: string; name?: string | null }
}) {
  const ticket = await prisma.ticket.findUnique({ where: { id: input.ticketId } })
  if (!ticket) throw new Error("Ticket not found")
  const limit = approvalLimit(ticket.category)
  if (limit === 0) throw new Error("Approvals are only available on Equipment Request and Access Request tickets")
  const active = await prisma.ticketApproval.count({ where: { ticketId: ticket.id, status: { in: ["PENDING", "APPROVED"] } } })
  if (active >= limit) throw new Error(`This ticket already has ${limit === 1 ? "an approver" : `${limit} approvers`}. Cancel a pending request first.`)

  const email = input.approverEmail.trim().toLowerCase()
  const user = await prisma.user.findFirst({ where: { email } })

  const dup = await prisma.ticketApproval.findFirst({ where: { ticketId: ticket.id, approverEmail: email, status: "PENDING" } })
  if (dup) throw new Error("An approval request to this person is already pending")

  const token = newToken()
  const approval = await prisma.ticketApproval.create({
    data: {
      ticketId: ticket.id,
      approverEmail: email,
      approverName: input.approverName || user?.name || null,
      approverUserId: user?.id ?? null,
      requestedById: input.actor.id,
      requestedByName: input.actor.name ?? null,
      note: input.note?.trim() || null,
      tokenHash: hashToken(token),
      expiresAt: expiry(),
    },
  })
  await addSystemNote(ticket.id, `Approval requested from ${approval.approverName || email}`, input.actor.name)
  await syncTicketStatus(ticket.id)
  void notifyApprover(ticket, ticket.description, {
    approverEmail: email,
    approverName: approval.approverName,
    token,
    note: approval.note,
    requestedByName: input.actor.name,
  })
  return approval
}

/** New link (old one stops working) and a fresh email. */
export async function resendApproval(approvalId: string, actor: { name?: string | null }) {
  const a = await prisma.ticketApproval.findUnique({ where: { id: approvalId }, include: { ticket: true } })
  if (!a || a.status !== "PENDING") throw new Error("Only pending requests can be resent")
  const token = newToken()
  await prisma.ticketApproval.update({ where: { id: a.id }, data: { tokenHash: hashToken(token), expiresAt: expiry() } })
  await addSystemNote(a.ticketId, `Approval request re-sent to ${a.approverName || a.approverEmail}`, actor.name)
  void notifyApprover(a.ticket, a.ticket.description, {
    approverEmail: a.approverEmail,
    approverName: a.approverName,
    token,
    note: a.note,
    requestedByName: a.requestedByName,
  })
}

export async function cancelApproval(approvalId: string, actor: { name?: string | null }) {
  const a = await prisma.ticketApproval.findUnique({ where: { id: approvalId } })
  if (!a || a.status !== "PENDING") throw new Error("Only pending requests can be cancelled")
  await prisma.ticketApproval.update({ where: { id: a.id }, data: { status: "CANCELLED" } })
  await addSystemNote(a.ticketId, `Approval request to ${a.approverName || a.approverEmail} cancelled`, actor.name)
  await syncTicketStatus(a.ticketId)
}

export type ApprovalLookup =
  | { state: "invalid" }
  | { state: "ok"; approval: NonNullable<Awaited<ReturnType<typeof findByToken>>>; effective: "PENDING" | "APPROVED" | "DECLINED" | "CANCELLED" | "EXPIRED" }

async function findByToken(token: string) {
  return prisma.ticketApproval.findUnique({ where: { tokenHash: hashToken(token) }, include: { ticket: true } })
}

export async function lookupApproval(token: string): Promise<ApprovalLookup> {
  if (!token || token.length < 20) return { state: "invalid" }
  const approval = await findByToken(token)
  if (!approval) return { state: "invalid" }
  const effective = approval.status === "PENDING" && approval.expiresAt < new Date() ? "EXPIRED" : approval.status
  return { state: "ok", approval, effective: effective as "PENDING" | "APPROVED" | "DECLINED" | "CANCELLED" | "EXPIRED" }
}

/** Records the decision. Single use: only a PENDING, unexpired request can be decided, exactly once. */
export async function decideApproval(token: string, decision: "APPROVED" | "DECLINED", comment?: string | null) {
  const found = await lookupApproval(token)
  if (found.state === "invalid") return { ok: false as const, error: "This link is not valid." }
  if (found.effective !== "PENDING") return { ok: false as const, error: `This request is already ${found.effective.toLowerCase()}.` }
  const { approval } = found

  // Atomic guard against double submits.
  const res = await prisma.ticketApproval.updateMany({
    where: { id: approval.id, status: "PENDING" },
    data: { status: decision, decidedAt: new Date(), decisionComment: comment?.trim().slice(0, 2000) || null },
  })
  if (res.count === 0) return { ok: false as const, error: "This request was just decided." }

  const who = approval.approverName || approval.approverEmail
  await addSystemNote(
    approval.ticketId,
    `${decision === "APPROVED" ? "Approved" : "Declined"} by ${who}${comment?.trim() ? `: "${comment.trim().slice(0, 500)}"` : ""}`,
    "Approval link"
  )
  await syncTicketStatus(approval.ticketId)
  void notifyDecision(approval.ticket, who, decision, comment?.trim() || null, approval.approverEmail)
  return { ok: true as const }
}
