import { TicketForm } from "@/components/tickets/ticket-form"
import { Ticket } from "lucide-react"
import Link from "next/link"

export default async function NewTicketPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/tickets" className="text-xs text-[#1a4a8a] hover:underline">← My tickets</Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mt-1">
          <Ticket className="w-6 h-6 text-[#1a4a8a]" />
          New IT Ticket
        </h1>
        <p className="text-gray-500 text-sm mt-1">IT will email you updates and you can track progress here.</p>
      </div>
      <div className="mcc-card p-5">
        <TicketForm defaultCategory={category ?? ""} />
      </div>
    </div>
  )
}
