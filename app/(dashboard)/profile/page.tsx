import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { User, Mail, Building, Briefcase, Phone, MapPin, Shield, Calendar } from "lucide-react"
import { getInitials, formatDate } from "@/lib/utils"
import { redirect } from "next/navigation"
import { isExternalUser } from "@/lib/auth-helpers"
import { ChangePasswordForm } from "./change-password-form"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) redirect("/auth/login")

  const isExternal = await isExternalUser(user.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-[#1a4a8a]" />
          My Profile
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          View your staff profile details and account information.
        </p>
      </div>

      <div className="mcc-card overflow-hidden">
        <div className="mcc-gradient h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-[#1a4a8a] text-white flex items-center justify-center text-2xl font-bold shadow-md">
              {getInitials(user.name)}
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-[#1a4a8a] font-medium text-sm mt-0.5">{user.title || "MCC Staff Member"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-[#1a4a8a]">
                <Shield className="w-3.5 h-3.5" />
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Contact Information
              </h3>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Phone:</span>
                <span>{user.phone || "Not specified"}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Location:</span>
                <span>{user.location || "Midwestern Career College - Chicago"}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Employment Details
              </h3>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Building className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Department:</span>
                <span>{user.department || "General"}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Position:</span>
                <span>{user.title || "Staff"}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Member Since:</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password management */}
      <ChangePasswordForm isExternal={isExternal} />
    </div>
  )
}
