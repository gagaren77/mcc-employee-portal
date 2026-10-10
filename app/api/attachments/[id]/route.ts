import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canViewTicket, isStaff } from "@/lib/tickets"
import { serveAttachment } from "@/lib/attachment-serve"

// GET /api/attachments/<id>            -> inline preview (verified images/PDF only), else download
// GET /api/attachments/<id>?download=1 -> always a download
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const att = await prisma.ticketAttachment.findUnique({ where: { id } })
  const ticket = att && (await prisma.ticket.findUnique({ where: { id: att.ticketId } }))
  if (!att || !ticket || !canViewTicket(session.user, ticket)) return new Response("Not found", { status: 404 })

  if (att.commentId && !isStaff(session.user.role)) {
    const c = await prisma.ticketComment.findUnique({ where: { id: att.commentId }, select: { isInternal: true } })
    if (c?.isInternal) return new Response("Not found", { status: 404 })
  }

  return serveAttachment(att, req)
}
