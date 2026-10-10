import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { isStaff } from "@/lib/tickets"
import { syncSupportInbox } from "@/lib/ticket-mail"

// Staff: pull new mail from the support inbox right now (the background poller also does this).
export async function POST() {
  const session = await auth()
  if (!session?.user || !isStaff(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  return NextResponse.json(await syncSupportInbox())
}
