import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import {
  BookOpen, ExternalLink, FileText, ChevronRight, Layers,
} from "lucide-react"
import { NAV_GROUPS, ALL_SECTION_IDS } from "@/components/docs/constants"

// Section components
import {
  OverviewSection, QuickStartSection, RegisterSection,
  AuthFlowSection, ScopesSection,
} from "@/components/docs/sections/OverviewSection"
import {
  EndpointsSection, UserinfoSection, TokenRefreshSection,
  ErrorCodesSection, OIDCSection, DocsFooter,
} from "@/components/docs/sections/ReferenceSection"
import {
  NextAuthSection, ReactSection,
} from "@/components/docs/sections/IntegrateSection"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Main Page
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setActiveSection(entry.target.id)
      }
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "-20% 0px -70% 0px",
    })

    for (const id of ALL_SECTION_IDS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [handleIntersection])

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-14 px-5">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              NS Auth
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <span className="px-3 py-1.5 rounded-md bg-secondary text-sm font-medium text-foreground">Docs</span>
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <FileText className="h-3 w-3" />
              llms.txt
            </a>
            <a
              href="https://demo.nsauth.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Demo <ExternalLink className="h-3 w-3" />
            </a>
            {/* Mobile nav toggle */}
            <button
              className="lg:hidden p-1.5 rounded-md hover:bg-secondary text-muted-foreground"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <Layers className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-5 flex gap-0">
        {/* ── Sidebar ── */}
        <aside
          className={`${mobileNavOpen ? "block fixed inset-0 top-14 z-40 bg-background p-5" : "hidden"
            } lg:block lg:w-52 lg:shrink-0 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:py-8 lg:overflow-y-auto lg:pr-2`}
        >
          <nav className="space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.08em] mb-1.5 px-3">
                  {group.title}
                </p>
                <div className="space-y-px">
                  {group.items.map((item) => {
                    const isActive = activeSection === item.id
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => setMobileNavOpen(false)}
                        className={`group flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-md transition-all duration-150 ${isActive
                          ? "text-foreground bg-secondary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                          }`}
                      >
                        <ChevronRight
                          className={`h-3 w-3 transition-transform duration-150 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0"
                            }`}
                        />
                        {item.label}
                      </a>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0 py-8 pb-32 lg:pl-8 lg:border-l lg:border-border/50">
          <OverviewSection />
          <QuickStartSection />
          <RegisterSection />
          <AuthFlowSection />
          <ScopesSection />
          <UserinfoSection />
          <EndpointsSection />
          <NextAuthSection />
          <ReactSection />
          <TokenRefreshSection />
          <ErrorCodesSection />
          <OIDCSection />
          <DocsFooter />
        </main>
      </div>
    </div>
  )
}
