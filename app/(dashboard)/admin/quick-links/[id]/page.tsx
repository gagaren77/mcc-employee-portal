import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Bookmark } from "lucide-react"
import { QuickLinkForm } from "../quick-link-form"

export default async function EditQuickLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) redirect("/admin/quick-links")
  const l = await prisma.quickLink.findUnique({ where: { id } })
  if (!l) notFound()
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Bookmark className="w-6 h-6 text-[#1a4a8a]" />Edit Quick Link</h1>
        <p className="text-gray-500 text-sm mt-1">{l.title}</p>
      </div>
      <QuickLinkForm initial={{ id: l.id, title: l.title, url: l.url, description: l.description ?? "", category: l.category, isActive: l.isActive }} />
    </div>
  )
}
