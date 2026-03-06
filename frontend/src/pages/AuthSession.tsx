import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { setSessionToken } from "@/lib/api"

/**
 * Token relay page. The backend redirects here after Discord login with
 * ?token=<jwt>&next=<url>. We store the token in localStorage (first-party)
 * and redirect to the next URL. This avoids cross-origin cookie issues.
 */
export function AuthSession() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const next = searchParams.get("next") || "/"

    if (token) {
      setSessionToken(token)
    }

    window.location.href = next
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Signing in...</p>
      </div>
    </div>
  )
}
