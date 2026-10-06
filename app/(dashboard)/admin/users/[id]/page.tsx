import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { UserCog } from "lucide-react"
import { EditUserForm } from "./edit-user-form"

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/users")
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { accounts: { select: { provider: true } } },
  })
  if (!user) notFound()

  const isExternal = user.accounts.some((a) => a.provider !== "credentials")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserCog className="w-6 h-6 text-[#1a4a8a]" />
          Manage User
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Update {user.name}&apos;s account details.
        </p>
      </div>

      <EditUserForm
        user={{
          id: user.id,
          name: user.name ?? "",
          email: user.email,
          role: user.role,
          department: user.department ?? "",
          title: user.title ?? "",
          isActive: user.isActive,
          isExternal,
          isSelf: session.user.id === user.id,
        }}
      />
    </div>
  )
}
