// Single source of truth for portal roles.
// ADJUNCT: part-time/adjunct faculty. Limited-visibility rules will be applied per-page later.
export const ROLES = ["EMPLOYEE", "ADJUNCT", "HR", "IT", "ADMIN"] as const
export type Role = (typeof ROLES)[number]
