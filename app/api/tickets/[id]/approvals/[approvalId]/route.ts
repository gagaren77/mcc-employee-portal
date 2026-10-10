import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isStaff } from "@/lib/tickets"
import { cancelApproval, resendApproval } from "@/lib/approvals"

// Staff: resend (new link, old one stops working) or cancel a pending approval request.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; approvalId: string }> }) {
  const { id, approvalId } = await params
  const session = await auth()
  if (!session?.user?.id || !isStaff(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const parsed = z.object({ action: z.enum(["resend", "cancel"]) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const a = await prisma.ticketApproval.findUnique({ where: { id: approvalId }, select: { ticketId: true } })
  if (!a || a.ticketId !== id) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    if (parsed.data.action === "resend") await resendApproval(approvalId, session.user)
    else await cancelApproval(approvalId, session.user)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
