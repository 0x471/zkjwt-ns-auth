# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

OAuth 2.0 / OpenID Connect identity provider for Network School ("Sign in with Network School"). Users authenticate via Discord OAuth2, backend verifies NS Discord membership, then issues standard OAuth tokens. No user profile data stored in DB — everything fetched live from Discord API with 5-min cache.

**v1 (current):** Discord-based auth. **v2 (future):** Privy-based standalone auth (code exists on branch).

## Quick Start

All three services must run simultaneously:

```bash
# Backend (port 8000)
cd backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend admin dashboard (port 5173)
cd frontend && npm run dev

# Demo client app (port 3000)
cd demo-app && npm run dev
```

### Database

PostgreSQL `oauth_provider` on localhost:5432 (system user, no password).

```bash
# Migrations (run from backend/)
alembic upgrade head
alembic revision --autogenerate -m "description"
```

Alembic uses `psycopg2-binary` (sync) since asyncpg can't run migrations.

### Linting

```bash
cd frontend && npm run lint
cd demo-app && npm run lint
```

### Building

```bash
cd frontend && npm run build    # tsc -b && vite build
cd demo-app && npm run build    # tsc -b && vite build
```

## Architecture

```
backend/    FastAPI + SQLAlchemy async + asyncpg + PostgreSQL
frontend/   Vite 7 + React 19 + TypeScript + Tailwind v4 (admin dashboard)
demo-app/   Vite 7 + React 19 + TypeScript (OAuth client demo)
```

### Backend Layers (`backend/app/`)

- **Models** (`models/`) — SQLAlchemy ORM, async, UUID primary keys
- **Services** (`services/`) — Business logic: token issuance, authorization, Discord API, sessions, claims resolution
- **Routers** (`routers/`) — FastAPI endpoints: oauth, auth, apps, scopes, wellknown, uploads
- **Schemas** (`schemas/`) — Pydantic request/response models
- **Security** (`security/`) — RSA key management (`keys.py`), bcrypt hashing (`hashing.py`)
- **Config** (`config.py`) — Pydantic-settings, all env vars prefixed with `OAUTH_`

### Key Data Flow

**Authorization Code + PKCE flow:**
1. Client → `/oauth/authorize` with PKCE challenge
2. Backend checks session → redirects to frontend `/login` or `/consent`
3. User authenticates via Discord OAuth2 → backend verifies NS guild membership
4. User approves scopes → backend generates auth code → redirects to client callback
5. Client exchanges code at `/oauth/token` → gets RS256 JWT access token
6. Client calls `/oauth/userinfo` → backend fetches live Discord data → returns scope-gated claims

**Session relay:** After Discord login, backend stores a 60-second single-use session code, redirects to `/auth/session?code=<code>`. Frontend exchanges via `POST /auth/session/exchange` to get session JWT. Prevents tokens leaking in URLs/history.

### DB Tables

`users`, `oauth_apps`, `access_tokens`, `refresh_tokens`, `authorization_codes`, `scope_definitions`, `claim_definitions`, `oauth_states`, `session_codes`

**User model:** id (UUID), discord_id, email, is_admin, created_at, updated_at. All profile data comes live from Discord API.

### Scopes & Claims

Defined in DB (`scope_definitions` + `claim_definitions` tables). Claims resolved by `services/claim_resolver.py` which calls Discord API.

| Scope | Source |
|-------|--------|
| `openid` | System (sub) |
| `email` | Discord OAuth |
| `profile` | Discord API (live) — name, picture, username, banner, accent_color, badges |
| `roles` | Discord API (live) |
| `date_joined` | System + Discord API |
| `offline_access` | Enables refresh tokens |

## Environment

- **Python 3.9.6** (system macOS) — MUST use `from __future__ import annotations` and `Optional[X]` / `List[X]` syntax (not `X | None` / `list[X]`)
- **Node**: managed by nvm
- **macOS**: no `timeout` command — use `sleep + kill` pattern

### Required Env Vars (`backend/.env`)

All prefixed with `OAUTH_`:
```
OAUTH_DISCORD_CLIENT_ID, OAUTH_DISCORD_CLIENT_SECRET, OAUTH_DISCORD_BOT_TOKEN, OAUTH_DISCORD_GUILD_ID
OAUTH_SESSION_SECRET=<64+ char secret for HS256 session JWTs>
OAUTH_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
OAUTH_FRONTEND_URL=http://localhost:5173
```

Frontend: `VITE_API_BASE` in `frontend/.env`. Demo app: `VITE_OAUTH_SERVER`, `VITE_CLIENT_ID`, `VITE_CLIENT_SECRET`, `VITE_REDIRECT_URI`, `VITE_SCOPES` in `demo-app/.env`.

## Technical Gotchas

- **python-jose** needs PEM bytes (not cryptography key objects) for JWT signing
- **Consent endpoint** returns JSON `{"redirect_to": url}` instead of 302 — cross-origin fetch with `redirect: "manual"` makes Location header inaccessible
- **React StrictMode double-mount** — Callback pages use `useRef(false)` guard to prevent exchanging one-time-use auth codes twice
- **Pydantic-settings** requires `"env_file": ".env"` in `model_config`
- **Discord OAuth2 scopes**: Request `identify email guilds.members.read` from Discord
- **NS membership gating**: Backend calls Discord API to verify user is in NS guild. Non-members rejected.
- **JIT user provisioning**: Users created on first login. All profile data from Discord — no manually-seeded fields.
- **RSA keys** auto-generate on first startup into `backend/keys/`. Production uses base64-encoded PEM in env vars.
- **Cross-origin session cookies**: Production uses `SameSite=None; Secure=True` (auto-detected in `session_service.py` by checking if `settings.issuer` starts with `https`)
- **Tailwind v4** uses `@tailwindcss/vite` plugin — not the PostCSS config approach

## ZK Circuits

### Architecture

```
noir-jwt/       Fork of saleel's noir-jwt library — JWT verification in Noir circuits
                Modified for RSA-4096: rsa v0.10.0, sha256 v0.3.0, bignum v0.9.2 (Barrett +6n fix)
zk-nsauth/      ZK membership proof circuit — proves NS-Auth token ownership without revealing identity
zk-nsauth-sdk/  TypeScript SDK for generating inputs + proving/verifying via bb.js WASM
```

### Workflow

```bash
# Compile the circuit (generates target/zk_nsauth.json)
cd zk-nsauth && nargo compile

# Generate Prover.toml from a real JWT (requires valid token + JWKS)
cd zk-nsauth && npx tsx scripts/generate-prover-toml.ts

# Execute witness (solves the circuit, outputs public return value)
cd zk-nsauth && nargo execute

# Prove and verify via bb.js WASM
cd zk-nsauth && node scripts/prove.mjs
```

### ZK Gotchas

- **Dependency versions**: nargo beta.19, bb.js 4.0.0-nightly.20260120
- **`bb` CLI bug**: Native `bb prove` segfaults on 4096-bit circuits — use bb.js WASM (`scripts/prove.mjs`) instead
- **Barrett reduction**: noir-bignum v0.9.2 changed overflow bits from 4 to 6 — `generate-inputs.ts` uses `+6n` in the formula
- **Nullifier**: Pedersen hash of jti claim bytes — prevents proof replay without revealing token identity

## Deployment (Railway)

Three services + PostgreSQL on Railway (project: **cus-auth**).

| Service | URL |
|---------|-----|
| Backend | https://backend-production-c59b.up.railway.app |
| Frontend | https://frontend-production-a6eb.up.railway.app |
| Demo App | https://demo-app-production-9550.up.railway.app |

### Deploy Commands (always from repo root)

```bash
railway up --service backend --detach
railway up --service frontend --detach
railway up --service demo-app --detach
```

### Railway Gotchas

- **CRITICAL: always run `railway up` from repo root** — running from a subdirectory fails because `rootDirectory` lookup can't find the directory
- **`rootDirectory` must be set** for each service via GraphQL API (CLI doesn't support it). Values: backend → `"backend"`, frontend → `"frontend"`, demo-app → `"demo-app"`
- **Node defaults to v18** on Railway — set `NIXPACKS_NODE_VERSION=20` env var on Node services
- **Never set `NIXPACKS_PKGS` or `NIXPACKS_BUILD_CMD`** to invalid values — Nixpacks reads them as Nix expressions
- **`serve` must be a production dependency** (not devDependency) for `npx serve dist -s` to work
- **`npm ci` requires lock file in sync** — if it fails, `rm -rf node_modules package-lock.json && npm install` then redeploy
- **Alembic migrations run on deploy** via the backend `railway.toml` start command
- **Production RSA keys** are base64-encoded PEM in env vars (`OAUTH_RSA_PRIVATE_KEY`, `OAUTH_RSA_PUBLIC_KEY`), handled by `security/keys.py`
- **Changing Railway env vars** can auto-trigger a redeploy from GitHub source. If not connected to GitHub, deploy via `railway up`
- **CORS origins** must be updated when adding new service domains

### Railway CLI

```bash
railway variables --service <name>                   # List vars
railway variables --set "KEY=val" --service <name>    # Set var
railway up --service <name> --detach                  # Deploy
railway domain --service <name>                       # Get/create domain
```

## Useful Commands

```bash
# Test Discord login flow
open "http://localhost:8000/auth/discord?next=http://localhost:5173"

# Test client_credentials
curl -X POST http://localhost:8000/oauth/token \
  -d "grant_type=client_credentials&client_id=<id>&client_secret=<secret>&scope=openid"

# Check database
python3 -c "import psycopg2; conn = psycopg2.connect(dbname='oauth_provider', user='$(whoami)'); ..."

# Seed user data
python3 backend/seed_users.py
```
