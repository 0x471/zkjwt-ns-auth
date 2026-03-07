import { Link } from "react-router-dom"
import {
    Code2, Key, Shield, Zap, Clock, FileText,
} from "lucide-react"
import { SequenceDiagram } from "@/components/docs/SequenceDiagram"
import { Pill, SectionHeading, SubHeading, Callout, ParamRow, TableHead } from "@/components/docs/DocsUI"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Overview + Quick Start + Register + Auth Flow + Scopes
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function OverviewSection() {
    return (
        <section id="overview" className="mb-16">
            {/* Hero banner */}
            <div className="relative rounded-2xl overflow-hidden mb-8 bg-[#0a0a0b] p-8 sm:p-10">
                {/* Subtle grid background */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40V0h1v40zm40 0V0h-1v40zM0 0h40v1H0zm0 40h40v-1H0z' fill='%23fff'/%3E%3C/svg%3E\")",
                }} />
                {/* Gradient glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-emerald-500/15 to-transparent rounded-full blur-3xl" />

                <div className="relative flex flex-col sm:flex-row items-start gap-6">
                    {/* NS Flag */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                        <img src="/ns-flag-white.svg" alt="Network School" className="w-8 h-auto" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-white/40 text-[11px] font-medium uppercase tracking-[0.12em] mb-3">
                            <span>api.nsauth.org</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>OAuth 2.0 + OIDC</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>PKCE</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2 fade-up">
                            Sign in with Network School
                        </h1>
                        <p className="text-white/50 text-sm leading-relaxed max-w-lg fade-up fade-up-1">
                            Add NS identity to your app. Verify membership, read Discord roles, and personalize experiences — all through standard OAuth 2.0.
                        </p>
                    </div>
                </div>

                {/* ── Architecture Flow Graph ── */}
                <div className="relative mt-10 mb-2 fade-up fade-up-2">
                    <div className="flex items-center justify-between max-w-lg mx-auto">
                        {/* Your App */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                                <Code2 className="h-6 w-6 text-white/80" />
                            </div>
                            <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">Your App</span>
                        </div>

                        {/* Arrow 1 */}
                        <div className="flex-1 flex items-center justify-center relative mx-2">
                            <div className="h-px bg-gradient-to-r from-white/20 via-white/40 to-white/20 w-full" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 flow-pulse" />
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white/30 font-mono whitespace-nowrap">PKCE + code</div>
                        </div>

                        {/* NS Auth */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-xl bg-white/[0.15] backdrop-blur-sm border border-white/[0.15] flex items-center justify-center ring-1 ring-white/10 ring-offset-1 ring-offset-[#0a0a0b]">
                                <img src="/ns-flag-white.svg" alt="" className="w-7 h-auto opacity-90" />
                            </div>
                            <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">NS Auth</span>
                        </div>

                        {/* Arrow 2 */}
                        <div className="flex-1 flex items-center justify-center relative mx-2">
                            <div className="h-px bg-gradient-to-r from-white/20 via-indigo-400/40 to-white/20 w-full" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400 flow-pulse" style={{ animationDelay: "0.5s" }} />
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white/30 font-mono whitespace-nowrap">verify membership</div>
                        </div>

                        {/* Discord */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-xl bg-[#5865F2]/20 backdrop-blur-sm border border-[#5865F2]/30 flex items-center justify-center">
                                <svg className="h-6 w-6 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-semibold text-[#5865F2]/70 uppercase tracking-wider">Discord</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-5 fade-up fade-up-3">
                <Pill><Shield className="h-3 w-3" /> OAuth 2.0 + PKCE</Pill>
                <Pill><Key className="h-3 w-3" /> RS256 JWTs</Pill>
                <Pill><Zap className="h-3 w-3" /> Live Discord data</Pill>
                <Pill><Clock className="h-3 w-3" /> 5-min cache</Pill>
            </div>

            {/* LLM quick links */}
            <div className="flex flex-wrap items-center gap-2 fade-up fade-up-4">
                <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider mr-1">AI-ready</span>
                <a
                    href="/llms.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                    <FileText className="h-3 w-3" />
                    llms.txt
                </a>
                <a
                    href={`https://claude.ai/new?q=${encodeURIComponent("I want to integrate NS Auth (OAuth 2.0 for Network School) into my app. Read https://app.nsauth.org/llms.txt and help me.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor"><path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z" /></svg>
                    Claude
                </a>
                <a
                    href={`https://chatgpt.com/?q=${encodeURIComponent("I want to integrate NS Auth (OAuth 2.0 for Network School) into my app. Read https://app.nsauth.org/llms.txt and help me.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" /></svg>
                    ChatGPT
                </a>
            </div>
        </section>
    )
}

export function QuickStartSection() {
    return (
        <>
            <SectionHeading id="quickstart">Quick Start</SectionHeading>
            <div className="grid gap-3 mb-4">
                {[
                    { n: "1", title: "Register your app", desc: <>Go to the <Link to="/dashboard" className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors">developer dashboard</Link> and create an OAuth app. Save your <code className="text-foreground bg-secondary px-1 rounded text-xs">client_id</code> and <code className="text-foreground bg-secondary px-1 rounded text-xs">client_secret</code>.</> },
                    { n: "2", title: "Redirect to authorize", desc: <>Send users to <code className="text-foreground bg-secondary px-1 rounded text-xs">/oauth/authorize</code> with your client_id, redirect_uri, scopes, and a PKCE challenge.</> },
                    { n: "3", title: "User signs in via Discord", desc: "NS Auth handles Discord login and verifies NS membership." },
                    { n: "4", title: "Exchange code for tokens", desc: <><code className="text-foreground bg-secondary px-1 rounded text-xs">POST /oauth/token</code> with the authorization code to get tokens.</> },
                    { n: "5", title: "Fetch user data", desc: <><code className="text-foreground bg-secondary px-1 rounded text-xs">GET /oauth/userinfo</code> with the access token to get profile, roles, and claims.</> },
                ].map((step) => (
                    <div key={step.n} className="flex gap-3.5 items-start">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-background text-xs font-semibold flex items-center justify-center mt-0.5">
                            {step.n}
                        </span>
                        <div>
                            <p className="font-medium text-foreground text-sm">{step.title}</p>
                            <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export function RegisterSection() {
    return (
        <>
            <SectionHeading id="register">Register Your App</SectionHeading>
            <div className="bg-secondary/30 border border-border rounded-lg p-5 mb-4">
                <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                        <span className="font-semibold text-foreground shrink-0">1.</span>
                        <span className="text-muted-foreground">
                            Go to the{" "}
                            <Link to="/dashboard" className="text-foreground underline underline-offset-4">developer dashboard</Link>{" "}
                            → click <strong className="text-foreground">"New App"</strong>
                        </span>
                    </li>
                    <li className="flex gap-3">
                        <span className="font-semibold text-foreground shrink-0">2.</span>
                        <span className="text-muted-foreground">Enter app name, description, and add your callback URL(s) as redirect URIs</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="font-semibold text-foreground shrink-0">3.</span>
                        <span className="text-muted-foreground">
                            Select scopes — e.g. <code className="text-foreground bg-secondary px-1 rounded">openid profile email roles</code>
                        </span>
                    </li>
                    <li className="flex gap-3">
                        <span className="font-semibold text-foreground shrink-0">4.</span>
                        <span className="text-muted-foreground">
                            Copy your <code className="text-foreground bg-secondary px-1 rounded">client_id</code> and <code className="text-foreground bg-secondary px-1 rounded">client_secret</code>
                        </span>
                    </li>
                </ol>
            </div>
            <Callout type="warning">
                The <code className="text-foreground font-medium">client_secret</code> is shown <strong className="text-foreground">only once</strong>. Store it somewhere safe immediately.
            </Callout>
        </>
    )
}

export function AuthFlowSection() {
    return (
        <>
            <SectionHeading id="auth-flow">Authorization Flow</SectionHeading>
            <p className="text-muted-foreground mb-2">
                NS Auth uses <strong className="text-foreground">Authorization Code + PKCE</strong>{" "}
                <span className="text-muted-foreground/60">(RFC 7636)</span>. PKCE is required for all clients.
            </p>

            <SequenceDiagram />

            <Callout type="info">
                <strong className="text-foreground">What is PKCE?</strong> Proof Key for Code Exchange (pronounced "pixy") protects the authorization code
                during redirect. Your app generates a random <code className="text-foreground">code_verifier</code> and sends a SHA-256 hash
                (<code className="text-foreground">code_challenge</code>) in the authorize request. When exchanging the code,
                you prove possession of the verifier. This makes the flow secure even for SPAs and mobile apps.
            </Callout>

            <SubHeading>Authorize parameters</SubHeading>
            <div className="overflow-x-auto mb-4">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border">
                            <TableHead>Parameter</TableHead>
                            <TableHead>Required</TableHead>
                            <TableHead>Description</TableHead>
                        </tr>
                    </thead>
                    <tbody>
                        <ParamRow name="response_type" required description={<>Must be <code className="text-foreground">"code"</code></>} />
                        <ParamRow name="client_id" required description="Your app's client ID" />
                        <ParamRow name="redirect_uri" required description="Must match a registered redirect URI" />
                        <ParamRow name="scope" required={false} description={<>Space-separated scopes (default: <code className="text-foreground">"openid"</code>)</>} />
                        <ParamRow name="state" required={false} description="CSRF protection — random string, verify on callback" />
                        <ParamRow name="code_challenge" required description="PKCE challenge (base64url-encoded SHA-256 hash)" />
                        <ParamRow name="code_challenge_method" required description={<>Must be <code className="text-foreground">"S256"</code></>} />
                    </tbody>
                </table>
            </div>

            <SubHeading>Token request parameters</SubHeading>
            <p className="text-xs text-muted-foreground mb-3">
                <code className="text-foreground bg-secondary px-1 rounded">POST /oauth/token</code>{" "}
                with <code className="text-foreground bg-secondary px-1 rounded">Content-Type: application/x-www-form-urlencoded</code>
            </p>
            <div className="overflow-x-auto mb-4">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border">
                            <TableHead>Parameter</TableHead>
                            <TableHead></TableHead>
                            <TableHead>Description</TableHead>
                        </tr>
                    </thead>
                    <tbody>
                        <ParamRow name="grant_type" description={<><code className="text-foreground">"authorization_code"</code> · <code className="text-foreground">"refresh_token"</code> · <code className="text-foreground">"client_credentials"</code></>} />
                        <ParamRow name="code" description="Authorization code from callback redirect" />
                        <ParamRow name="redirect_uri" description="Must match the authorize request" />
                        <ParamRow name="client_id" description="Your app's client ID" />
                        <ParamRow name="client_secret" description="Your app's client secret" />
                        <ParamRow name="code_verifier" description="PKCE code verifier (original random string)" />
                    </tbody>
                </table>
            </div>
        </>
    )
}

export function ScopesSection() {
    return (
        <>
            <SectionHeading id="scopes">Scopes & Claims</SectionHeading>
            <p className="text-muted-foreground mb-4 text-sm">
                Request scopes in the authorize URL. The <code className="text-foreground bg-secondary px-1 rounded text-xs">/oauth/userinfo</code> endpoint returns claims based on granted scopes.
                Discord-sourced claims are fetched <strong className="text-foreground">live</strong> with a 5-minute cache.
            </p>
            <div className="overflow-x-auto mb-6">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border">
                            <TableHead>Scope</TableHead>
                            <TableHead>Claims</TableHead>
                            <TableHead>Source</TableHead>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {[
                            { scope: "openid", claims: "sub", source: "System" },
                            { scope: "email", claims: "email, email_verified", source: "Discord OAuth" },
                            { scope: "profile", claims: "name, picture, discord_username, banner_url, accent_color, public_badges", source: "Discord API (live)" },
                            { scope: "roles", claims: "roles → [{id, name}]", source: "Discord API (live)" },
                            { scope: "date_joined", claims: "date_joined, discord_joined_at, boosting_since", source: "Discord API (live)" },
                            { scope: "offline_access", claims: "(enables refresh tokens)", source: "System" },
                        ].map((row) => (
                            <tr key={row.scope} className="border-b border-border/60 hover:bg-secondary/30 transition-colors">
                                <td className="py-2 pr-3"><code className="text-foreground text-[13px]">{row.scope}</code></td>
                                <td className="py-2 pr-3 text-muted-foreground text-[13px]">{row.claims}</td>
                                <td className="py-2 text-muted-foreground text-[13px]">{row.source}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
