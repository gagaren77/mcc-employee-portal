import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["EMPLOYEE", "HR", "IT", "ADMIN"]).optional(),
  department: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

const ResetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

async function loadUserAndSession(id: string) {
  const session = await auth()
  if (!session?.user) return { session: null, user: null }
  const user = await prisma.user.findUnique({
    where: { id },
    include: { accounts: { select: { provider: true } } },
  })
  return { session, user }
}

function isExternal(user: { accounts: { provider: string }[] }) {
  return user.accounts.some((a) => a.provider !== "credentials")
}

// Count remaining active admins (for safety checks)
async function countOtherAdmins(excludeUserId: string) {
  return prisma.user.count({
    where: { role: "ADMIN", isActive: true, NOT: { id: excludeUserId } },
  })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, user } = await loadUserAndSession(id)
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      title: user.title,
      isActive: user.isActive,
      createdAt: user.createdAt,
      isExternal: isExternal(user),
    },
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, user } = await loadUserAndSession(id)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json().catch(() => null)

  // Special case: password reset uses a different payload
  if (body && typeof body === "object" && "newPassword" in body) {
    if (isExternal(user)) {
      return NextResponse.json(
        {
          error:
            "This user signs in via SSO. Their password must be changed through the SSO provider.",
        },
        { status: 400 }
      )
    }
    const parsed = ResetPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid password" },
        { status: 400 }
      )
    }
    const hash = await bcrypt.hash(parsed.data.newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    })
    return NextResponse.json({ success: true })
  }

  // Standard profile update
  const parsed = UpdateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    )
  }

  const data = parsed.data

  // Safety: can't demote the last admin
  if (data.role && data.role !== "ADMIN" && user.role === "ADMIN") {
    const remaining = await countOtherAdmins(user.id)
    if (remaining === 0) {
      return NextResponse.json(
        { error: "Cannot change role: this is the last active admin." },
        { status: 400 }
      )
    }
  }

  // Safety: can't deactivate yourself
  if (data.isActive === false && session.user.id === user.id) {
    return NextResponse.json(
      { error: "You cannot deactivate your own account." },
      { status: 400 }
    )
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { id: true },
  })
  return NextResponse.json({ user: updated })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, user } = await loadUserAndSession(id)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (session.user.id === user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    )
  }

  if (user.role === "ADMIN") {
    const remaining = await countOtherAdmins(user.id)
    if (remaining === 0) {
      return NextResponse.json(
        { error: "Cannot delete the last active admin." },
        { status: 400 }
      )
    }
  }

  await prisma.user.delete({ where: { id: user.id } })
  return NextResponse.json({ success: true })
}
