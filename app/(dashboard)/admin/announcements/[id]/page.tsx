import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Megaphone } from "lucide-react"
import { AnnouncementForm } from "../announcement-form"

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) redirect("/admin/announcements")
  const a = await prisma.announcement.findUnique({ where: { id } })
  if (!a) notFound()
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-[#1a4a8a]" />
          Edit Announcement
        </h1>
        <p className="text-gray-500 text-sm mt-1">{a.title}</p>
      </div>
      <AnnouncementForm
        initial={{ id: a.id, title: a.title, content: a.content, category: a.category, priority: a.priority, pinned: a.pinned, published: a.published }}
      />
    </div>
  )
}
