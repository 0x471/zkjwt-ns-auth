import { Link } from "react-router-dom"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { CodeBlock } from "@/components/docs/CodeBlock"
import { SectionHeading, SubHeading, Callout, EndpointRow, TableHead } from "@/components/docs/DocsUI"
import {
    API_BASE, USERINFO_EXAMPLE, REFRESH_CODE, OIDC_RESPONSE,
} from "@/components/docs/constants"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Reference: Endpoints, Userinfo, Token Refresh, Errors, OIDC, Footer
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function EndpointsSection() {
    return (
        <>
            <SectionHeading id="endpoints">API Endpoints</SectionHeading>
            <p className="text-muted-foreground mb-3 text-sm">
                Base URL:{" "}
                <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded text-xs font-medium">{API_BASE}</code>
            </p>

            <SubHeading>OAuth</SubHeading>
            <div className="overflow-x-auto mb-4">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border">
                            <TableHead>Method</TableHead>
                            <TableHead>Path</TableHead>
                            <TableHead>Description</TableHead>
                        </tr>
                    </thead>
                    <tbody>
                        <EndpointRow method="GET" path="/oauth/authorize" description="Start authorization code flow" />
                        <EndpointRow method="POST" path="/oauth/token" description="Exchange code / refresh / credentials for tokens" />
                        <EndpointRow method="GET" path="/oauth/userinfo" description="Fetch user claims (Bearer token)" />
                        <EndpointRow method="POST" path="/oauth/token/introspect" description="Check if a token is active" />
                        <EndpointRow method="POST" path="/oauth/token/revoke" description="Revoke a token" />
                    </tbody>
                </table>
            </div>

            <SubHeading>Discovery</SubHeading>
            <div className="overflow-x-auto mb-4">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border">
                            <TableHead>Method</TableHead>
                            <TableHead>Path</TableHead>
                            <TableHead>Description</TableHead>
                        </tr>
                    </thead>
                    <tbody>
                        <EndpointRow method="GET" path="/.well-known/openid-configuration" description="OIDC discovery document" />
                        <EndpointRow method="GET" path="/.well-known/jwks.json" description="Public RSA keys for token verification" />
                    </tbody>
                </table>
            </div>

            <SubHeading>Token lifetimes</SubHeading>
            <div className="overflow-x-auto mb-4">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border">
                            <TableHead>Token</TableHead>
                            <TableHead>Lifetime</TableHead>
                            <TableHead>Notes</TableHead>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        <tr className="border-b border-border/60">
                            <td className="py-2 pr-3 text-foreground font-medium">Access token</td>
                            <td className="py-2 pr-3 text-muted-foreground">1 hour</td>
                            <td className="py-2 text-muted-foreground">JWT, signed RS256</td>
                        </tr>
                        <tr className="border-b border-border/60">
                            <td className="py-2 pr-3 text-foreground font-medium">Refresh token</td>
                            <td className="py-2 pr-3 text-muted-foreground">30 days</td>
                            <td className="py-2 text-muted-foreground">Rotated on each use — old token revoked</td>
                        </tr>
                        <tr className="border-b border-border/60">
                            <td className="py-2 pr-3 text-foreground font-medium">Auth code</td>
                            <td className="py-2 pr-3 text-muted-foreground">10 min</td>
                            <td className="py-2 text-muted-foreground">One-time use</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export function UserinfoSection() {
    return (
        <>
            <SubHeading>Example response</SubHeading>
            <CodeBlock code={USERINFO_EXAMPLE} language="json" filename="GET /oauth/userinfo" />
        </>
    )
}

export function TokenRefreshSection() {
    return (
        <>
            <SectionHeading id="refresh">Token Refresh</SectionHeading>
            <p className="text-muted-foreground mb-4 text-sm">
                Access tokens expire after <strong className="text-foreground">1 hour</strong>. Request the{" "}
                <code className="text-foreground bg-secondary px-1 rounded text-xs">offline_access</code> scope to receive refresh tokens (valid <strong className="text-foreground">30 days</strong>).
                Tokens rotate on each use — the old refresh token is revoked.
            </p>
            <CodeBlock code={REFRESH_CODE} language="typescript" filename="refresh.ts" />
        </>
    )
}

export function ErrorCodesSection() {
    return (
        <>
            <SectionHeading id="errors">Error Codes</SectionHeading>
            <p className="text-muted-foreground mb-4 text-sm">
                Token endpoint returns JSON with <code className="text-foreground bg-secondary px-1 rounded text-xs">error</code> and <code className="text-foreground bg-secondary px-1 rounded text-xs">error_description</code> fields.
            </p>
            <div className="overflow-x-auto mb-4">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border">
                            <TableHead>Error</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>When</TableHead>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {[
                            { error: "invalid_client", status: "401", desc: "Bad client_id or client_secret" },
                            { error: "invalid_grant", status: "400", desc: "Code expired, already used, or PKCE mismatch" },
                            { error: "invalid_request", status: "400", desc: "Missing params or redirect_uri mismatch" },
                            { error: "access_denied", status: "—", desc: "User denied consent (query param on redirect)" },
                            { error: "not_ns_member", status: "—", desc: "User isn't in the NS Discord server" },
                            { error: "invalid_token", status: "401", desc: "Token expired, revoked, or malformed" },
                            { error: "unsupported_grant_type", status: "400", desc: "Use authorization_code, refresh_token, or client_credentials" },
                        ].map((row) => (
                            <tr key={row.error} className="border-b border-border/60 hover:bg-secondary/30 transition-colors">
                                <td className="py-2 pr-3"><code className="text-foreground text-[13px]">{row.error}</code></td>
                                <td className="py-2 pr-3 text-muted-foreground">{row.status}</td>
                                <td className="py-2 text-muted-foreground">{row.desc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export function OIDCSection() {
    return (
        <>
            <SectionHeading id="oidc">Discovery (OIDC)</SectionHeading>
            <p className="text-muted-foreground mb-4 text-sm">
                NS Auth publishes an{" "}
                <a
                    href={`${API_BASE}/.well-known/openid-configuration`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors inline-flex items-center gap-1"
                >
                    OIDC discovery document
                    <ArrowUpRight className="h-3 w-3" />
                </a>
                {" "}that describes all server capabilities. Auth libraries like NextAuth, Passport.js, and Spring Security auto-configure from this URL.
            </p>
            <CodeBlock code={OIDC_RESPONSE} language="json" filename="GET /.well-known/openid-configuration" />
            <Callout type="tip">
                Tokens are signed with <strong className="text-foreground">RS256</strong>. Verify using the public keys from{" "}
                <code className="text-foreground">/.well-known/jwks.json</code>. The JWKS rotates automatically — always fetch dynamically.
            </Callout>
        </>
    )
}

export function DocsFooter() {
    return (
        <div className="mt-20 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
                Need help? Check the{" "}
                <a
                    href="https://demo.nsauth.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
                >
                    demo app
                </a>{" "}
                for a working reference.
            </p>
            <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
            >
                Go to Dashboard <ChevronRight className="h-3 w-3" />
            </Link>
        </div>
    )
}
