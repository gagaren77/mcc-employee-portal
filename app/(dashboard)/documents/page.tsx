import { FileText, FolderOpen, ExternalLink, Share2, Search, Book, Briefcase, Users, GraduationCap } from "lucide-react"

// Placeholder SharePoint document sections
// Replace URLs with your actual SharePoint site URLs
const sharepointSections = [
  {
    id: "policies",
    title: "Policies & Procedures",
    icon: Book,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    description: "Company-wide policies, employee handbook, and standard procedures.",
    links: [
      { title: "Employee Handbook 2024-25", url: "#", type: "PDF" },
      { title: "Code of Conduct", url: "#", type: "DOC" },
      { title: "Remote Work Policy", url: "#", type: "DOC" },
      { title: "IT Acceptable Use Policy", url: "#", type: "PDF" },
      { title: "Data Privacy Policy", url: "#", type: "PDF" },
    ],
  },
  {
    id: "hr",
    title: "HR Documents",
    icon: Users,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    description: "Benefits enrollment, onboarding materials, and HR forms.",
    links: [
      { title: "Benefits Enrollment Guide", url: "#", type: "PDF" },
      { title: "Onboarding Checklist", url: "#", type: "DOC" },
      { title: "PTO Request Form", url: "#", type: "FORM" },
      { title: "Performance Review Template", url: "#", type: "DOC" },
      { title: "Direct Deposit Form", url: "#", type: "PDF" },
    ],
  },
  {
    id: "academic",
    title: "Academic Resources",
    icon: GraduationCap,
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
    description: "Curriculum materials, academic calendars, and program documentation.",
    links: [
      { title: "Academic Calendar 2024-25", url: "#", type: "PDF" },
      { title: "Course Catalog", url: "#", type: "DOC" },
      { title: "Accreditation Documents", url: "#", type: "FOLDER" },
      { title: "Faculty Handbook", url: "#", type: "PDF" },
    ],
  },
  {
    id: "operations",
    title: "Operations & Facilities",
    icon: Briefcase,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    description: "Facilities guides, maintenance requests, and operational procedures.",
    links: [
      { title: "Campus Map & Directory", url: "#", type: "PDF" },
      { title: "Facilities Request Form", url: "#", type: "FORM" },
      { title: "Emergency Procedures", url: "#", type: "PDF" },
      { title: "Vendor Contact List", url: "#", type: "DOC" },
    ],
  },
]

function getTypeColor(type: string) {
  switch (type) {
    case "PDF": return "bg-red-100 text-red-700"
    case "DOC": return "bg-blue-100 text-blue-700"
    case "FORM": return "bg-green-100 text-green-700"
    case "FOLDER": return "bg-amber-100 text-amber-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function DocumentsPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#1a4a8a]" />
            Documents & Resources
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Access company documents, policies, and SharePoint resources.
          </p>
        </div>
        <a
          href="https://YOUR-TENANT.sharepoint.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 mcc-btn-primary text-sm"
        >
          <Share2 className="w-4 h-4" />
          Open SharePoint
        </a>
      </div>

      {/* SharePoint embed note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Share2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">SharePoint Integration</p>
          <p className="text-xs text-blue-600 mt-0.5">
            This page links directly to your SharePoint intranet documents. Update the URLs in{" "}
            <code className="bg-blue-100 px-1 rounded">app/(dashboard)/documents/page.tsx</code>{" "}
            to point to your actual SharePoint site.
          </p>
        </div>
      </div>

      {/* Document sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {sharepointSections.map((section) => {
          const Icon = section.icon
          return (
            <div key={section.id} className={`mcc-card border-l-4 ${section.color}`}>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-5 h-5 ${section.iconColor}`} />
                  <h2 className="font-semibold text-gray-800">{section.title}</h2>
                </div>
                <p className="text-xs text-gray-500 mb-4">{section.description}</p>

                <div className="space-y-2">
                  {section.links.map((link) => (
                    <a
                      key={link.title}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/80 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-gray-400 group-hover:text-[#1a4a8a]" />
                        <span className="text-sm text-gray-700 group-hover:text-[#1a4a8a]">
                          {link.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${getTypeColor(link.type)}`}>
                          {link.type}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
