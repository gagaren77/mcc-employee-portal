import { ClipboardList, Download, ExternalLink, FileText, UserCheck, DollarSign, Clock } from "lucide-react"

const hrCategories = [
  {
    id: "onboarding",
    title: "Onboarding & New Hire",
    icon: UserCheck,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    resources: [
      { title: "New Employee Checklist", type: "DOC", url: "#" },
      { title: "Direct Deposit Authorization", type: "FORM", url: "#" },
      { title: "W-4 Withholding Form", type: "FORM", url: "#" },
      { title: "Emergency Contact Form", type: "FORM", url: "#" },
      { title: "I-9 Employment Eligibility", type: "FORM", url: "#" },
      { title: "Badge/Access Request", type: "FORM", url: "#" },
    ],
  },
  {
    id: "time-off",
    title: "Time Off & Leave",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    resources: [
      { title: "PTO Request Form", type: "FORM", url: "#" },
      { title: "FMLA Leave Request", type: "FORM", url: "#" },
      { title: "Bereavement Leave Policy", type: "PDF", url: "#" },
      { title: "Jury Duty Policy", type: "PDF", url: "#" },
      { title: "PTO Policy Overview", type: "PDF", url: "#" },
      { title: "Holiday Schedule 2024-25", type: "PDF", url: "#" },
    ],
  },
  {
    id: "payroll",
    title: "Payroll & Compensation",
    icon: DollarSign,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    resources: [
      { title: "Payroll Schedule 2024-25", type: "PDF", url: "#" },
      { title: "Expense Reimbursement Form", type: "FORM", url: "#" },
      { title: "Mileage Reimbursement Form", type: "FORM", url: "#" },
      { title: "Update Direct Deposit", type: "LINK", url: "#" },
      { title: "View Pay Stubs (Paylocity)", type: "LINK", url: "#" },
      { title: "W-2 / Tax Documents", type: "LINK", url: "#" },
    ],
  },
  {
    id: "performance",
    title: "Performance & Development",
    icon: ClipboardList,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    resources: [
      { title: "Performance Review Form", type: "FORM", url: "#" },
      { title: "Goal Setting Template", type: "DOC", url: "#" },
      { title: "Training Request Form", type: "FORM", url: "#" },
      { title: "Tuition Assistance Application", type: "FORM", url: "#" },
      { title: "Professional Development Policy", type: "PDF", url: "#" },
    ],
  },
]

function getTypeBadge(type: string) {
  const styles: Record<string, string> = {
    PDF: "bg-red-100 text-red-700",
    DOC: "bg-blue-100 text-blue-700",
    FORM: "bg-green-100 text-green-700",
    LINK: "bg-purple-100 text-purple-700",
  }
  const icons: Record<string, string> = {
    PDF: "↓",
    DOC: "↓",
    FORM: "→",
    LINK: "↗",
  }
  return { style: styles[type] ?? "bg-gray-100 text-gray-700", icon: icons[type] ?? "→" }
}

export default function HRPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-[#1a4a8a]" />
          HR Resources
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Forms, policies, and resources from the Human Resources department.
        </p>
      </div>

      {/* HR Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="mcc-card p-4">
          <p className="text-xs text-gray-500 mb-1">HR Department</p>
          <p className="font-semibold text-gray-800 text-sm">Human Resources</p>
          <a href="mailto:hr@mccollege.edu" className="text-xs text-[#1a4a8a] hover:underline">
            hr@mccollege.edu
          </a>
        </div>
        <div className="mcc-card p-4">
          <p className="text-xs text-gray-500 mb-1">HR Phone</p>
          <p className="font-semibold text-gray-800 text-sm">Main Office</p>
          <a href="tel:+13125551234" className="text-xs text-[#1a4a8a] hover:underline">
            (312) 555-1234
          </a>
        </div>
        <div className="mcc-card p-4">
          <p className="text-xs text-gray-500 mb-1">Payroll System</p>
          <p className="font-semibold text-gray-800 text-sm">Paylocity</p>
          <a
            href="https://access.paylocity.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#1a4a8a] hover:underline flex items-center gap-1"
          >
            Open Paylocity <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Resource categories grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {hrCategories.map((cat) => {
          const Icon = cat.icon
          return (
            <div key={cat.id} className={`mcc-card border-t-4 ${cat.border} overflow-hidden`}>
              <div className={`${cat.bg} px-5 py-3.5 flex items-center gap-2`}>
                <Icon className={`w-5 h-5 ${cat.color}`} />
                <h2 className="font-semibold text-gray-800">{cat.title}</h2>
              </div>
              <div className="p-4 space-y-2">
                {cat.resources.map((resource) => {
                  const { style, icon } = getTypeBadge(resource.type)
                  return (
                    <a
                      key={resource.title}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-gray-400 group-hover:text-[#1a4a8a]" />
                        <span className="text-sm text-gray-700 group-hover:text-[#1a4a8a]">
                          {resource.title}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${style}`}>
                        {resource.type} {icon}
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
