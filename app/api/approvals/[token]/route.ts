import { NextResponse } from "next/server"
import { z } from "zod"
import { decideApproval } from "@/lib/approvals"

const Schema = z.object({
  decision: z.enum(["APPROVED", "DECLINED"]),
  comment: z.string().max(2000).optional().nullable(),
})

// Public (no login): the unguessable, single-use token in the URL is the authorisation.
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const parsed = Schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  const r = await decideApproval(token, parsed.data.decision, parsed.data.comment)
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: 409 })
}
