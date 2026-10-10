import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { saveAttachment } from "@/lib/attachments"
import { MAX_ATTACHMENTS_PER_TICKET, MAX_FILES_PER_UPLOAD, canViewTicket, isStaff } from "@/lib/tickets"

// multipart/form-data: files=<File>... [commentId=<id>]
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket || !canViewTicket(session.user, ticket)) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: "Invalid upload" }, { status: 400 })
  const files = form.getAll("files").filter((f): f is File => typeof f !== "string")
  if (files.length === 0) return NextResponse.json({ error: "No files" }, { status: 400 })
  if (files.length > MAX_FILES_PER_UPLOAD) return NextResponse.json({ error: `Max ${MAX_FILES_PER_UPLOAD} files at a time` }, { status: 400 })

  const commentIdRaw = form.get("commentId")
  let commentId: string | null = null
  if (typeof commentIdRaw === "string" && commentIdRaw) {
    const c = await prisma.ticketComment.findUnique({ where: { id: commentIdRaw } })
    // Attach only to a comment on this ticket that you wrote (staff may attach to any).
    if (!c || c.ticketId !== id || (c.authorId !== session.user.id && !isStaff(session.user.role))) {
      return NextResponse.json({ error: "Invalid comment" }, { status: 400 })
    }
    commentId = c.id
  }

  const existing = await prisma.ticketAttachment.count({ where: { ticketId: id } })
  if (existing + files.length > MAX_ATTACHMENTS_PER_TICKET) {
    return NextResponse.json({ error: "Too many attachments on this ticket" }, { status: 400 })
  }

  const saved: string[] = []
  const failed: { name: string; reason: string }[] = []
  for (const f of files) {
    const r = await saveAttachment({
      ticketId: id,
      commentId,
      filename: f.name,
      data: Buffer.from(await f.arrayBuffer()),
      uploadedById: session.user.id,
      source: "PORTAL",
    })
    if (r.ok) saved.push(r.id)
    else failed.push({ name: f.name, reason: r.reason })
  }
  if (saved.length) await prisma.ticket.update({ where: { id }, data: { lastActivityAt: new Date() } })
  return NextResponse.json({ saved, failed }, { status: failed.length && !saved.length ? 400 : 201 })
}
