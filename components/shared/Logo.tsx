'use client'

interface LogoProps {
  className?: string
  size?: number
  glow?: boolean
}

export function Logo({ className = '', size = 24, glow = false }: LogoProps) {
  const h = 12 // Half of viewBox 24
  const s = 1  // Scale unit for viewBox 24

  // 3 orbiting nodes — community members connected to the hub
  const nodeRadius = 8.75 // (h * 0.73 approx)
  const nodeData = [
    { angle: -55, color: '#818cf8', dotR: 1.35, lineOpacity: 0.55 }, // top-right — indigo
    { angle:  90, color: '#38bdf8', dotR: 1.10, lineOpacity: 0.45 }, // bottom   — sky
    { angle: 215, color: '#a78bfa', dotR: 1.22, lineOpacity: 0.50 }, // top-left — violet
  ].map(n => ({
    ...n,
    x: h + nodeRadius * Math.cos((n.angle * Math.PI) / 180),
    y: h + nodeRadius * Math.sin((n.angle * Math.PI) / 180),
  }))

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        filter: glow
          ? `drop-shadow(0 0 ${Math.round(size * 0.22)}px rgba(129,140,248,0.65))`
          : undefined,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="StellarHub"
      >
        <defs>
          {/* Core gradient — bright indigo center */}
          <radialGradient id="sh-core" cx="35%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#e0e7ff" />
            <stop offset="35%"  stopColor="#818cf8" />
            <stop offset="75%"  stopColor="#4338ca" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </radialGradient>

          {/* Orbit ring gradient — sharp fade in/out */}
          <linearGradient id="sh-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#818cf8" stopOpacity="0.08" />
            <stop offset="25%"  stopColor="#818cf8" stopOpacity="0.7"  />
            <stop offset="55%"  stopColor="#38bdf8" stopOpacity="0.8"  />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* ── Orbit ring — clean dashed circle (stationary) ── */}
        <circle
          cx={h} cy={h} r={nodeRadius}
          stroke="url(#sh-ring)"
          strokeWidth={s * 0.5}
          strokeDasharray={`${s * 1.4} ${s * 2}`}
          fill="none"
          opacity="0.35"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${h} ${h}`}
            to={`360 ${h} ${h}`}
            dur="20s"
            repeatCount="indefinite"
          />
        </circle>

        {/* ── Connection lines: nodes → hub center ── */}
        {nodeData.map((n, i) => (
          <line
            key={`line-${i}`}
            x1={h}   y1={h}
            x2={n.x} y2={n.y}
            stroke={n.color}
            strokeWidth={s * 0.7}
            strokeLinecap="round"
            opacity={n.lineOpacity}
          />
        ))}

        {/* ── Outer node rings (halo) ── */}
        {nodeData.map((n, i) => (
          <circle
            key={`halo-${i}`}
            cx={n.x} cy={n.y}
            r={n.dotR * 1.9}
            fill={n.color}
            opacity="0.1"
          >
            <animate
              attributeName="opacity"
              values="0.06;0.18;0.06"
              dur={`${2.8 + i * 0.7}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* ── Outer nodes (solid) ── */}
        {nodeData.map((n, i) => (
          <circle
            key={`dot-${i}`}
            cx={n.x} cy={n.y}
            r={n.dotR}
            fill={n.color}
            opacity="0.92"
          >
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur={`${2.8 + i * 0.7}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* ── Stellar core (hub) ── */}
        <circle
          cx={h} cy={h}
          r={h * 0.315}
          fill="url(#sh-core)"
        />

        {/* ── Core border (crisp ring on core) ── */}
        <circle
          cx={h} cy={h}
          r={h * 0.315}
          stroke="#a5b4fc"
          strokeWidth={s * 0.55}
          fill="none"
          opacity="0.45"
        />

        {/* ── Pulse ring on core ── */}
        <circle cx={h} cy={h} r={h * 0.315} fill="none" stroke="#818cf8" strokeWidth={s * 0.5} opacity="0">
          <animate attributeName="opacity" values="0;0.4;0"      dur="3.5s" repeatCount="indefinite" />
          <animate attributeName="r"       values={`${h*0.315};${h*0.5};${h*0.315}`} dur="3.5s" repeatCount="indefinite" />
        </circle>

        {/* ── Core lens highlight ── */}
        <circle cx={h - s * 0.72} cy={h - s * 0.72} r={s * 0.52} fill="white" opacity="0.42" />

        {/* ── 4-point star sparkle in core ── */}
        <path
          d={`M${h} ${h - s*1.4} L${h+s*0.28} ${h-s*0.28} L${h+s*1.4} ${h} L${h+s*0.28} ${h+s*0.28} L${h} ${h+s*1.4} L${h-s*0.28} ${h+s*0.28} L${h-s*1.4} ${h} L${h-s*0.28} ${h-s*0.28} Z`}
          fill="white"
          opacity="0.22"
        />
      </svg>
    </div>
  )
}
