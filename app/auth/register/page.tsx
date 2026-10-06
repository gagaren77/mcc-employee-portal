import { redirect } from "next/navigation"

export default function RegisterPage() {
  // Public registration is disabled.
  // Admin/HR must create accounts from the admin panel.
  redirect("/auth/login")
}
