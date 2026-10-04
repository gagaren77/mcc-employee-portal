import { prisma } from "@/lib/prisma"
import { Bookmark, ExternalLink } from "lucide-react"

function getCategoryStyle(category: string) {
  const styles: Record<string, { bg: string; border: string; icon: string; dot: string }> = {
    sharepoint: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", dot: "bg-blue-500" },
    hr: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", dot: "bg-purple-500" },
    it: { bg: "bg-cyan-50", border: "border-cyan-200", icon: "text-cyan-600", dot: "bg-cyan-500" },
    benefits: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", dot: "bg-green-500" },
    payroll: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", dot: "bg-amber-500" },
    general: { bg: "bg-gray-50", border: "border-gray-200", icon: "text-gray-600", dot: "bg-gray-400" },
  }
  return styles[category] ?? styles.general
}

export default async function QuickLinksPage() {
  const quickLinks = await prisma.quickLink.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  })

  const grouped = quickLinks.reduce<Record<string, typeof quickLinks>>((acc, link) => {
    if (!acc[link.category]) acc[link.category] = []
    acc[link.category].push(link)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-[#1a4a8a]" />
          Quick Links
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Frequently used tools and resources at your fingertips.
        </p>
      </div>

      {Object.entries(grouped).map(([category, links]) => {
        const { bg, border, icon, dot } = getCategoryStyle(category)
        return (
          <div key={category} className="mcc-card overflow-hidden">
            <div className={`${bg} ${border} border-b px-5 py-3 flex items-center gap-2`}>
              <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
              <h2 className="font-semibold text-gray-800 capitalize">{category}</h2>
              <span className="text-xs text-gray-400 ml-auto">{links.length} links</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#1a4a8a]/30 hover:bg-blue-50 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <ExternalLink className={`w-4 h-4 ${icon}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1a4a8a] truncate">
                      {link.title}
                    </p>
                    {link.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{link.description}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )
      })}

      {quickLinks.length === 0 && (
        <div className="mcc-card p-12 text-center">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No quick links configured yet.</p>
          <p className="text-xs text-gray-400 mt-1">Admin can add links from the Admin Panel.</p>
        </div>
      )}
    </div>
  )
}
