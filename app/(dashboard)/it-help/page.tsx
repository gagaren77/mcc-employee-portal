"use client"

import { HelpCircle, Monitor, Wifi, Lock, Printer, Phone, Mail, ExternalLink, MessageSquare, Ticket, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useState } from "react"

const categories = [
  {
    id: "account",
    title: "Account & Password",
    icon: Lock,
    color: "text-red-600",
    bg: "bg-red-50",
    items: [
      { title: "Password Reset", description: "Reset your MCC network or Office 365 password.", link: "#", linkText: "Reset Now" },
      { title: "Account Lockout", description: "Your account is locked after 5 failed attempts. Contact IT.", link: "#", linkText: "Submit Ticket" },
      { title: "MFA Setup", description: "Set up multi-factor authentication for your account.", link: "#", linkText: "Setup Guide" },
      { title: "New Employee Account Setup", description: "First time login, email, Teams, and software access.", link: "#", linkText: "Guide" },
    ],
  },
  {
    id: "hardware",
    title: "Hardware & Equipment",
    icon: Monitor,
    color: "text-blue-600",
    bg: "bg-blue-50",
    items: [
      { title: "Equipment Request", description: "Request a new computer, monitor, keyboard, or accessories.", link: "#", linkText: "Request Form" },
      { title: "Hardware Issues", description: "Computer not turning on, slow performance, broken equipment.", link: "#", linkText: "Submit Ticket" },
      { title: "Loaner Equipment", description: "Borrow a laptop or device temporarily.", link: "#", linkText: "Check Availability" },
    ],
  },
  {
    id: "network",
    title: "Network & Connectivity",
    icon: Wifi,
    color: "text-green-600",
    bg: "bg-green-50",
    items: [
      { title: "WiFi Issues", description: "Can't connect to campus WiFi? Check our network guide.", link: "#", linkText: "Network Guide" },
      { title: "VPN Access", description: "Set up VPN for remote access to MCC systems.", link: "#", linkText: "VPN Setup" },
      { title: "Network Drive Access", description: "Map shared network drives and file servers.", link: "#", linkText: "Instructions" },
    ],
  },
  {
    id: "printing",
    title: "Printing & Scanning",
    icon: Printer,
    color: "text-purple-600",
    bg: "bg-purple-50",
    items: [
      { title: "Printer Setup", description: "Add a campus printer to your computer.", link: "#", linkText: "Instructions" },
      { title: "Print Issues", description: "Printer not working, paper jams, or print quality issues.", link: "#", linkText: "Submit Ticket" },
      { title: "Printing Credits", description: "Check or add to your printing credit balance.", link: "#", linkText: "Print Portal" },
    ],
  },
]

const statusItems = [
  { service: "Email (Office 365)", status: "operational" },
  { service: "Teams / Video Conferencing", status: "operational" },
  { service: "LMS (Learning Management)", status: "operational" },
  { service: "Student Information System", status: "degraded" },
  { service: "Paylocity", status: "operational" },
  { service: "VPN", status: "operational" },
]

function StatusBadge({ status }: { status: string }) {
  if (status === "operational") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-700">
        <CheckCircle className="w-3.5 h-3.5" /> Operational
      </span>
    )
  }
  if (status === "degraded") {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-700">
        <Clock className="w-3.5 h-3.5" /> Degraded
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-red-700">
      <AlertCircle className="w-3.5 h-3.5" /> Down
    </span>
  )
}

export default function ITHelpPage() {
  const [ticketForm, setTicketForm] = useState({ subject: "", description: "", category: "" })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In production: POST to your ticketing system API
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
    setTicketForm({ subject: "", description: "", category: "" })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#1a4a8a]" />
          IT Help Desk
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Technical support, troubleshooting guides, and service requests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="tel:+13125559999" className="mcc-card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Call IT</p>
                <p className="text-sm font-semibold text-gray-800">(312) 555-9999</p>
                <p className="text-xs text-gray-400">M–F 8am–6pm</p>
              </div>
            </a>
            <a href="mailto:helpdesk@mccollege.edu" className="mcc-card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email IT</p>
                <p className="text-sm font-semibold text-gray-800">helpdesk@mcc</p>
                <p className="text-xs text-gray-400">24hr response</p>
              </div>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="mcc-card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">IT Portal</p>
                <p className="text-sm font-semibold text-gray-800">Ticket System</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">Open <ExternalLink className="w-3 h-3" /></p>
              </div>
            </a>
          </div>

          {/* Help categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <div key={cat.id} className="mcc-card overflow-hidden">
                  <div className={`${cat.bg} px-4 py-3 flex items-center gap-2`}>
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    <h3 className="font-semibold text-gray-800 text-sm">{cat.title}</h3>
                  </div>
                  <div className="p-3 space-y-1">
                    {cat.items.map((item) => (
                      <div key={item.title} className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                          </div>
                          <a href={item.link} className="flex-shrink-0 text-xs text-[#1a4a8a] font-medium hover:underline whitespace-nowrap">
                            {item.linkText} →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick ticket form */}
          <div className="mcc-card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1a4a8a]" />
              Submit a Support Ticket
            </h3>
            {submitted ? (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl p-4">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Ticket submitted! IT will respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a8a] bg-white"
                      required
                    >
                      <option value="">Select category</option>
                      <option>Account & Password</option>
                      <option>Hardware</option>
                      <option>Network</option>
                      <option>Software</option>
                      <option>Printing</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="Brief summary"
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a8a]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the issue in detail..."
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a8a] resize-none"
                  />
                </div>
                <button type="submit" className="mcc-btn-primary text-sm">
                  Submit Ticket
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar: System Status */}
        <div className="space-y-4">
          <div className="mcc-card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              System Status
            </h3>
            <div className="space-y-2">
              {statusItems.map((s) => (
                <div key={s.service} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-700">{s.service}</span>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
            <a href="#" className="block text-center text-xs text-[#1a4a8a] hover:underline mt-3">
              View full status page →
            </a>
          </div>

          {/* IT hours */}
          <div className="mcc-card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Help Desk Hours</h3>
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between"><span>Monday – Friday</span><span className="font-medium">8:00 AM – 6:00 PM</span></div>
              <div className="flex justify-between"><span>Saturday</span><span className="font-medium">9:00 AM – 1:00 PM</span></div>
              <div className="flex justify-between"><span>Sunday</span><span className="font-medium text-gray-400">Closed</span></div>
            </div>
            <div className="mt-3 p-2.5 bg-amber-50 rounded-lg text-xs text-amber-700">
              After-hours emergencies: (312) 555-0911
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
