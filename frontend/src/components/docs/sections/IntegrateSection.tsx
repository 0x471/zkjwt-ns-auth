import { Code2, Zap } from "lucide-react"
import { SectionHeading, FileRow } from "@/components/docs/DocsUI"
import {
    NEXTAUTH_CODE, NEXTAUTH_ENV_CODE, NEXTAUTH_ROUTE_CODE,
    NEXTAUTH_SIGNIN_CODE, NEXTAUTH_PROXY_CODE, NEXTAUTH_SESSION_EXAMPLE,
    PKCE_CODE, REACT_SIGNIN_CODE, REACT_CALLBACK_CODE,
} from "@/components/docs/constants"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Integration sections: Next.js + React
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function NextAuthSection() {
    return (
        <>
            <SectionHeading id="nextauth">
                <span className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-500" />
                    Next.js with Auth.js
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Recommended</span>
                </span>
            </SectionHeading>
            <p className="text-muted-foreground mb-6 text-sm">
                Production-tested. Auth.js handles PKCE, token exchange, sessions, and route protection.<br />
                <strong className="text-foreground">5 files. Zero manual OAuth wiring.</strong>
            </p>

            {/* Unified integration card */}
            <div className="rounded-xl border border-border overflow-hidden mb-8">
                {/* Step 0: Install */}
                <div className="px-5 py-4 bg-[#0a0a0b] border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.08em]">Install</span>
                        <button
                            onClick={() => navigator.clipboard.writeText("npm install next-auth@beta")}
                            className="text-[10px] text-white/40 hover:text-white/80 transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                    <code className="text-sm font-mono text-emerald-400 mt-1 block">npm install next-auth@beta</code>
                </div>

                {/* File structure with inline expandable code */}
                <div className="bg-background">
                    {([
                        { n: 1, file: "auth.ts", badge: "core", desc: "Provider config + JWT/session callbacks — maps roles, Discord username, and join date into session.user", code: NEXTAUTH_CODE, lang: "typescript" },
                        { n: 2, file: ".env.local", badge: "env", desc: "Credentials from your NS Auth dashboard", code: NEXTAUTH_ENV_CODE, lang: "bash" },
                        { n: 3, file: "app/api/auth/[...nextauth]/route.ts", badge: "api", desc: "Catch-all route — 2 lines", code: NEXTAUTH_ROUTE_CODE, lang: "typescript" },
                        { n: 4, file: "app/login/page.tsx", badge: "ui", desc: "Branded login page with NS flag logo", code: NEXTAUTH_SIGNIN_CODE, lang: "tsx" },
                        { n: 5, file: "proxy.ts", badge: "guard", desc: "Route protection — redirects unauthenticated users", code: NEXTAUTH_PROXY_CODE, lang: "typescript" },
                    ] as const).map((item) => (
                        <FileRow key={item.file} {...item} />
                    ))}
                </div>

                {/* Session data preview */}
                <div className="border-t border-border px-5 py-4 bg-secondary/20">
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.08em] mb-3">What you get from /oauth/userinfo</p>
                    <div className="rounded-lg bg-[#0a0a0b] p-4 overflow-x-auto">
                        <pre className="text-xs leading-relaxed">
                            <code className="text-[#e4e4e7] font-mono">{NEXTAUTH_SESSION_EXAMPLE}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </>
    )
}

export function ReactSection() {
    return (
        <>
            <SectionHeading id="react">
                <span className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-muted-foreground" />
                    React (Manual PKCE)
                </span>
            </SectionHeading>
            <p className="text-muted-foreground mb-6 text-sm">
                Full control — 3 files to add "Sign in with Network School" to any React or SPA app.
            </p>

            {/* Unified React card */}
            <div className="rounded-xl border border-border overflow-hidden mb-8">
                {/* Flow diagram header */}
                <div className="px-5 py-4 bg-secondary/20 border-b border-border">
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.08em] mb-3">Flow</p>
                    <div className="flex items-center gap-0 max-w-md">
                        {[
                            { file: "pkce.ts", label: "Generate\nchallenge" },
                            { file: "SignIn.tsx", label: "Redirect to\n/authorize" },
                            { file: "Callback.tsx", label: "Exchange code\nfor tokens" },
                        ].map((step, i, arr) => (
                            <div key={step.file} className="flex items-center gap-0">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="w-10 h-10 rounded-lg bg-foreground/5 border border-border flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-foreground">{i + 1}</span>
                                    </div>
                                    <code className="text-[10px] font-mono text-foreground/80">{step.file}</code>
                                    <span className="text-[9px] text-muted-foreground text-center whitespace-pre-line leading-tight">{step.label}</span>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="w-8 h-px bg-border mx-1 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* File rows */}
                <div className="bg-background">
                    {([
                        { n: 1, file: "pkce.ts", badge: "util", desc: "PKCE challenge generation — SHA-256 code verifier", code: PKCE_CODE, lang: "typescript" },
                        { n: 2, file: "SignInWithNS.tsx", badge: "ui", desc: "Redirect button with PKCE params and state", code: REACT_SIGNIN_CODE, lang: "tsx" },
                        { n: 3, file: "Callback.tsx", badge: "page", desc: "Exchange authorization code for tokens", code: REACT_CALLBACK_CODE, lang: "tsx" },
                    ] as const).map((item) => (
                        <FileRow key={item.file} {...item} />
                    ))}
                </div>

                {/* Warning */}
                <div className="border-t border-border px-5 py-3 bg-amber-50/50 flex items-start gap-2">
                    <span className="text-amber-500 text-xs mt-0.5">⚠</span>
                    <p className="text-xs text-amber-800/80">
                        This example includes <code className="font-medium text-amber-900">client_secret</code> in client-side code for simplicity. In production, proxy the token exchange through your backend.
                    </p>
                </div>
            </div>
        </>
    )
}
