import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { isStaff } from "@/lib/tickets"
import { requestApproval } from "@/lib/approvals"

const Schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  name: z.string().trim().max(120).optional().nullable(),
  note: z.string().trim().max(2000).optional().nullable(),
})

// Staff: ask someone to approve this ticket.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id || !isStaff(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const parsed = Schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })

  try {
    await requestApproval({
      ticketId: id,
      approverEmail: parsed.data.email,
      approverName: parsed.data.name,
      note: parsed.data.note,
      actor: { id: session.user.id, name: session.user.name },
    })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
