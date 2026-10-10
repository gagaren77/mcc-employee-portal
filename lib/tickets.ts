import { prisma } from "@/lib/prisma"
import { newToken } from "@/lib/tokens"

export * from "@/lib/ticket-constants"

export interface NewTicketInput {
  subject: string
  description: string
  category: string
  priority?: string
  source: "PORTAL" | "EMAIL"
  requesterEmail: string
  requesterName?: string | null
  sourceMessageId?: string | null
  createdAt?: Date
}

/** Creates a ticket with the next MCC-number. Links the requester to a portal user by email when possible. */
export async function createTicket(input: NewTicketInput) {
  const email = input.requesterEmail.trim().toLowerCase()
  const user = await prisma.user.findFirst({ where: { email } })

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const max = await tx.ticket.aggregate({ _max: { number: true } })
        const number = (max._max.number ?? 1000) + 1
        return tx.ticket.create({
          data: {
            number,
            subject: input.subject.slice(0, 200),
            description: input.description,
            category: input.category,
            priority: input.priority ?? "NORMAL",
            source: input.source,
            requesterId: user?.id ?? null,
            requesterEmail: email,
            requesterName: input.requesterName ?? user?.name ?? null,
            sourceMessageId: input.sourceMessageId ?? null,
            accessToken: newToken(),
            ...(input.createdAt ? { createdAt: input.createdAt, lastActivityAt: input.createdAt } : {}),
          },
        })
      })
    } catch (e) {
      // Unique-number race: retry. Anything else (e.g. duplicate sourceMessageId) bubbles up.
      const msg = String((e as Error).message)
      if (attempt < 3 && msg.includes("Unique constraint") && msg.includes("number")) continue
      throw e
    }
  }
  throw new Error("Could not allocate ticket number")
}

export async function addSystemNote(ticketId: string, body: string, actorName?: string | null) {
  await prisma.ticketComment.create({
    data: { ticketId, body, source: "SYSTEM", authorName: actorName ?? "System", isInternal: false },
  })
}
