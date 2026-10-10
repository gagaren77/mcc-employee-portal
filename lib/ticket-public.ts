import { prisma } from "@/lib/prisma"

/** Comments and attachments safe to show to someone holding a token link (never internal notes). */
export async function publicTicketContent(ticketId: string) {
  const [comments, attachments] = await Promise.all([
    prisma.ticketComment.findMany({ where: { ticketId, isInternal: false }, orderBy: { createdAt: "asc" } }),
    prisma.ticketAttachment.findMany({ where: { ticketId }, orderBy: { createdAt: "asc" } }),
  ])
  const internal = await prisma.ticketComment.findMany({ where: { ticketId, isInternal: true }, select: { id: true } })
  const hidden = new Set(internal.map((c: { id: string }) => c.id))
  const visible = attachments.filter((a: { commentId: string | null }) => !a.commentId || !hidden.has(a.commentId))
  const forComment = (commentId: string | null) =>
    visible
      .filter((a: { commentId: string | null }) => (a.commentId ?? null) === commentId)
      .map((a: { id: string; filename: string; mimeType: string; size: number; previewable: boolean }) => ({
        id: a.id,
        filename: a.filename,
        mimeType: a.mimeType,
        size: a.size,
        previewable: a.previewable,
      }))
  return { comments, forComment }
}
