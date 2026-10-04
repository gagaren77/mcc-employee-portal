import Link from "next/link"
import { AlertCircle, Home, LogIn } from "lucide-react"

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign in link is no longer valid. It may have been used already or it may have expired.",
  OAuthSignin: "Error in constructing an authorization URL. Please try again.",
  OAuthCallback: "Error in handling the response from an OAuth provider.",
  OAuthCreateAccount: "Could not create OAuth provider user in the database.",
  EmailCreateAccount: "Could not create email provider user in the database.",
  Callback: "Error in the OAuth callback handler route.",
  OAuthAccountNotLinked: "Email on this account is already linked to another account.",
  EmailSignin: "Sending the e-mail with the verification token failed.",
  CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An unexpected authentication error occurred.",
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorKey = searchParams.error ?? "Default"
  const message = errorMessages[errorKey] ?? errorMessages.Default

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h1>
      <p className="text-gray-500 text-sm mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/auth/login" className="mcc-btn-primary flex items-center justify-center gap-2">
          <LogIn className="w-4 h-4" />
          Back to Login
        </Link>
        <Link href="/" className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Home className="w-4 h-4" />
          Home
        </Link>
      </div>
      {errorKey !== "Default" && (
        <p className="text-xs text-gray-400 mt-4">Error code: {errorKey}</p>
      )}
    </div>
  )
}
