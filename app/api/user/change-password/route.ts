import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { isExternalUser } from "@/lib/auth-helpers"

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(72, "New password is too long"),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Block SSO users from changing their password here
  if (await isExternalUser(session.user.id)) {
    return NextResponse.json(
      {
        error:
          "Your account uses single sign-on. Please change your password through your SSO provider.",
      },
      { status: 403 }
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = ChangePasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    )
  }

  const { currentPassword, newPassword } = parsed.data

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  })

  if (!user || !user.password) {
    return NextResponse.json(
      { error: "Account does not have a password set." },
      { status: 400 }
    )
  }

  const matches = await bcrypt.compare(currentPassword, user.password)
  if (!matches) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 }
    )
  }

  const newHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: newHash },
  })

  return NextResponse.json({ success: true })
}
