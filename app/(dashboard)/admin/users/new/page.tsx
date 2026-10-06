import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UserPlus } from "lucide-react"
import { CreateUserForm } from "./create-user-form"

export default async function NewUserPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/users")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-[#1a4a8a]" />
          Add New User
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a new employee account with a password.
        </p>
      </div>
      <CreateUserForm />
    </div>
  )
}
