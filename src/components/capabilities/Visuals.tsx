import type { Capability } from "@/content/site";

/* Small animated SVG illustrations, one per capability. Pure CSS animation (globals.css),
   paused automatically for prefers-reduced-motion. Decorative only. */

const C = { cyan: "#4fd8ff", violet: "#9b7bff", magenta: "#d24bd0", line: "rgba(215,226,234,0.18)", dim: "rgba(215,226,234,0.45)" };

function Graph() {
  const nodes = [
    [40, 80], [100, 36], [104, 122], [170, 70], [236, 30], [240, 120], [290, 78],
  ] as const;
  const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [1, 4]] as const;
  return (
    <svg viewBox="0 0 320 160" className="h-full w-full" aria-hidden="true">
      {edges.map(([a, b], i) => (
        <g key={i}>
          <line x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={C.line} strokeWidth="1" />
          <line
            x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
            stroke={i % 2 ? C.violet : C.cyan} strokeWidth="2" strokeLinecap="round" className="viz-pulse"
            style={{ animationDelay: `${i * 0.31}s` }}
          />
        </g>
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === 3 ? 9 : 5} fill="none" stroke={i === 3 ? C.magenta : C.cyan} strokeOpacity="0.35" className="viz-breathe" style={{ animationDelay: `${i * 0.4}s` }} />
          <circle cx={x} cy={y} r={i === 3 ? 4 : 2.6} fill={i === 3 ? C.magenta : "#e6f6ff"} />
        </g>
      ))}
      <text x="170" y="98" textAnchor="middle" fill={C.dim} fontSize="8" letterSpacing="2">LLM</text>
    </svg>
  );
}

function Forecast() {
  const hist = "M10 120 L40 108 L70 112 L100 92 L130 98 L160 76 L190 82";
  return (
    <svg viewBox="0 0 320 160" className="h-full w-full" aria-hidden="true">
      {[40, 80, 120].map((y) => (
        <line key={y} x1="10" x2="310" y1={y} y2={y} stroke={C.line} strokeDasharray="2 6" />
      ))}
      <line x1="190" x2="190" y1="20" y2="140" stroke={C.line} />
      <path d="M190 82 L220 60 L250 66 L280 44 L310 50 L310 92 L280 84 L250 100 L220 92 Z" fill="url(#band)" className="viz-blink" />
      <path d={hist} fill="none" stroke={C.cyan} strokeWidth="2.2" strokeLinejoin="round" className="viz-draw" />
      <path d="M190 82 L220 76 L250 82 L280 64 L310 70" fill="none" stroke={C.magenta} strokeWidth="2" strokeDasharray="5 5" />
      <circle cx="190" cy="82" r="4" fill="#e6f6ff" className="viz-breathe" />
      <text x="196" y="30" fill={C.dim} fontSize="8" letterSpacing="2">FORECAST</text>
      <defs>
        <linearGradient id="band" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={C.violet} stopOpacity="0.35" />
          <stop offset="1" stopColor={C.violet} stopOpacity="0.05" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Pipeline() {
  const stages = [
    { x: 20, label: "BRONZE", c: "#c98a5a" },
    { x: 125, label: "SILVER", c: "#c9d3dc" },
    { x: 230, label: "GOLD", c: "#e5c25a" },
  ];
  return (
    <svg viewBox="0 0 320 160" className="h-full w-full" aria-hidden="true">
      {[0, 1].map((i) => (
        <g key={i}>
          <path d={`M${stages[i].x + 70} 80 L${stages[i + 1].x} 80`} stroke={C.line} strokeWidth="1.5" />
          <path d={`M${stages[i].x + 70} 80 L${stages[i + 1].x} 80`} stroke={C.cyan} strokeWidth="2.4" strokeLinecap="round" className="viz-flow" />
        </g>
      ))}
      {stages.map((s, i) => (
        <g key={s.label} className="viz-float" style={{ animationDelay: `${i * 0.6}s` }}>
          <rect x={s.x} y="52" width="70" height="56" rx="14" fill="rgba(255,255,255,0.03)" stroke={s.c} strokeOpacity="0.55" />
          {[0, 1, 2].map((r) => (
            <rect key={r} x={s.x + 12} y={64 + r * 11} width={46 - r * 10} height="4" rx="2" fill={s.c} opacity={0.5 - r * 0.12} />
          ))}
          <text x={s.x + 35} y="126" textAnchor="middle" fill={C.dim} fontSize="8" letterSpacing="2">{s.label}</text>
        </g>
      ))}
      <path d="M0 30 L320 30" stroke={C.line} strokeDasharray="1 7" />
      <path d="M0 30 L320 30" stroke={C.violet} strokeWidth="2" className="viz-flow" style={{ animationDuration: "2.6s" }} />
      <text x="6" y="22" fill={C.dim} fontSize="7" letterSpacing="2">STREAM</text>
    </svg>
  );
}

function Document() {
  const rows = [0, 1, 2, 3, 4, 5, 6];
  return (
    <svg viewBox="0 0 320 160" className="h-full w-full" aria-hidden="true">
      <rect x="40" y="14" width="110" height="132" rx="10" fill="rgba(255,255,255,0.03)" stroke={C.line} />
      {rows.map((r) => (
        <rect key={r} x="54" y={30 + r * 15} width={r % 3 === 0 ? 58 : 82} height="5" rx="2.5" fill="rgba(215,226,234,0.22)" />
      ))}
      <g className="viz-scan">
        <rect x="40" y="22" width="110" height="2" fill={C.cyan} />
        <rect x="40" y="10" width="110" height="14" fill="url(#scanGlow)" />
      </g>
      {[0, 3, 5].map((r, i) => (
        <g key={r} className="viz-blink" style={{ animationDelay: `${i * 0.5}s` }}>
          <rect x="52" y={28 + r * 15} width={r % 3 === 0 ? 62 : 86} height="9" rx="3" fill="none" stroke={i === 1 ? C.magenta : C.cyan} />
          <path d={`M${r % 3 === 0 ? 118 : 142} ${32 + r * 15} C 175 ${32 + r * 15}, 180 ${40 + i * 38}, 196 ${40 + i * 38}`} fill="none" stroke={C.line} />
          <rect x="196" y={30 + i * 38} width="96" height="20" rx="8" fill="rgba(79,216,255,0.06)" stroke={i === 1 ? C.magenta : C.cyan} strokeOpacity="0.6" />
          <rect x="206" y={38 + i * 38} width={40 + i * 12} height="4" rx="2" fill={i === 1 ? C.magenta : C.cyan} opacity="0.8" />
        </g>
      ))}
      <defs>
        <linearGradient id="scanGlow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={C.cyan} stopOpacity="0" />
          <stop offset="1" stopColor={C.cyan} stopOpacity="0.25" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function CapabilityVisual({ kind }: { kind: Capability["visual"] }) {
  if (kind === "graph") return <Graph />;
  if (kind === "forecast") return <Forecast />;
  if (kind === "pipeline") return <Pipeline />;
  return <Document />;
}
