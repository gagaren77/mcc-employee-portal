import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AnnouncementsWidget } from "@/components/widgets/announcements-widget"
import { EventsWidget } from "@/components/widgets/events-widget"
import { QuickLinksWidget } from "@/components/widgets/quick-links-widget"
import { QUICK_LINK_CATEGORIES } from "@/lib/quick-link-constants"
import { WelcomeBanner } from "@/components/widgets/welcome-banner"

export default async function DashboardPage() {
  const session = await auth()

  const [announcements, events, quickLinks] = await Promise.all([
    prisma.announcement.findMany({
      where: { published: true },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.event.findMany({
      where: { published: true, startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 5,
    }),
    prisma.quickLink.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
  ])

  // Same group order as the Quick Links page, then each group's own order; the dashboard shows the first 8.
  const rank = (c: string) => {
    const i = (QUICK_LINK_CATEGORIES as readonly string[]).indexOf(c)
    return i === -1 ? 99 : i
  }
  const dashboardLinks = [...quickLinks].sort((a, b) => rank(a.category) - rank(b.category) || a.order - b.order).slice(0, 8)

  return (
    <div className="space-y-6">
      <WelcomeBanner user={session!.user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <AnnouncementsWidget announcements={announcements} />
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <EventsWidget events={events} />
          <QuickLinksWidget quickLinks={dashboardLinks} canManage={["ADMIN", "HR"].includes(session!.user.role)} compact />
        </div>
      </div>
    </div>
  )
}
