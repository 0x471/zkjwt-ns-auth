/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Code snippet constants — extracted from DocsPage
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export const API_BASE = "https://api.nsauth.org"

// ── React / Manual PKCE ──────────────────────────────────────────

export const PKCE_CODE = `export async function generatePKCE() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const codeVerifier = btoa(String.fromCharCode(...array))
    .replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "")

  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  )
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "")

  return { codeVerifier, codeChallenge }
}`

export const REACT_SIGNIN_CODE = `import { generatePKCE } from "./pkce"

const OAUTH_SERVER = "https://api.nsauth.org"
const CLIENT_ID    = "your-client-id"
const REDIRECT_URI = "https://yourapp.com/callback"

export function SignInWithNS() {
  async function handleSignIn() {
    const { codeVerifier, codeChallenge } = await generatePKCE()
    sessionStorage.setItem("code_verifier", codeVerifier)

    const state = crypto.randomUUID()
    sessionStorage.setItem("oauth_state", state)

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "openid profile email roles date_joined",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    })

    window.location.href = \`\${OAUTH_SERVER}/oauth/authorize?\${params}\`
  }

  return <button onClick={handleSignIn}>Sign in with Network School</button>
}`

export const REACT_CALLBACK_CODE = `import { useEffect, useRef, useState } from "react"

const OAUTH_SERVER  = "https://api.nsauth.org"
const CLIENT_ID     = "your-client-id"
const CLIENT_SECRET = "your-client-secret"
const REDIRECT_URI  = "https://yourapp.com/callback"

export function Callback() {
  const [user, setUser] = useState(null)
  const exchanged = useRef(false)

  useEffect(() => {
    async function exchange() {
      if (exchanged.current) return
      exchanged.current = true

      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const codeVerifier = sessionStorage.getItem("code_verifier")

      const res = await fetch(\`\${OAUTH_SERVER}/oauth/token\`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code!,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code_verifier: codeVerifier!,
        }),
      })
      const { access_token } = await res.json()

      const userRes = await fetch(\`\${OAUTH_SERVER}/oauth/userinfo\`, {
        headers: { Authorization: \`Bearer \${access_token}\` },
      })
      setUser(await userRes.json())
    }
    exchange()
  }, [])

  if (!user) return <p>Signing in…</p>
  return <pre>{JSON.stringify(user, null, 2)}</pre>
}`

// ── Next.js / Auth.js ────────────────────────────────────────────

export const NEXTAUTH_CODE = `import NextAuth from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [{
    id: "network-school",
    name: "Network School",
    type: "oauth",
    authorization: {
      url: "https://api.nsauth.org/oauth/authorize",
      params: {
        scope: "openid profile email roles date_joined",
        response_type: "code",
      },
    },
    token: "https://api.nsauth.org/oauth/token",
    userinfo: "https://api.nsauth.org/oauth/userinfo",
    clientId: process.env.NS_CLIENT_ID,
    clientSecret: process.env.NS_CLIENT_SECRET,
    checks: ["pkce"],
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        roles: profile.roles,
        discordUsername: profile.discord_username,
        dateJoined: profile.date_joined,
      }
    },
  }],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.roles = (user as any).roles
        token.discordUsername = (user as any).discordUsername
        token.dateJoined = (user as any).dateJoined
        token.picture = user.image
      }
      return token
    },
    session({ session, token }) {
      ;(session.user as any).roles = token.roles
      ;(session.user as any).discordUsername = token.discordUsername
      ;(session.user as any).dateJoined = token.dateJoined
      return session
    },
  },
})`

export const NEXTAUTH_ENV_CODE = `NS_CLIENT_ID=your-client-id
NS_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=https://yourapp.com
AUTH_SECRET=generate-with-openssl-rand-base64-32`

export const NEXTAUTH_ROUTE_CODE = `import { handlers } from "@/auth"
export const { GET, POST } = handlers`

export const NEXTAUTH_SIGNIN_CODE = `import { signIn } from "@/auth"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="text-center space-y-8">
        {/* NS Flag Logo */}
        <svg width="59" height="40" viewBox="0 0 118 80" className="mx-auto opacity-20">
          <path fillRule="evenodd" clipRule="evenodd" d="M36.27 0c21.45 0 36.06 3.43 49.55 3.43 12.67 5.85 19.32 15.96 24.59 28.71 5.31 12.72 7.92 27.56 7.92 47.86H0C0 59.7 2.59 44.86 7.9 32.14 13.17 19.39 19.92 9.28 32.59 3.43 32.59 3.43 14.82 0 36.27 0z" fill="currentColor"/>
        </svg>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
          <p className="text-sm text-gray-500">Sign in with your Network School account</p>
        </div>

        <form action={async () => {
          "use server"
          await signIn("network-school", { redirectTo: "/" })
        }}>
          <button type="submit"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-[#0a0a0b] text-white text-sm font-medium hover:bg-[#1a1a1b] transition-colors"
          >
            <svg width="16" height="11" viewBox="0 0 118 80" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M36.27 0c21.45 0 36.06 3.43 49.55 3.43 12.67 5.85 19.32 15.96 24.59 28.71 5.31 12.72 7.92 27.56 7.92 47.86H0C0 59.7 2.59 44.86 7.9 32.14 13.17 19.39 19.92 9.28 32.59 3.43 32.59 3.43 14.82 0 36.27 0z"/>
            </svg>
            Sign in with Network School
          </button>
        </form>
      </div>
    </main>
  )
}`

export const NEXTAUTH_PROXY_CODE = `export { auth as middleware } from "@/auth"

// The matcher tells Next.js which routes the middleware should run on.
// Any route NOT listed in the exclusions below will require authentication.
//
// ⚠️  IMPORTANT: Add exclusions for your public static assets (images, fonts, etc.)
//     If you serve files from /public (e.g. logos, og-images), those requests
//     will also go through middleware. Without exclusions they'll redirect to
//     the login page and appear broken.
//
// Common exclusions to add:
//   .*\\\\.png$      — PNG images
//   .*\\\\.svg$      — SVG icons / logos
//   .*\\\\.ico$      — favicons
//   .*\\\\.jpg$      — JPEG images
//   .*\\\\.woff2?$   — web fonts

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|.*\\\\.svg$|.*\\\\.png$|.*\\\\.jpg$|.*\\\\.ico$).*)",
  ],
}`

export const NEXTAUTH_SESSION_EXAMPLE = `{
  "sub": "9e1cb4cb-67cf-4e41-aa25-e88c422326fa",
  "name": "John",
  "picture": "https://cdn.discordapp.com/avatars/934861.../dbdd43...png",
  "discord_username": "john_doe",
  "email": "jd@gmail.com",
  "email_verified": true,
  "roles": [
    { "id": "1475842933797159112", "name": "longtermer" },
    { "id": "1475843150999453736", "name": "feb-cohort" }
  ],
  "date_joined": "2026-03-04T18:25:29.970638+00:00",
  "discord_joined_at": "2026-03-04T18:23:31.367000+00:00",
  "boosting_since": null
}`

// ── Reference snippets ───────────────────────────────────────────

export const REFRESH_CODE = `async function refreshAccessToken(refreshToken: string) {
  const res = await fetch("https://api.nsauth.org/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: "your-client-id",
      client_secret: "your-client-secret",
    }),
  })

  const tokens = await res.json()
  // tokens.access_token  — new access token (1 hour)
  // tokens.refresh_token — new refresh token (rotation)
  return tokens
}`

export const USERINFO_EXAMPLE = `{
  "sub": "3eda7aa4-9114-4a6a-8f68-c91d0553c3c9",
  "email": "alice@networkschool.com",
  "email_verified": true,
  "name": "Alice",
  "picture": "https://cdn.discordapp.com/avatars/...",
  "discord_username": "alice",
  "banner_url": null,
  "accent_color": null,
  "public_badges": [],
  "roles": [
    { "id": "1475842933797159112", "name": "longtermer" },
    { "id": "1475843150999453736", "name": "feb-cohort" }
  ],
  "date_joined": "2026-03-04T18:25:29.970638+00:00",
  "discord_joined_at": "2026-03-04T18:23:31.367000+00:00",
  "boosting_since": null
}`

export const OIDC_RESPONSE = `{
  "issuer": "https://api.nsauth.org",
  "authorization_endpoint": "https://api.nsauth.org/oauth/authorize",
  "token_endpoint": "https://api.nsauth.org/oauth/token",
  "userinfo_endpoint": "https://api.nsauth.org/oauth/userinfo",
  "introspection_endpoint": "https://api.nsauth.org/oauth/token/introspect",
  "revocation_endpoint": "https://api.nsauth.org/oauth/token/revoke",
  "jwks_uri": "https://api.nsauth.org/.well-known/jwks.json",
  "response_types_supported": ["code"],
  "grant_types_supported": ["client_credentials", "authorization_code", "refresh_token"],
  "id_token_signing_alg_values_supported": ["RS256"],
  "scopes_supported": ["openid", "profile", "email", "roles", "date_joined", "offline_access"],
  "code_challenge_methods_supported": ["S256"]
}`

// ── Navigation ───────────────────────────────────────────────────

export interface NavItem {
  id: string
  label: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Getting Started",
    items: [
      { id: "overview", label: "Overview" },
      { id: "quickstart", label: "Quick Start" },
      { id: "register", label: "Register Your App" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { id: "auth-flow", label: "Authorization Flow" },
      { id: "scopes", label: "Scopes & Claims" },
      { id: "endpoints", label: "API Endpoints" },
    ],
  },
  {
    title: "Integrate",
    items: [
      { id: "nextauth", label: "Next.js (Auth.js)" },
      { id: "react", label: "React (Manual)" },
    ],
  },
  {
    title: "Reference",
    items: [
      { id: "refresh", label: "Token Refresh" },
      { id: "errors", label: "Error Codes" },
      { id: "oidc", label: "Discovery (OIDC)" },
    ],
  },
]

export const ALL_SECTION_IDS = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.id))
