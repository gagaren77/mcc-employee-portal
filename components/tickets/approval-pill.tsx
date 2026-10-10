import { CheckCircle2, XCircle, Clock } from "lucide-react"

/** Bold green / red / amber status for an approval. */
export function ApprovalPill({ status, expired }: { status: string; expired?: boolean }) {
  if (expired) return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600"><Clock className="w-3.5 h-3.5" />Expired</span>
  if (status === "APPROVED")
    return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700"><CheckCircle2 className="w-3.5 h-3.5" />Approved</span>
  if (status === "DECLINED")
    return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700"><XCircle className="w-3.5 h-3.5" />Declined</span>
  return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"><Clock className="w-3.5 h-3.5" />Waiting</span>
}
