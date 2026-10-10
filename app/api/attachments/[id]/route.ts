import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { readAttachment } from "@/lib/attachments"
import { canViewTicket, isStaff } from "@/lib/tickets"
import { getOfficePreviewPdf } from "@/lib/office-preview"
import { isOfficePreviewable } from "@/lib/ticket-constants"

// GET /api/attachments/<id>            -> inline preview (verified images/PDF only), else download
// GET /api/attachments/<id>?download=1 -> always a download
// GET /api/attachments/<id>?preview=1  -> Word/Excel/PowerPoint etc. converted to PDF for inline viewing
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

  const url = new URL(req.url)
  if (url.searchParams.get("preview") === "1") {
    const msg = (t: string, status: number) => new Response(`<p style="font:14px sans-serif;padding:24px;color:#555">${t}</p>`, { status, headers: { "Content-Type": "text/html; charset=utf-8", "X-Content-Type-Options": "nosniff" } })
    if (att.previewable || !isOfficePreviewable(att.filename)) return msg("No preview for this file type. Use Download.", 415)
    const r = await getOfficePreviewPdf(att.id, att.filename, data)
    if (!r.ok) return msg("Preview isn't available for this file. Use Download to open it.", r.reason === "unavailable" ? 501 : 415)
    return new Response(new Uint8Array(r.pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="preview.pdf"`,
        "Content-Length": String(r.pdf.length),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    })
  }

  const download = url.searchParams.get("download") === "1" || !att.previewable
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
