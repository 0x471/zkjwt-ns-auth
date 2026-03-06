import { OAUTH_SERVER, CLIENT_ID, REDIRECT_URI, SCOPES } from "../config"
import { generatePKCE } from "../pkce"

const FONT = "'Outfit', system-ui, -apple-system, sans-serif"
const MONO = "'SF Mono', 'Fira Code', 'Consolas', monospace"

/* NS "+" cross logo */
function NSLogo({ size = 16, color = "#09090b" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M11 4h2v16h-2zM4 11h16v2H4z" />
    </svg>
  )
}

export function Home() {
  async function handleSignIn() {
    const { codeVerifier, codeChallenge } = await generatePKCE()
    sessionStorage.setItem("pkce_code_verifier", codeVerifier)

    const state = crypto.randomUUID()
    sessionStorage.setItem("oauth_state", state)

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    })

    window.location.href = `${OAUTH_SERVER}/oauth/authorize?${params}`
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#09090b", color: "#fafafa", fontFamily: FONT,
      display: "flex", flexDirection: "column",
    }}>
      {/* Nav */}
      <nav className="home-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: "#fafafa",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <NSLogo size={16} color="#09090b" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>StudyTracker</span>
        </div>
        <div className="home-nav-links">
          <span className="home-nav-link">Features</span>
          <span className="home-nav-link">Leaderboard</span>
          <span className="home-nav-link">About</span>
          <button
            onClick={handleSignIn}
            style={{
              padding: "7px 18px", fontSize: 13, fontWeight: 600,
              background: "#fafafa", color: "#09090b",
              border: "none", borderRadius: 7,
              cursor: "pointer", fontFamily: FONT,
            }}
          >Sign in</button>
        </div>
      </nav>

      {/* Main content — fills remaining viewport */}
      <div className="home-main">
        <div className="home-grid">
          {/* Left: Text */}
          <div className="home-hero" style={{ animation: "fadeInUp 0.5s ease" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 6,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 12, fontWeight: 500, color: "#71717a",
              marginBottom: 24,
            }}>
              <NSLogo size={10} color="#71717a" />
              Built for Network School
            </div>

            <h1>
              Track what you learn, together.
            </h1>

            <p style={{
              fontSize: 17, lineHeight: 1.7, color: "#71717a",
              margin: "0 0 36px", maxWidth: 440,
            }}>
              Log study sessions, track streaks, compare progress with your cohort,
              and stay accountable. Exclusively for NS members.
            </p>

            <button
              onClick={handleSignIn}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "14px 28px", fontSize: 15, fontWeight: 700,
                background: "#fafafa", color: "#09090b",
                border: "none", borderRadius: 10,
                cursor: "pointer", fontFamily: FONT,
                boxShadow: "0 4px 20px rgba(255,255,255,0.06)",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)"
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,255,255,0.1)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(255,255,255,0.06)"
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 5,
                background: "#09090b",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <NSLogo size={12} color="#fafafa" />
              </div>
              Sign in with Network School
            </button>

            <div className="home-stats">
              {[
                { num: "120+", label: "NS members" },
                { num: "2,400+", label: "Sessions logged" },
                { num: "45", label: "Day top streak" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: "#3f3f46", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Mock app preview */}
          <div className="home-mock-preview" style={{
            background: "#111114", borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
            animation: "fadeInUp 0.5s ease 0.15s both",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}>
            {/* Mock top bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                }} />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>alice</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 6px", marginLeft: 6,
                    borderRadius: 4, background: "rgba(52,211,153,0.12)",
                    color: "#34d399",
                  }}>Cohort 5</span>
                </div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 12, fontWeight: 600, color: "#f59e0b",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                7 day streak
              </div>
            </div>

            {/* Mock study log */}
            <div style={{ padding: "14px 18px" }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "#3f3f46",
                textTransform: "uppercase" as const, letterSpacing: "0.1em",
                marginBottom: 10,
              }}>This week</div>

              {[
                { day: "Today", topic: "Solidity — ERC-721 standard", hrs: "2.5h", active: true },
                { day: "Yesterday", topic: "Rust — ownership & borrowing", hrs: "1.8h", active: true },
                { day: "Mon", topic: "ZK Proofs — Groth16 intro", hrs: "3.0h", active: true },
                { day: "Sun", topic: "React Server Components", hrs: "2.0h", active: true },
                { day: "Sat", topic: "Ethereum — MEV & flashbots", hrs: "1.5h", active: true },
              ].map((entry, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: 8,
                  background: i === 0 ? "rgba(255,255,255,0.03)" : "transparent",
                  marginBottom: 2,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: entry.active ? "#34d399" : "#27272a",
                    }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{entry.topic}</div>
                      <div style={{ fontSize: 11, color: "#3f3f46" }}>{entry.day}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: "#52525b",
                    fontFamily: MONO,
                  }}>{entry.hrs}</span>
                </div>
              ))}
            </div>

            {/* Mock stats bar */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8, padding: "14px 18px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}>
              {[
                { label: "This week", value: "10.8h" },
                { label: "Streak", value: "7 days" },
                { label: "Cohort rank", value: "#4" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>{s.value}</div>
                  <div style={{
                    fontSize: 10, color: "#3f3f46", fontWeight: 600,
                    textTransform: "uppercase" as const, letterSpacing: "0.06em",
                    marginTop: 2,
                  }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Mock cohort leaderboard peek */}
            <div style={{
              padding: "14px 18px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "#3f3f46",
                textTransform: "uppercase" as const, letterSpacing: "0.1em",
                marginBottom: 10,
              }}>Cohort 5 — Top this week</div>
              {[
                { rank: 1, name: "raj", hrs: "14.2h" },
                { rank: 2, name: "maya", hrs: "12.8h" },
                { rank: 3, name: "dc", hrs: "11.5h" },
                { rank: 4, name: "alice", hrs: "10.8h", you: true },
              ].map((m) => (
                <div key={m.rank} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "6px 0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: "#3f3f46", width: 18, textAlign: "center",
                    }}>#{m.rank}</span>
                    <span style={{
                      fontSize: 13, fontWeight: m.you ? 700 : 500,
                      color: m.you ? "#fafafa" : "#71717a",
                    }}>
                      {m.name}{m.you && <span style={{ fontSize: 10, color: "#52525b", marginLeft: 4 }}>(you)</span>}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: "#52525b",
                    fontFamily: MONO,
                  }}>{m.hrs}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "16px 24px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        fontSize: 12, color: "#27272a",
        flexShrink: 0,
      }}>
        Powered by NS OAuth
      </footer>
    </div>
  )
}
