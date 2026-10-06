import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, PlusCircle, Shield, UserCheck, UserX } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) {
    redirect("/dashboard")
  }
  const isAdmin = session.user.role === "ADMIN"

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      title: true,
      isActive: true,
      createdAt: true,
      accounts: { select: { provider: true } },
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1a4a8a]" />
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin
              ? "Create, edit, and manage employee accounts."
              : "View employee accounts (read-only)."}
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/users/new"
            className="mcc-btn-primary flex items-center gap-2 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add User
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={users.length} />
        <StatCard
          label="Active"
          value={users.filter((u) => u.isActive).length}
        />
        <StatCard
          label="Admins"
          value={users.filter((u) => u.role === "ADMIN").length}
        />
        <StatCard
          label="SSO Users"
          value={
            users.filter((u) =>
              u.accounts.some((a) => a.provider !== "credentials")
            ).length
          }
        />
      </div>

      {/* Table */}
      <div className="mcc-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                <th className="pb-3 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Source</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Joined</th>
                {isAdmin && <th className="pb-3 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const isExternal = u.accounts.some(
                  (a) => a.provider !== "credentials"
                )
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="py-3 text-gray-600">{u.email}</td>
                    <td className="py-3 text-gray-600">{u.department || "—"}</td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-[#1a4a8a]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      {isExternal ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-700">
                          SSO
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                          Password
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {u.isActive ? (
                          <UserCheck className="w-3 h-3" />
                        ) : (
                          <UserX className="w-3 h-3" />
                        )}
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-gray-400">
                      {formatDate(u.createdAt)}
                    </td>
                    {isAdmin && (
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="text-xs font-medium text-[#1a4a8a] hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="mcc-card p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}
