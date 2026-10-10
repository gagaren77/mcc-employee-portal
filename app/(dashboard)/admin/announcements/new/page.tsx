import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Megaphone } from "lucide-react"
import { AnnouncementForm } from "../announcement-form"

export default async function NewAnnouncementPage() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) redirect("/admin/announcements")
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-[#1a4a8a]" />
          New Announcement
        </h1>
        <p className="text-gray-500 text-sm mt-1">Share news with everyone on the portal.</p>
      </div>
      <AnnouncementForm />
    </div>
  )
}
