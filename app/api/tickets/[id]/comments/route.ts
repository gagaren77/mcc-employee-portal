import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canViewTicket, isStaff } from "@/lib/tickets"
import { notifyRequesterReply } from "@/lib/ticket-notify"

const Schema = z.object({
  body: z.string().trim().min(1, "Write something first").max(10000),
  isInternal: z.boolean().optional(),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = Schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })

  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket || !canViewTicket(session.user, ticket)) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const staff = isStaff(session.user.role)
  const internal = staff && !!parsed.data.isInternal // requesters can never post internal notes

  const comment = await prisma.ticketComment.create({
    data: {
      ticketId: id,
      authorId: session.user.id,
      authorName: session.user.name,
      authorEmail: session.user.email,
      body: parsed.data.body,
      isInternal: internal,
      source: "PORTAL",
    },
  })

  // A requester reply reopens a resolved/waiting ticket.
  const reopen = !staff && (ticket.status === "RESOLVED" || ticket.status === "WAITING")
  await prisma.ticket.update({
    where: { id },
    data: { lastActivityAt: new Date(), ...(reopen ? { status: "OPEN", resolvedAt: null } : {}) },
  })

  // Public staff reply -> email the requester.
  if (staff && !internal) {
    void notifyRequesterReply(ticket, session.user.name || "IT Support", parsed.data.body)
  }
  return NextResponse.json({ ok: true, commentId: comment.id }, { status: 201 })
}
