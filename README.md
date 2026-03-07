<div align="center">

# NS Auth

**OAuth 2.0 + OpenID Connect identity provider for [Network School](https://ns.com)**

*"Sign in with Network School" — like Sign in with Google, but for the NS ecosystem.*

[Dashboard](https://app.nsauth.org) · [Developer Docs](https://app.nsauth.org/docs) · [Demo App](https://demo.nsauth.org) · [OIDC Discovery](https://api.nsauth.org/.well-known/openid-configuration)

</div>

---

## How It Works

Users sign in via Discord. NS Auth verifies they're a member of the NS Discord server, then issues standard OAuth 2.0 / OIDC tokens that your app consumes. No user data is stored — profile, roles, badges, and avatar are fetched live from Discord with a 5-minute cache.

```mermaid
sequenceDiagram
    participant App as Your App
    participant NS as NS Auth<br/>api.nsauth.org
    participant Discord as Discord<br/>OAuth2
    participant User as User

    User->>App: Clicks "Sign in with Network School"
    App->>App: Generate PKCE verifier + challenge
    App->>NS: Redirect → /oauth/authorize<br/>(client_id, redirect_uri, code_challenge, scopes)
    NS->>Discord: Redirect → Discord login
    User->>Discord: Authenticates with Discord
    Discord->>NS: Callback with Discord auth code
    NS->>Discord: Exchange code → fetch user profile
    NS->>NS: Verify NS Discord membership
    NS->>App: Redirect → your callback<br/>(?code=AUTH_CODE&state=...)
    App->>NS: POST /oauth/token<br/>(code, client_secret, code_verifier)
    NS->>App: access_token + refresh_token + id_token
    App->>NS: GET /oauth/userinfo<br/>(Bearer token)
    NS->>Discord: Fetch live profile & roles
    NS->>App: User claims (name, email, roles, avatar…)
```

---

## Quick Start

```bash
# 1. Register your app at https://app.nsauth.org → save client_id + client_secret
# 2. Set your redirect URI (e.g. https://yourapp.com/callback)
# 3. Integrate with one of the methods below
```

### NextAuth / Auth.js *(Recommended — zero config)*

```ts
// auth.ts
import NextAuth from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [{
    id: "network-school",
    name: "Network School",
    type: "oidc",
    issuer: "https://api.nsauth.org",           // ← auto-discovers everything
    clientId: process.env.NS_CLIENT_ID!,
    clientSecret: process.env.NS_CLIENT_SECRET!,
  }],
})
```

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

That's it. NextAuth auto-discovers endpoints, handles PKCE, verifies tokens, and manages sessions.

### React (Manual PKCE)

<details>
<summary>Sign-in button + callback (3 files)</summary>

**PKCE helper:**
```ts
// lib/pkce.ts
export async function generatePKCE() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const codeVerifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier))
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

  return { codeVerifier, codeChallenge }
}
```

**Sign-in button:**
```tsx
// components/SignInWithNS.tsx
import { generatePKCE } from "@/lib/pkce"

export function SignInWithNS() {
  async function handleSignIn() {
    const { codeVerifier, codeChallenge } = await generatePKCE()
    sessionStorage.setItem("pkce_code_verifier", codeVerifier)

    const state = crypto.randomUUID()
    sessionStorage.setItem("oauth_state", state)

    const params = new URLSearchParams({
      response_type: "code",
      client_id: "YOUR_CLIENT_ID",
      redirect_uri: "https://yourapp.com/callback",
      scope: "openid profile email roles",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    })

    window.location.href = `https://api.nsauth.org/oauth/authorize?${params}`
  }

  return <button onClick={handleSignIn}>Sign in with Network School</button>
}
```

**Callback page:**
```tsx
// pages/Callback.tsx
import { useEffect, useRef, useState } from "react"

export function Callback() {
  const [user, setUser] = useState(null)
  const exchanged = useRef(false)

  useEffect(() => {
    async function exchange() {
      if (exchanged.current) return  // guard against StrictMode double-mount
      exchanged.current = true

      const params = new URLSearchParams(window.location.search)
      if (params.get("state") !== sessionStorage.getItem("oauth_state"))
        throw new Error("State mismatch")

      const tokenRes = await fetch("https://api.nsauth.org/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: params.get("code")!,
          redirect_uri: "https://yourapp.com/callback",
          client_id: "YOUR_CLIENT_ID",
          client_secret: "YOUR_CLIENT_SECRET",
          code_verifier: sessionStorage.getItem("pkce_code_verifier")!,
        }),
      })
      const tokens = await tokenRes.json()

      const userRes = await fetch("https://api.nsauth.org/oauth/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      setUser(await userRes.json())
    }
    exchange()
  }, [])

  if (!user) return <p>Signing in…</p>
  return <pre>{JSON.stringify(user, null, 2)}</pre>
}
```

> **Note:** In production SPAs, proxy the token exchange through your backend to keep `client_secret` server-side.

</details>

### Next.js App Router (Server-Side Exchange)

<details>
<summary>Client button + API route handler</summary>

**Client-side button** — same PKCE helper, stores verifier in a cookie:
```tsx
// app/components/SignInButton.tsx
"use client"
import { generatePKCE } from "@/lib/pkce"

export function SignInButton() {
  async function handleClick() {
    const { codeVerifier, codeChallenge } = await generatePKCE()
    document.cookie = `pkce_code_verifier=${codeVerifier}; path=/; SameSite=Lax; Secure`

    const state = crypto.randomUUID()
    document.cookie = `oauth_state=${state}; path=/; SameSite=Lax; Secure`

    const params = new URLSearchParams({
      response_type: "code",
      client_id: "YOUR_CLIENT_ID",
      redirect_uri: "https://yourapp.com/api/auth/callback",
      scope: "openid profile email roles",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    })
    window.location.href = `https://api.nsauth.org/oauth/authorize?${params}`
  }

  return <button onClick={handleClick}>Sign in with Network School</button>
}
```

**Server-side route handler:**
```ts
// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const state = req.nextUrl.searchParams.get("state")

  if (state !== req.cookies.get("oauth_state")?.value)
    return NextResponse.json({ error: "State mismatch" }, { status: 400 })

  const tokenRes = await fetch("https://api.nsauth.org/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code!,
      redirect_uri: process.env.NS_REDIRECT_URI!,
      client_id: process.env.NS_CLIENT_ID!,
      client_secret: process.env.NS_CLIENT_SECRET!,
      ...(req.cookies.get("pkce_code_verifier")?.value && {
        code_verifier: req.cookies.get("pkce_code_verifier")!.value,
      }),
    }),
  })
  const tokens = await tokenRes.json()

  const response = NextResponse.redirect(new URL("/dashboard", req.url))
  response.cookies.set("session", tokens.access_token, {
    httpOnly: true, secure: true, sameSite: "lax",
  })
  response.cookies.delete("pkce_code_verifier")
  response.cookies.delete("oauth_state")
  return response
}
```

</details>

---

## Scopes & Claims

| Scope | Claims | Source |
|:------|:-------|:-------|
| `openid` | `sub` | System — user's unique UUID |
| `profile` | `name` `picture` `discord_username` `banner_url` `accent_color` `public_badges` | Discord API *(live)* |
| `email` | `email` `email_verified` | Discord OAuth |
| `roles` | `roles` → `[{ id, name }]` | Discord API *(live)* |
| `date_joined` | `date_joined` `discord_joined_at` `boosting_since` | Discord API *(live)* |
| `offline_access` | *(enables refresh tokens)* | System |

<details>
<summary>Example <code>/oauth/userinfo</code> response</summary>

```json
{
  "sub": "3eda7aa4-9114-4a6a-8f68-c91d0553c3c9",
  "email": "alice@networkschool.com",
  "email_verified": true,
  "name": "Alice",
  "picture": "https://cdn.discordapp.com/avatars/...",
  "discord_username": "alice",
  "roles": [
    { "id": "1234567890", "name": "Cohort 5" },
    { "id": "0987654321", "name": "Builder" }
  ],
  "date_joined": "2024-06-15T10:30:00Z",
  "discord_joined_at": "2024-06-14T08:00:00Z",
  "boosting_since": null,
  "public_badges": ["ActiveDeveloper"]
}
```

</details>

---

## API Reference

### Core Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/oauth/authorize` | Start authorization code flow |
| `POST` | `/oauth/token` | Exchange code / refresh token / client credentials for tokens |
| `GET` | `/oauth/userinfo` | Fetch user claims *(Bearer token)* |
| `POST` | `/oauth/token/introspect` | Check if a token is active |
| `POST` | `/oauth/token/revoke` | Revoke a token |

### Discovery

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/.well-known/openid-configuration` | OIDC discovery document |
| `GET` | `/.well-known/jwks.json` | Public RSA keys for token verification |

### App Management

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/apps/` | Register a new OAuth app |
| `GET` | `/api/apps/` | List your apps |
| `PATCH` | `/api/apps/{id}` | Update an app |
| `DELETE` | `/api/apps/{id}` | Delete an app |

### Token Lifetimes

| Token | Lifetime | Notes |
|:------|:---------|:------|
| Access token | **1 hour** | JWT, signed RS256 |
| Refresh token | **30 days** | Rotated on each use — old token is revoked |
| Authorization code | **10 min** | One-time use |

---

## Error Codes

| Error | Status | When |
|:------|:-------|:-----|
| `invalid_client` | 401 | Bad `client_id` or `client_secret` |
| `invalid_grant` | 400 | Code expired, already used, or PKCE mismatch |
| `invalid_request` | 400 | Missing params or `redirect_uri` mismatch |
| `not_ns_member` | — | User isn't in the NS Discord server |
| `invalid_token` | 401 | Expired, revoked, or malformed token |

---

## Self-Hosting

### Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌───────────┐
│   Frontend   │────▶│     Backend      │────▶│  Discord   │
│   React/Vite │     │  FastAPI (OAuth)  │◀─── Third-party │
│   :5173      │     │  :8000           │     │   Apps     │
└──────────────┘     └────────┬─────────┘     └───────────┘
                              │
                     ┌────────▼─────────┐
                     │   PostgreSQL     │
                     └──────────────────┘
```

### Prerequisites

- Python 3.9+ · Node.js 20+ · PostgreSQL · Discord application ([Developer Portal](https://discord.com/developers/applications))

### Setup

```bash
git clone git@github.com:uzaxirr/ns-auth.git && cd ns-auth
createdb oauth_provider

# Backend
cd backend && pip install -r requirements.txt
cp .env.example .env  # fill in Discord creds + session secret
alembic upgrade head
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend (separate terminal)
cd frontend && npm install
echo "VITE_API_BASE=http://localhost:8000" > .env
npm run dev
```

### Environment Variables

<details>
<summary>Backend (<code>backend/.env</code>)</summary>

| Variable | Description |
|:---------|:------------|
| `OAUTH_DATABASE_URL` | Async DB URL — `postgresql+asyncpg://user:pass@host:5432/dbname` |
| `OAUTH_DATABASE_URL_SYNC` | Sync DB URL for Alembic — `postgresql://user:pass@host:5432/dbname` |
| `OAUTH_DISCORD_CLIENT_ID` | Discord app client ID |
| `OAUTH_DISCORD_CLIENT_SECRET` | Discord app client secret |
| `OAUTH_DISCORD_BOT_TOKEN` | Bot token for guild/role API access |
| `OAUTH_DISCORD_GUILD_ID` | NS Discord server (guild) ID |
| `OAUTH_SESSION_SECRET` | 64+ char random string |
| `OAUTH_CORS_ORIGINS` | JSON array of allowed origins |
| `OAUTH_FRONTEND_URL` | Frontend URL for redirects |
| `OAUTH_ISSUER` | *(production)* Backend public URL |
| `OAUTH_RSA_PRIVATE_KEY` | *(production)* Base64-encoded RSA private PEM |
| `OAUTH_RSA_PUBLIC_KEY` | *(production)* Base64-encoded RSA public PEM |

> For local dev, DB URLs default to `localhost:5432/oauth_provider` and RSA keys are auto-generated in `backend/keys/`.

</details>

<details>
<summary>Frontend (<code>frontend/.env</code>)</summary>

| Variable | Description |
|:---------|:------------|
| `VITE_API_BASE` | Backend URL |
| `VITE_APP_HOSTNAME` | App subdomain hostname |
| `VITE_DEMO_URL` | Demo app URL |

</details>

### Database

| Table | Purpose |
|:------|:--------|
| `users` | NS users (UUID, discord_id, email) — all profile data fetched live |
| `oauth_apps` | Registered OAuth apps (client_id, hashed secret, scopes, redirect_uris) |
| `access_tokens` | Issued JWT access tokens (hash, jti, scopes, expiry) |
| `refresh_tokens` | Issued opaque refresh tokens (rotation tracking) |
| `authorization_codes` | Temporary auth codes (10 min TTL, one-time use) |
| `scope_definitions` | Available OAuth scopes (DB-driven, extensible) |
| `claim_definitions` | Claim → scope mappings with data sources |

```bash
alembic upgrade head                                    # apply migrations
alembic revision --autogenerate -m "description"        # create migration
```

### Deploy to Railway

```bash
railway up --service backend --detach
railway up --service frontend --detach
railway up --service demo-app --detach
```

<details>
<summary>Production RSA keys</summary>

```bash
openssl genrsa -out private.pem 4096
openssl rsa -in private.pem -pubout -out public.pem
railway variables --set "OAUTH_RSA_PRIVATE_KEY=$(base64 < private.pem)" --service backend
railway variables --set "OAUTH_RSA_PUBLIC_KEY=$(base64 < public.pem)" --service backend
```

</details>

---

## Project Structure

```
ns-auth/
├── backend/
│   ├── app/
│   │   ├── routers/      # oauth, auth, apps, scopes, wellknown
│   │   ├── services/     # token, session, authz, discord, claims
│   │   ├── models/       # SQLAlchemy ORM
│   │   ├── schemas/      # Pydantic request/response
│   │   ├── security/     # RSA keys, bcrypt
│   │   ├── config.py     # Settings (OAUTH_ prefix)
│   │   └── main.py       # FastAPI entrypoint
│   ├── alembic/          # migrations
│   └── requirements.txt
├── frontend/             # Admin dashboard (React/Vite)
├── demo-app/             # Reference "Sign in with NS" implementation
└── CLAUDE.md             # Detailed technical reference
```

---

<div align="center">
<sub>Built for <a href="https://ns.com">Network School</a></sub>
</div>