import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { readAttachment } from "@/lib/attachments"
import { canViewTicket, isStaff } from "@/lib/tickets"

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

  let data: Buffer
  try {
    data = await readAttachment(att.id)
  } catch {
    return new Response("File missing", { status: 404 })
  }

  const download = new URL(req.url).searchParams.get("download") === "1" || !att.previewable
  const ascii = att.filename.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "")
  const headers: Record<string, string> = {
    "Content-Type": download ? "application/octet-stream" : att.mimeType,
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(att.filename)}`,
    "Content-Length": String(data.length),
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, max-age=3600",
  }
  if (!download && att.mimeType.startsWith("image/")) {
    headers["Content-Security-Policy"] = "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'"
  }
  return new Response(new Uint8Array(data), { headers })
}
