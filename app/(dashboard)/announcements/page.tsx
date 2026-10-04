import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Megaphone, Pin, Calendar, Tag, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function AnnouncementsPage() {
  const session = await auth()
  const announcements = await prisma.announcement.findMany({
    where: { published: true },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#1a4a8a]" />
            Company Announcements
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Stay up to date with official college news, policy updates, and campus bulletins.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`mcc-card p-6 border-l-4 ${
              ann.pinned ? "border-[#c9a227] bg-amber-50/20" : "border-[#1a4a8a]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {ann.pinned && (
                    <span className="flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      <Pin className="w-3 h-3 text-[#c9a227]" /> Pinned
                    </span>
                  )}
                  <span className="text-xs uppercase font-medium bg-blue-100 text-[#1a4a8a] px-2 py-0.5 rounded-full">
                    {ann.category}
                  </span>
                  {ann.priority === "URGENT" && (
                    <span className="flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{ann.title}</h2>
                <p className="text-sm text-gray-700 mt-2 whitespace-pre-line leading-relaxed">
                  {ann.content}
                </p>
              </div>
              <div className="text-right flex-shrink-0 text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(ann.createdAt)}
              </div>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="mcc-card p-12 text-center text-gray-500">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No announcements found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
