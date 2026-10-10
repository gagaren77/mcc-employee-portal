import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CATEGORIES, createTicket } from "@/lib/tickets"
import { notifyRequesterReceived, notifyTeamNewTicket } from "@/lib/ticket-notify"

const Schema = z.object({
  subject: z.string().trim().min(3, "Subject is too short").max(200),
  description: z.string().trim().min(5, "Please describe the issue").max(10000),
  category: z.enum(CATEGORIES),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const tickets = await prisma.ticket.findMany({
    where: { OR: [{ requesterId: session.user.id }, { requesterEmail: (session.user.email ?? "").toLowerCase() }] },
    orderBy: { lastActivityAt: "desc" },
    take: 100,
  })
  return NextResponse.json({ tickets })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = Schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
  }

  const ticket = await createTicket({
    ...parsed.data,
    source: "PORTAL",
    requesterEmail: session.user.email,
    requesterName: session.user.name,
  })

  // Fire-and-forget: email problems must not fail ticket creation.
  void notifyRequesterReceived(ticket)
  void notifyTeamNewTicket(ticket, ticket.description)

  return NextResponse.json({ ticket: { id: ticket.id, number: ticket.number } }, { status: 201 })
}
