import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Bookmark } from "lucide-react"
import { QuickLinkForm } from "../quick-link-form"

export default async function NewQuickLinkPage() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) redirect("/admin/quick-links")
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Bookmark className="w-6 h-6 text-[#1a4a8a]" />Add Quick Link</h1>
        <p className="text-gray-500 text-sm mt-1">A shortcut everyone will see on the dashboard and Quick Links page.</p>
      </div>
      <QuickLinkForm />
    </div>
  )
}
