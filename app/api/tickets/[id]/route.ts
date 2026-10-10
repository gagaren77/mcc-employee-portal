import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { addSystemNote, CATEGORIES, isStaff, PRIORITIES, STATUSES, STATUS_LABEL } from "@/lib/tickets"
import { notifyRequesterStatus } from "@/lib/ticket-notify"

const Schema = z.object({
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  category: z.enum(CATEGORIES).optional(),
  assigneeId: z.string().nullable().optional(),
})

// Staff only: change status / priority / assignee.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || !isStaff(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const parsed = Schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const ticket = await prisma.ticket.findUnique({ where: { id }, include: { assignee: true } })
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { status, priority, assigneeId, category } = parsed.data
  const data: Record<string, unknown> = { lastActivityAt: new Date() }
  const notes: string[] = []

  if (status && status !== ticket.status) {
    data.status = status
    data.resolvedAt = status === "RESOLVED" || status === "CLOSED" ? new Date() : null
    notes.push(`Status: ${STATUS_LABEL[ticket.status] ?? ticket.status} → ${STATUS_LABEL[status]}`)
  }
  if (priority && priority !== ticket.priority) {
    data.priority = priority
    notes.push(`Priority: ${ticket.priority} → ${priority}`)
  }
  if (category && category !== ticket.category) {
    data.category = category
    notes.push(`Category: ${ticket.category} → ${category}`)
  }
  if (assigneeId !== undefined && assigneeId !== ticket.assigneeId) {
    if (assigneeId) {
      const agent = await prisma.user.findUnique({ where: { id: assigneeId } })
      if (!agent || !isStaff(agent.role)) return NextResponse.json({ error: "Assignee must be IT or Admin" }, { status: 400 })
      notes.push(`Assigned to ${agent.name ?? agent.email}`)
    } else {
      notes.push("Unassigned")
    }
    data.assigneeId = assigneeId
  }

  if (notes.length === 0) return NextResponse.json({ ok: true })

  const updated = await prisma.ticket.update({ where: { id }, data })
  await addSystemNote(id, notes.join(" · "), session.user.name)

  if (status && status !== ticket.status && (status === "RESOLVED" || status === "CLOSED")) {
    void notifyRequesterStatus(updated, status)
  }
  return NextResponse.json({ ok: true })
}
