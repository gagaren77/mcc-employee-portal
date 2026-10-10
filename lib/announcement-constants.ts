export const ANNOUNCEMENT_CATEGORIES = ["general", "hr", "it", "policy", "training", "event", "emergency"] as const
export const ANNOUNCEMENT_PRIORITIES = ["NORMAL", "HIGH", "URGENT"] as const
export const PRIORITY_LABEL: Record<string, string> = { NORMAL: "Normal", HIGH: "High", URGENT: "Urgent" }
