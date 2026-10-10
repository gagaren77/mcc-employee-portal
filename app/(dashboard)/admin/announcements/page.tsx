import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Megaphone, PlusCircle, Pin } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { PRIORITY_LABEL } from "@/lib/announcement-constants"
import { AnnouncementRowActions } from "./announcement-row-actions"

export default async function AdminAnnouncementsPage() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) redirect("/dashboard")

  const announcements = await prisma.announcement.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#1a4a8a]" />
            Announcement Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Post, edit, pin and hide announcements. New posts appear in everyone&apos;s notification bell.</p>
        </div>
        <Link href="/admin/announcements/new" className="mcc-btn-primary flex items-center gap-2 text-sm">
          <PlusCircle className="w-4 h-4" />
          New Announcement
        </Link>
      </div>

      <div className="mcc-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Posted</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">No announcements yet. Click &quot;New Announcement&quot; to post one.</td>
                </tr>
              )}
              {announcements.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50">
                  <td className="py-3 font-medium text-gray-900">
                    {a.pinned && <Pin className="inline w-3.5 h-3.5 mr-1.5 text-[#c9a227]" aria-label="Pinned" />}
                    {a.title}
                  </td>
                  <td className="py-3 capitalize text-gray-600">{a.category}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${a.priority === "URGENT" ? "bg-red-100 text-red-700" : a.priority === "HIGH" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"}`}>
                      {PRIORITY_LABEL[a.priority] ?? a.priority}
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
                  <td className="py-3">
                    <AnnouncementRowActions id={a.id} published={a.published} pinned={a.pinned} title={a.title} />
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
