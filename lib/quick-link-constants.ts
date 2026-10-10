export const QUICK_LINK_CATEGORIES = ["general", "sharepoint", "hr", "benefits", "payroll", "it", "students"] as const

export const CATEGORY_LABEL: Record<string, string> = {
  general: "General",
  sharepoint: "SharePoint",
  hr: "HR",
  benefits: "Benefits",
  payroll: "Payroll",
  it: "IT",
  students: "Students",
}

/** Accepts https/http links, portal paths like /hr, mailto:, and bare domains (https:// is added). Anything else (javascript:, data:, …) is rejected. */
export function normalizeLinkUrl(raw: string): string | null {
  const u = raw.trim()
  if (/^\/(?!\/)\S*$/.test(u)) return u
  if (/^mailto:\S+@\S+$/i.test(u)) return u
  try {
    const x = new URL(u)
    if (x.protocol === "https:" || x.protocol === "http:") return u
  } catch {
    /* not an absolute URL */
  }
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(u)) return `https://${u}`
  return null
}

/** How a link should behave: portal page (same tab), outside site (new tab), or not configured yet. */
export function linkKind(url: string): "internal" | "external" | "unset" {
  const u = (url || "").trim()
  if (!u || u === "#" || /YOUR-|example\.com|changeme/i.test(u)) return "unset"
  return u.startsWith("/") ? "internal" : "external"
}
