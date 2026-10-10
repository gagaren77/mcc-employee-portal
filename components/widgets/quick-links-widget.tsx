import { ExternalLink, Bookmark, ArrowRight } from "lucide-react"
import { linkKind } from "@/lib/quick-link-constants"
import Link from "next/link"
import * as LucideIcons from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickLink {
  id: string
  title: string
  url: string
  description?: string | null
  icon?: string | null
  category: string
}

interface QuickLinksWidgetProps {
  quickLinks: QuickLink[]
  canManage?: boolean
}

const categoryColors: Record<string, string> = {
  sharepoint: "bg-blue-50 hover:bg-blue-100 border-blue-100",
  hr: "bg-purple-50 hover:bg-purple-100 border-purple-100",
  it: "bg-cyan-50 hover:bg-cyan-100 border-cyan-100",
  benefits: "bg-green-50 hover:bg-green-100 border-green-100",
  general: "bg-gray-50 hover:bg-gray-100 border-gray-100",
  payroll: "bg-amber-50 hover:bg-amber-100 border-amber-100",
}

const categoryIconColors: Record<string, string> = {
  sharepoint: "text-blue-500",
  hr: "text-purple-500",
  it: "text-cyan-500",
  benefits: "text-green-500",
  general: "text-gray-500",
  payroll: "text-amber-500",
}

export function QuickLinksWidget({ quickLinks, canManage = false }: QuickLinksWidgetProps) {
  return (
    <div className="mcc-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[#1a4a8a]" />
          Quick Links
        </h2>
        <Link href={canManage ? "/admin/quick-links" : "/quick-links"} className="text-xs text-[#1a4a8a] hover:text-[#0d2d5c] font-medium">
          {canManage ? "Manage →" : "View all →"}
        </Link>
      </div>

      {quickLinks.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          No quick links yet.{" "}
          {canManage && (
            <Link href="/admin/quick-links" className="text-[#1a4a8a] hover:underline">
              Add some
            </Link>
          )}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickLinks.map((link) => {
            const colorClass = categoryColors[link.category] ?? categoryColors.general
            const iconColorClass = categoryIconColors[link.category] ?? categoryIconColors.general

            const kind = linkKind(link.url)
            const body = (
              <>
                <div className="flex items-center justify-between">
                  {kind === "internal" ? <ArrowRight className={cn("w-3.5 h-3.5", iconColorClass)} /> : <ExternalLink className={cn("w-3.5 h-3.5", iconColorClass)} />}
                </div>
                <p className="text-sm font-medium text-gray-800 leading-tight">{link.title}</p>
                {(kind === "unset" || link.description) && (
                  <p className="text-xs text-gray-500 line-clamp-1">{kind === "unset" ? "Not set up yet" : link.description}</p>
                )}
              </>
            )
            const cls = cn("flex flex-col gap-1.5 p-3 rounded-xl border transition-colors group", colorClass)
            if (kind === "unset") return <div key={link.id} className={cn(cls, "opacity-60")}>{body}</div>
            if (kind === "internal") return <Link key={link.id} href={link.url} className={cls}>{body}</Link>
            return <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
          })}
        </div>
      )}
    </div>
  )
}
