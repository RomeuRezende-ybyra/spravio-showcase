// Charts — todos SVG puro, densos, estilo Bloomberg/Linear
// Expostos em window.SpravioCharts

function Sparkline({ data, width = 80, height = 22, stroke = "currentColor", fill = false, strokeWidth = 1.25 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 2) - 1]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = fill ? `${d} L${width},${height} L0,${height} Z` : null;
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block", overflow: "visible" }}>
      {fill && <path d={area} fill={stroke} fillOpacity="0.12" />}
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2" fill={stroke} />
    </svg>
  );
}

function Bars({ data, width = 80, height = 22, color = "currentColor", gap = 1 }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data) || 1;
  const barW = (width - gap * (data.length - 1)) / data.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {data.map((v, i) => {
        const h = (v / max) * height;
        return <rect key={i} x={i * (barW + gap)} y={height - h} width={barW} height={h} fill={color} rx="0.5" />;
      })}
    </svg>
  );
}

// Horizontal budget meter
function BudgetMeter({ pct, height = 8, accent = "var(--accent)", track = "var(--rule)" }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const color = clamped > 85 ? "var(--bad)" : clamped > 70 ? "var(--warn)" : "var(--good)";
  return (
    <div style={{ position: "relative", width: "100%", height, background: track, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${clamped}%`, height: "100%", background: color, transition: "width .4s" }} />
      {clamped > 15 && (
        <div style={{ position: "absolute", left: "70%", top: -2, bottom: -2, width: 1, background: "var(--ink-3)", opacity: 0.3 }} />
      )}
      {clamped > 20 && (
        <div style={{ position: "absolute", left: "85%", top: -2, bottom: -2, width: 1, background: "var(--ink-3)", opacity: 0.3 }} />
      )}
    </div>
  );
}

// Donut — sprint progress breakdown
function Donut({ segments, size = 56, thickness = 8 }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--rule)" strokeWidth={thickness} />
      {segments.map((s, i) => {
        const len = (s.value / total) * c;
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dasharray .5s" }}
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

// Activity heatmap — 14 days × 1 row per project
function ActivityHeat({ activity, cell = 10, gap = 2 }) {
  const max = 5;
  return (
    <div style={{ display: "flex", gap }}>
      {activity.map((v, i) => {
        const intensity = v / max;
        const bg = v === 0
          ? "var(--rule)"
          : `color-mix(in oklab, var(--accent) ${20 + intensity * 80}%, var(--cream-3))`;
        return (
          <div
            key={i}
            title={`${v} events`}
            style={{
              width: cell,
              height: cell,
              background: bg,
              borderRadius: 2,
              opacity: v === 0 ? 0.4 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

// Health pill
function HealthPill({ status, score, compact = false }) {
  const map = {
    green: { bg: "color-mix(in oklab, var(--good) 18%, transparent)", fg: "var(--good)", label: "On track" },
    yellow: { bg: "color-mix(in oklab, var(--warn) 22%, transparent)", fg: "var(--warn)", label: "At risk" },
    red: { bg: "color-mix(in oklab, var(--bad) 20%, transparent)", fg: "var(--bad)", label: "Critical" },
  };
  const s = map[status] || map.green;
  if (compact) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.fg, boxShadow: `0 0 0 3px ${s.bg}` }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: s.fg, fontWeight: 500 }}>{score}</span>
      </div>
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "2px 8px", borderRadius: 999,
      background: s.bg, color: s.fg,
      fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500,
      letterSpacing: "0.04em",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.fg }} />
      {s.label} · {score}
    </span>
  );
}

// Stars (0-5)
function Stars({ value, size = 10 }) {
  const full = Math.floor(value);
  const frac = value - full;
  return (
    <span style={{ display: "inline-flex", gap: 1, alignItems: "center" }}>
      {[0,1,2,3,4].map(i => {
        let fill;
        if (i < full) fill = 1;
        else if (i === full) fill = frac;
        else fill = 0;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 10 10">
            <defs>
              <linearGradient id={`star-grad-${i}-${value.toFixed(2)}`}>
                <stop offset={`${fill*100}%`} stopColor="var(--accent)" />
                <stop offset={`${fill*100}%`} stopColor="var(--rule-2)" />
              </linearGradient>
            </defs>
            <path d="M5 0.5 L6.3 3.8 L9.7 4 L7.1 6.3 L7.9 9.5 L5 7.8 L2.1 9.5 L2.9 6.3 L0.3 4 L3.7 3.8 Z"
              fill={`url(#star-grad-${i}-${value.toFixed(2)})`} />
          </svg>
        );
      })}
    </span>
  );
}

// Avatar stack
function AvatarStack({ people, max = 4, size = 22 }) {
  const show = people.slice(0, max);
  const rest = people.length - show.length;
  return (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      {show.map((p, i) => (
        <div key={i} title={p.name} style={{
          width: size, height: size, borderRadius: "50%",
          background: p.color || "var(--accent)",
          border: "1.5px solid var(--paper)",
          marginLeft: i === 0 ? 0 : -6,
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-mono)", fontSize: size * 0.42, fontWeight: 600,
          color: "white",
          letterSpacing: "-0.02em",
          zIndex: show.length - i,
        }}>{p.avatar}</div>
      ))}
      {rest > 0 && (
        <div style={{
          width: size, height: size, borderRadius: "50%",
          background: "var(--cream-3)",
          border: "1.5px solid var(--paper)",
          marginLeft: -6,
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ink-2)",
        }}>+{rest}</div>
      )}
    </div>
  );
}

// Burndown mini chart
function BurndownMini({ burndown, width = 120, height = 32 }) {
  const { ideal, actual } = burndown;
  const max = Math.max(...ideal, ...actual);
  const step = width / (ideal.length - 1);
  const toPath = (arr) => arr.map((v, i) => `${i === 0 ? "M" : "L"}${i*step},${height - (v / max) * (height - 2) - 1}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <path d={toPath(ideal)} fill="none" stroke="var(--rule-2)" strokeWidth="1" strokeDasharray="2 2" />
      <path d={toPath(actual)} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Source icon (mono glyph per integration)
function SourceIcon({ source, size = 12 }) {
  const labels = {
    jira: "J",
    azure: "A",
    github: "G",
    trello: "T",
    linear: "L",
    clickup: "C",
    monday: "M",
    asana: "S",
  };
  const colors = {
    jira: "#4B8BF5",
    azure: "#4b8bf5",
    github: "#888",
    trello: "#4B8BF5",
    linear: "#9e7cd9",
  };
  return (
    <span title={source} style={{
      display: "inline-grid", placeItems: "center",
      width: size + 4, height: size + 4, borderRadius: 3,
      background: `color-mix(in oklab, ${colors[source] || "var(--ink-3)"} 20%, transparent)`,
      color: colors[source] || "var(--ink-2)",
      fontFamily: "var(--font-mono)", fontSize: size - 2, fontWeight: 700,
      letterSpacing: 0,
    }}>{labels[source] || "?"}</span>
  );
}

// Trend arrow
function Trend({ direction }) {
  const map = {
    up: { arrow: "↑", color: "var(--good)" },
    down: { arrow: "↓", color: "var(--bad)" },
    stable: { arrow: "→", color: "var(--ink-3)" },
  };
  const t = map[direction] || map.stable;
  return <span style={{ color: t.color, fontFamily: "var(--font-mono)", fontSize: 10 }}>{t.arrow}</span>;
}

// Aggregate burn timeline chart (used in KPI strip)
function BurnTimeline({ data, width = 180, height = 40 }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d => Math.max(d.spent, d.budget)));
  const step = width / (data.length - 1);
  const spentPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${i*step},${height - (d.spent / max) * (height - 4) - 2}`).join(" ");
  const budgetPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${i*step},${height - (d.budget / max) * (height - 4) - 2}`).join(" ");
  const area = spentPath + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <path d={area} fill="var(--accent)" fillOpacity="0.15" />
      <path d={budgetPath} fill="none" stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="2 2" />
      <path d={spentPath} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Ring gauge for health score
function RingGauge({ value, size = 48, thickness = 5, label }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const color = v >= 70 ? "var(--good)" : v >= 45 ? "var(--warn)" : "var(--bad)";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--rule)" strokeWidth={thickness} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={`${(v/100)*c} ${c}`}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dasharray .5s" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-display)", fontSize: size * 0.32, fontWeight: 400,
        color: "var(--ink)", letterSpacing: "-0.02em",
      }}>{value}</div>
    </div>
  );
}

window.SpravioCharts = {
  Sparkline, Bars, BudgetMeter, Donut, ActivityHeat, HealthPill,
  Stars, AvatarStack, BurndownMini, SourceIcon, Trend, BurnTimeline, RingGauge,
};
