import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { API_BASE } from "@/lib/api"

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const error = searchParams.get("error")

  useEffect(() => {
    // If there's an error param, don't redirect — show the error
    if (error) return

    // Build the "next" URL: back to frontend consent page (not backend)
    // so the token relay flow works correctly
    const authorizeParams = new URLSearchParams()
    searchParams.forEach((value, key) => {
      authorizeParams.set(key, value)
    })
    const nextUrl = `${window.location.origin}/consent?${authorizeParams.toString()}`

    // Redirect to backend Discord OAuth2 endpoint
    window.location.href = `${API_BASE}/auth/discord?next=${encodeURIComponent(nextUrl)}`
  }, [error, searchParams])

  if (error === "not_ns_member") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <svg className="h-7 w-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Not a Network School Member
          </h1>
          <p className="text-sm text-muted-foreground mb-2">
            Your Discord account is not a member of the Network School server.
            Only NS members can sign in.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Visit{" "}
            <a
              href="https://ns.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
            >
              ns.com
            </a>
            {" "}to learn more about Network School and become a member.
          </p>
          <div className="flex flex-col items-center gap-3">
            <a
              href="https://ns.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Become a Member
            </a>
            <button
              onClick={() => {
                const retryParams = new URLSearchParams(searchParams)
                retryParams.delete("error")
                window.location.href = `${window.location.pathname}?${retryParams.toString()}`
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Try again with a different account
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Login Failed
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Something went wrong during sign in ({error}).
          </p>
          <button
            onClick={() => {
              const retryParams = new URLSearchParams(searchParams)
              retryParams.delete("error")
              window.location.href = `${window.location.pathname}?${retryParams.toString()}`
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Redirecting to Discord...</p>
      </div>
    </div>
  )
}
