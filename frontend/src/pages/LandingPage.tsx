import { Link, Navigate } from "react-router-dom"
import {
  Shield,
  Key,
  Zap,
  Code2,
  Globe,
  Users,
  ArrowRight,
  ExternalLink,
  BookOpen,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const DEMO_URL = import.meta.env.VITE_DEMO_URL || "https://demo.nsauth.org"
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000"
const APP_HOSTNAME = import.meta.env.VITE_APP_HOSTNAME || "app.nsauth.org"

const STEPS = [
  {
    step: "1",
    title: "Register Your App",
    description: "Create an OAuth app in the dashboard to get your client_id and client_secret.",
    icon: Key,
  },
  {
    step: "2",
    title: "User Signs In",
    description: "Redirect users to NS OAuth. They authenticate via Discord and approve scopes.",
    icon: Users,
  },
  {
    step: "3",
    title: "Get User Data",
    description: "Exchange the auth code for tokens, then call /oauth/userinfo for profile data.",
    icon: Code2,
  },
]

const FEATURES = [
  {
    title: "Standards-based",
    description: "Full OAuth 2.0 + OpenID Connect. PKCE, RS256 tokens, JWKS discovery.",
    icon: Shield,
  },
  {
    title: "Membership Gating",
    description: "Verify users are current Network School Discord members before granting access.",
    icon: Users,
  },
  {
    title: "Live Data",
    description: "Discord roles, profile, and membership data fetched in real-time. Always current.",
    icon: Zap,
  },
  {
    title: "Developer-friendly",
    description: "React & Next.js examples, comprehensive docs, and a working demo app.",
    icon: Code2,
  },
]

const ENDPOINTS = [
  { method: "GET", path: "/oauth/authorize", description: "Start authorization flow" },
  { method: "POST", path: "/oauth/token", description: "Exchange code for tokens" },
  { method: "GET", path: "/oauth/userinfo", description: "Get user profile (Bearer token)" },
  { method: "GET", path: "/.well-known/openid-configuration", description: "OIDC discovery" },
  { method: "GET", path: "/.well-known/jwks.json", description: "Public signing keys" },
]

const CODE_EXAMPLE = `import { generatePKCE } from "./pkce"

async function signInWithNS() {
  const { codeVerifier, codeChallenge } = await generatePKCE()
  sessionStorage.setItem("pkce_verifier", codeVerifier)

  const params = new URLSearchParams({
    response_type: "code",
    client_id: YOUR_CLIENT_ID,
    redirect_uri: YOUR_REDIRECT_URI,
    scope: "openid profile email roles",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  })

  window.location.href =
    \`https://api.nsauth.org/oauth/authorize?\${params}\`
}`

export function LandingPage() {
  // On the app subdomain, skip landing page and go straight to dashboard
  if (window.location.hostname === APP_HOSTNAME) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              NS OAuth
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
              <a
                href={DEMO_URL}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Demo
              </a>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
          <Link to="/dashboard">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground mb-6">
            <Globe className="h-3 w-3" />
            OAuth 2.0 + OpenID Connect
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Sign in with Network School
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            The identity provider for the NS ecosystem. Let your app verify membership,
            access roles, and fetch profile data — all through standard OAuth.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/docs">
              <Button size="lg">
                <BookOpen className="h-4 w-4 mr-2" />
                Read the Docs
              </Button>
            </Link>
            <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">
                View Demo
                <ExternalLink className="h-3.5 w-3.5 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <step.icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Step {step.step}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden sm:block absolute top-6 -right-4 h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Features</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    <f.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Preview */}
      <section className="py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl font-bold mb-4">Simple Integration</h2>
              <p className="text-muted-foreground mb-6">
                Add "Sign in with Network School" to your app in minutes.
                Standard OAuth 2.0 with PKCE — works with any framework.
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  "PKCE S256 for secure public clients",
                  "RS256 signed JWTs — verify offline",
                  "Scope-gated claims (profile, roles, email)",
                  "OIDC discovery for auto-configuration",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-foreground shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-[#0a0a0a] text-[#e5e5e5] p-5 overflow-x-auto">
              <div className="flex items-center gap-1.5 mb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-[#737373]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#737373]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#737373]" />
                <span className="ml-2 text-xs text-[#737373]">SignInWithNS.ts</span>
              </div>
              <pre className="text-xs leading-relaxed font-mono whitespace-pre">{CODE_EXAMPLE}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2">API Endpoints</h2>
          <p className="text-center text-sm text-muted-foreground mb-8">
            Base URL: <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded text-xs">{API_BASE}</code>
          </p>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left font-medium py-3 px-4 text-muted-foreground">Method</th>
                  <th className="text-left font-medium py-3 px-4 text-muted-foreground">Endpoint</th>
                  <th className="text-left font-medium py-3 px-4 text-muted-foreground hidden sm:table-cell">Description</th>
                </tr>
              </thead>
              <tbody>
                {ENDPOINTS.map((ep) => (
                  <tr key={ep.path} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">{ep.method}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{ep.path}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{ep.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to integrate?</h2>
          <p className="text-muted-foreground mb-6">
            Register your app, grab your credentials, and start building.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/docs">
              <Button size="lg">
                Read the Docs
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            <span>NS OAuth</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <a href={DEMO_URL} className="hover:text-foreground transition-colors">Demo</a>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <a
              href="https://www.networkschool.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Network School
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
