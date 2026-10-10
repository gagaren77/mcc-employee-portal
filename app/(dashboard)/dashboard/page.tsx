import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AnnouncementsWidget } from "@/components/widgets/announcements-widget"
import { EventsWidget } from "@/components/widgets/events-widget"
import { QuickLinksWidget } from "@/components/widgets/quick-links-widget"
import { WelcomeBanner } from "@/components/widgets/welcome-banner"
import { StatsWidget } from "@/components/widgets/stats-widget"

export default async function DashboardPage() {
  const session = await auth()

  const [announcements, events, quickLinks] = await Promise.all([
    prisma.announcement.findMany({
      where: { published: true },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.event.findMany({
      where: { startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 5,
    }),
    prisma.quickLink.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      take: 12,
    }),
  ])

  return (
    <div className="space-y-6">
      <WelcomeBanner user={session!.user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <AnnouncementsWidget announcements={announcements} />
          <QuickLinksWidget quickLinks={quickLinks} />
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <EventsWidget events={events} />
          <StatsWidget />
        </div>
      </div>
    </div>
  )
}
