import { prisma } from "@/lib/prisma"
import { serveAttachment } from "@/lib/attachment-serve"
import { lookupApproval } from "@/lib/approvals"

// Attachment for the approver, authorised by their approval token (works even if public ticket links are off).
export async function GET(req: Request, { params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params
  const found = await lookupApproval(token)
  if (found.state !== "ok") return new Response("Not found", { status: 404 })

  const att = await prisma.ticketAttachment.findUnique({ where: { id } })
  if (!att || att.ticketId !== found.approval.ticketId) return new Response("Not found", { status: 404 })

  if (att.commentId) {
    const c = await prisma.ticketComment.findUnique({ where: { id: att.commentId }, select: { isInternal: true } })
    if (c?.isInternal) return new Response("Not found", { status: 404 })
  }
  return serveAttachment(att, req)
}
