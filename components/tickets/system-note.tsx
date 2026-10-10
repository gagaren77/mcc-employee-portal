import { CheckCircle2, XCircle } from "lucide-react"

/** Timeline line for system events. Approval decisions stand out in green / red. */
export function SystemNote({ body, meta }: { body: string; meta: string }) {
  const approved = /^Approved by /.test(body)
  const declined = /^Declined by /.test(body)
  if (approved || declined) {
    const Icon = approved ? CheckCircle2 : XCircle
    return (
      <p className={`mx-auto max-w-fit flex items-start gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${approved ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span>
          {body} <span className="font-normal opacity-80">— {meta}</span>
        </span>
      </p>
    )
  }
  return (
    <p className="text-xs text-gray-400 text-center">
      {body} — {meta}
    </p>
  )
}
