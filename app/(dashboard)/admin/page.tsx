import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Shield, Users, Megaphone, Calendar, Bookmark, PlusCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const [users, announcements, events, quickLinks] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.event.findMany({ orderBy: { startDate: "asc" } }),
    prisma.quickLink.findMany({ orderBy: { order: "asc" } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#1a4a8a]" />
            Admin & HR Management Console
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage portal content, announcements, quick links, and review user accounts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="mcc-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
        </div>
        <div className="mcc-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Announcements</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{announcements.length}</p>
        </div>
        <div className="mcc-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Events</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{events.length}</p>
        </div>
        <div className="mcc-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Quick Links</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{quickLinks.length}</p>
        </div>
      </div>

      {/* Announcements Management */}
      <div className="mcc-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#1a4a8a]" />
            Announcements
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {announcements.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50">
                  <td className="py-3 font-medium text-gray-900">{a.title}</td>
                  <td className="py-3 capitalize text-gray-600">{a.category}</td>
                  <td className="py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-800">
                      {a.priority}
                    </span>
                  </td>
                  <td className="py-3">
                    {a.published ? (
                      <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">Published</span>
                    ) : (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">Draft</span>
                    )}
                  </td>
                  <td className="py-3 text-xs text-gray-400">{formatDate(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Events Management */}
      <div className="mcc-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1a4a8a]" />
            Events
          </h2>
          <Link
            href="/admin/events"
            className="text-sm font-medium text-[#1a4a8a] hover:underline"
          >
            Manage events →
          </Link>
        </div>
        <p className="text-sm text-gray-500">
          {events.length} event{events.length === 1 ? "" : "s"} in the portal. Click
          &ldquo;Manage events&rdquo; to add, edit, or publish/unpublish.
        </p>
      </div>

      {/* Staff Accounts Management */}
      <div className="mcc-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1a4a8a]" />
            Registered Staff
          </h2>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-[#1a4a8a] hover:underline"
          >
            Manage all users →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                <th className="pb-3 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
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
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
