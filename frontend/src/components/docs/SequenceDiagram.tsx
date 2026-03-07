import { useEffect, useState, useRef } from "react"

interface Step {
    from: number
    to: number
    label: string
    sublabel?: string
    color: string
}

const ACTORS = [
    { id: "app", label: "Your App", icon: "◆" },
    { id: "ns", label: "NS Auth", icon: "◈" },
    { id: "discord", label: "Discord", icon: "◉" },
]

const STEPS: Step[] = [
    { from: 0, to: 1, label: "Redirect to /oauth/authorize", sublabel: "client_id + PKCE challenge + scopes", color: "#0a0a0a" },
    { from: 1, to: 2, label: "Redirect to Discord login", sublabel: "", color: "#5865F2" },
    { from: 2, to: 2, label: "User authenticates", sublabel: "", color: "#5865F2" },
    { from: 2, to: 1, label: "Callback with auth code", sublabel: "", color: "#5865F2" },
    { from: 1, to: 1, label: "Verify NS membership", sublabel: "", color: "#0a0a0a" },
    { from: 1, to: 0, label: "Redirect with ?code=…", sublabel: "", color: "#0a0a0a" },
    { from: 0, to: 1, label: "POST /oauth/token", sublabel: "code + client_secret + code_verifier", color: "#0a0a0a" },
    { from: 1, to: 0, label: "access_token + id_token", sublabel: "+ refresh_token", color: "#16a34a" },
    { from: 0, to: 1, label: "GET /oauth/userinfo", sublabel: "Bearer token", color: "#0a0a0a" },
    { from: 1, to: 2, label: "Fetch live profile & roles", sublabel: "5-min cache", color: "#5865F2" },
    { from: 1, to: 0, label: "User claims JSON", sublabel: "name, email, roles, avatar…", color: "#16a34a" },
]

export function SequenceDiagram() {
    const [visibleSteps, setVisibleSteps] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const hasAnimated = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true
                    let step = 0
                    const interval = setInterval(() => {
                        step++
                        setVisibleSteps(step)
                        if (step >= STEPS.length) clearInterval(interval)
                    }, 200)
                }
            },
            { threshold: 0.2 }
        )

        if (containerRef.current) observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    const COL_WIDTH = 200
    const ROW_HEIGHT = 48
    const HEADER_HEIGHT = 60
    const PADDING_X = 40
    const SVG_WIDTH = ACTORS.length * COL_WIDTH + PADDING_X * 2
    const SVG_HEIGHT = HEADER_HEIGHT + STEPS.length * ROW_HEIGHT + 40

    const colX = (i: number) => PADDING_X + i * COL_WIDTH + COL_WIDTH / 2

    return (
        <div ref={containerRef} className="my-6 overflow-x-auto">
            <svg
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                className="w-full max-w-2xl mx-auto"
                style={{ minWidth: 520 }}
            >
                {/* Actor headers */}
                {ACTORS.map((actor, i) => (
                    <g key={actor.id}>
                        <rect
                            x={colX(i) - 56}
                            y={8}
                            width={112}
                            height={36}
                            rx={8}
                            fill={i === 2 ? "#5865F2" : "#0a0a0a"}
                            opacity={0.9}
                        />
                        <text
                            x={colX(i)}
                            y={31}
                            textAnchor="middle"
                            fontSize={12}
                            fontWeight={600}
                            fontFamily="Inter, system-ui, sans-serif"
                            fill="white"
                        >
                            {actor.label}
                        </text>
                    </g>
                ))}

                {/* Lifelines */}
                {ACTORS.map((_, i) => (
                    <line
                        key={`line-${i}`}
                        x1={colX(i)}
                        y1={HEADER_HEIGHT}
                        x2={colX(i)}
                        y2={SVG_HEIGHT - 8}
                        stroke="#e5e5e5"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                    />
                ))}

                {/* Steps */}
                {STEPS.map((step, i) => {
                    const y = HEADER_HEIGHT + i * ROW_HEIGHT + ROW_HEIGHT / 2 + 8
                    const visible = i < visibleSteps
                    const isSelf = step.from === step.to

                    if (isSelf) {
                        // Self-arrow (loops back to same actor)
                        const x = colX(step.from)
                        return (
                            <g
                                key={i}
                                style={{
                                    opacity: visible ? 1 : 0,
                                    transform: visible ? "translateY(0)" : "translateY(4px)",
                                    transition: "all 0.3s ease-out",
                                }}
                            >
                                <path
                                    d={`M ${x} ${y - 6} C ${x + 40} ${y - 6}, ${x + 40} ${y + 6}, ${x} ${y + 6}`}
                                    fill="none"
                                    stroke={step.color}
                                    strokeWidth={1.5}
                                    markerEnd="none"
                                />
                                <polygon
                                    points={`${x + 4},${y + 2} ${x},${y + 8} ${x - 4},${y + 2}`}
                                    fill={step.color}
                                />
                                <text
                                    x={x + 46}
                                    y={y + 1}
                                    fontSize={10}
                                    fontFamily="Inter, system-ui, sans-serif"
                                    fontWeight={500}
                                    fill="#0a0a0a"
                                    dominantBaseline="middle"
                                >
                                    {step.label}
                                </text>
                            </g>
                        )
                    }

                    const x1 = colX(step.from)
                    const x2 = colX(step.to)
                    const direction = x2 > x1 ? 1 : -1
                    const arrowX = x2 - direction * 6

                    return (
                        <g
                            key={i}
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(4px)",
                                transition: "all 0.3s ease-out",
                            }}
                        >
                            <line
                                x1={x1}
                                y1={y}
                                x2={arrowX}
                                y2={y}
                                stroke={step.color}
                                strokeWidth={1.5}
                            />
                            <polygon
                                points={`${x2},${y} ${arrowX},${y - 4} ${arrowX},${y + 4}`}
                                fill={step.color}
                            />
                            <text
                                x={(x1 + x2) / 2}
                                y={y - 8}
                                textAnchor="middle"
                                fontSize={10}
                                fontFamily="Inter, system-ui, sans-serif"
                                fontWeight={500}
                                fill="#0a0a0a"
                            >
                                {step.label}
                            </text>
                            {step.sublabel && (
                                <text
                                    x={(x1 + x2) / 2}
                                    y={y + 14}
                                    textAnchor="middle"
                                    fontSize={9}
                                    fontFamily="Inter, system-ui, sans-serif"
                                    fill="#737373"
                                >
                                    {step.sublabel}
                                </text>
                            )}
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}
