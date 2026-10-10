import { prisma } from "@/lib/prisma"
import { serveAttachment } from "@/lib/attachment-serve"
import { publicLinksEnabled } from "@/lib/ticket-links"

// Attachment via the no-login ticket link. Internal-note attachments are never exposed.
export async function GET(req: Request, { params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params
  if (!publicLinksEnabled() || token.length < 20) return new Response("Not found", { status: 404 })

  const ticket = await prisma.ticket.findFirst({ where: { accessToken: token }, select: { id: true } })
  const att = ticket && (await prisma.ticketAttachment.findUnique({ where: { id } }))
  if (!att || att.ticketId !== ticket.id) return new Response("Not found", { status: 404 })

  if (att.commentId) {
    const c = await prisma.ticketComment.findUnique({ where: { id: att.commentId }, select: { isInternal: true } })
    if (c?.isInternal) return new Response("Not found", { status: 404 })
  }
  return serveAttachment(att, req)
}
