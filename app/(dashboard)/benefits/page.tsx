import { Heart, Shield, DollarSign, Eye, Smile, Baby, Car, Phone, ExternalLink, AlertCircle } from "lucide-react"

const benefitCategories = [
  {
    id: "health",
    title: "Medical, Dental & Vision",
    icon: Heart,
    color: "bg-red-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    description: "Comprehensive health coverage for you and your eligible dependents.",
    items: [
      {
        name: "Medical Insurance",
        provider: "Blue Cross Blue Shield",
        description: "PPO and HMO plans available. Coverage begins 1st of the month following hire date.",
        link: "#",
        linkText: "View Plan Details",
      },
      {
        name: "Dental Insurance",
        provider: "Delta Dental",
        description: "Preventive care at 100%, basic restorative at 80%, major at 50%.",
        link: "#",
        linkText: "View Coverage",
      },
      {
        name: "Vision Insurance",
        provider: "VSP Vision",
        description: "Annual eye exams, frames/contacts allowance. $150 frame allowance.",
        link: "#",
        linkText: "Find Providers",
      },
    ],
  },
  {
    id: "retirement",
    title: "Retirement & Financial",
    icon: DollarSign,
    color: "bg-green-50",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    description: "Plan for your future with our retirement and financial wellness benefits.",
    items: [
      {
        name: "403(b) Retirement Plan",
        provider: "TIAA",
        description: "MCC matches 100% of your contributions up to 5% of your salary. Vested after 2 years.",
        link: "#",
        linkText: "Manage Account",
      },
      {
        name: "Health Savings Account (HSA)",
        provider: "Optum Bank",
        description: "Available with high-deductible health plans. MCC contributes $500/year.",
        link: "#",
        linkText: "HSA Portal",
      },
      {
        name: "Flexible Spending Account",
        provider: "WageWorks",
        description: "Healthcare and dependent care FSA options. Use pre-tax dollars.",
        link: "#",
        linkText: "FSA Portal",
      },
    ],
  },
  {
    id: "life",
    title: "Life & Disability",
    icon: Shield,
    color: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    description: "Protection for you and your family when you need it most.",
    items: [
      {
        name: "Life Insurance",
        provider: "Mutual of Omaha",
        description: "Basic life insurance at 1.5x annual salary at no cost. Supplemental available.",
        link: "#",
        linkText: "Policy Details",
      },
      {
        name: "Short-Term Disability",
        provider: "Mutual of Omaha",
        description: "60% of weekly salary for up to 26 weeks after a 14-day waiting period.",
        link: "#",
        linkText: "View Policy",
      },
      {
        name: "Long-Term Disability",
        provider: "Mutual of Omaha",
        description: "60% of monthly salary after 90 days. Available to full-time employees.",
        link: "#",
        linkText: "View Policy",
      },
    ],
  },
  {
    id: "wellness",
    title: "Wellness & Work-Life",
    icon: Smile,
    color: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    description: "Programs to support your physical and mental wellbeing.",
    items: [
      {
        name: "Employee Assistance Program (EAP)",
        provider: "Cigna EAP",
        description: "Free confidential counseling, legal, and financial consultations — up to 8 sessions.",
        link: "#",
        linkText: "Access EAP",
      },
      {
        name: "Gym & Wellness Reimbursement",
        provider: "MCC HR",
        description: "Up to $30/month reimbursement for gym memberships or fitness apps.",
        link: "#",
        linkText: "Submit Claim",
      },
      {
        name: "Paid Time Off",
        provider: "Paylocity",
        description: "Accrual starts day 1. Full-time employees earn up to 15 days PTO + 12 holidays.",
        link: "#",
        linkText: "View PTO Balance",
      },
    ],
  },
  {
    id: "family",
    title: "Family & Education",
    icon: Baby,
    color: "bg-pink-50",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    description: "Supporting your family and educational growth.",
    items: [
      {
        name: "Parental Leave",
        provider: "MCC HR",
        description: "6 weeks paid parental leave for primary caregiver; 2 weeks for secondary.",
        link: "#",
        linkText: "Leave Policy",
      },
      {
        name: "Tuition Assistance",
        provider: "MCC HR",
        description: "Up to $5,250/year in tuition reimbursement for job-related coursework.",
        link: "#",
        linkText: "Apply Now",
      },
      {
        name: "Employee Tuition Discount",
        provider: "MCC Admissions",
        description: "Employees and eligible dependents may enroll in MCC programs at reduced rates.",
        link: "#",
        linkText: "Learn More",
      },
    ],
  },
]

export default function BenefitsPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-[#1a4a8a]" />
          Employee Benefits
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          A comprehensive overview of your MCC benefits. Contact HR for enrollment questions.
        </p>
      </div>

      {/* Benefits contact banner */}
      <div className="bg-gradient-to-r from-[#0d2d5c] to-[#1a4a8a] rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Benefits Questions?</p>
          <p className="text-blue-200 text-sm mt-0.5">
            Contact HR for enrollment, changes, or questions about your benefits.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <a href="mailto:hr@mccollege.edu" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Phone className="w-4 h-4" />
            Contact HR
          </a>
          <a href="#" className="flex items-center gap-2 bg-[#c9a227] hover:bg-[#b8911e] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <ExternalLink className="w-4 h-4" />
            Benefits Portal
          </a>
        </div>
      </div>

      {/* Open enrollment notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Open Enrollment Period</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Open enrollment typically runs November 1–15. Update this notice in{" "}
            <code className="bg-amber-100 px-1 rounded">app/(dashboard)/benefits/page.tsx</code>.
          </p>
        </div>
      </div>

      {/* Benefit categories */}
      <div className="space-y-5">
        {benefitCategories.map((category) => {
          const Icon = category.icon
          return (
            <div key={category.id} className="mcc-card overflow-hidden">
              {/* Category header */}
              <div className={`${category.color} px-5 py-4 border-b border-gray-100`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${category.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${category.iconColor}`} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">{category.title}</h2>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {category.items.map((item) => (
                  <div key={item.name} className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-800">{item.name}</h3>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {item.provider}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-xs text-[#1a4a8a] font-medium hover:underline flex items-center gap-1 whitespace-nowrap"
                    >
                      {item.linkText}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
