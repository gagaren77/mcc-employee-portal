import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Bookmark, Settings } from "lucide-react"
import { QuickLinksBrowser } from "@/components/quick-links/quick-links-browser"

export default async function QuickLinksPage() {
  const session = await auth()
  const canManage = !!session?.user && ["ADMIN", "HR"].includes(session.user.role)

  const links = await prisma.quickLink.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, url: true, description: true, category: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Bookmark className="h-6 w-6 text-[#1a4a8a]" />
            Quick Links
          </h1>
          <p className="mt-1 text-sm text-gray-500">Frequently used tools and resources, grouped in one place.</p>
        </div>
        {canManage && (
          <Link href="/admin/quick-links" className="mcc-btn-primary flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Manage links
          </Link>
        )}
      </div>

      {links.length === 0 ? (
        <div className="mcc-card p-12 text-center">
          <Bookmark className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No quick links configured yet.</p>
          {canManage && <p className="mt-1 text-xs text-gray-400">Use &quot;Manage links&quot; to add some.</p>}
        </div>
      ) : (
        <QuickLinksBrowser links={links} />
      )}
    </div>
  )
}
