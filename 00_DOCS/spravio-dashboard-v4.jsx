import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

// ── THEMES ───────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#0A0D12", surface: "#111520", surfaceHover: "#161B27", surfaceAlt: "#0D1019",
    border: "#1E2535", borderLight: "#252D3D",
    primary: "#00C9B1", primaryDim: "#00C9B115", primaryGlow: "#00C9B135", primaryText: "#00C9B1",
    github: "#E8EAF0", githubDim: "#E8EAF015", githubAccent: "#8B949E",
    text: "#F0F4FF", textMuted: "#6B7A99", textDim: "#3D4A66",
    shadow: "0 4px 24px rgba(0,0,0,0.4)", shadowCard: "0 2px 12px rgba(0,0,0,0.3)",
    green: "#22C55E", greenBg: "#22C55E15",
    yellow: "#F59E0B", yellowBg: "#F59E0B15",
    red: "#EF4444", redBg: "#EF444415",
    blue: "#3B82F6", blueBg: "#3B82F615",
    purple: "#A855F7", purpleBg: "#A855F715",
    orange: "#F97316", orangeBg: "#F9731615",
    logoGrad: "linear-gradient(135deg, #00C9B1, #0097A7)",
    ghGrad: "linear-gradient(135deg, #30363D, #21262D)",
  },
  light: {
    bg: "#F4F6FA", surface: "#FFFFFF", surfaceHover: "#F8FAFC", surfaceAlt: "#EEF1F8",
    border: "#E2E8F0", borderLight: "#CBD5E1",
    primary: "#0097A7", primaryDim: "#0097A710", primaryGlow: "#0097A720", primaryText: "#0097A7",
    github: "#24292F", githubDim: "#24292F10", githubAccent: "#57606A",
    text: "#0F172A", textMuted: "#64748B", textDim: "#94A3B8",
    shadow: "0 4px 24px rgba(15,23,42,0.08)", shadowCard: "0 2px 8px rgba(15,23,42,0.06)",
    green: "#16A34A", greenBg: "#16A34A12",
    yellow: "#D97706", yellowBg: "#D9770612",
    red: "#DC2626", redBg: "#DC262612",
    blue: "#2563EB", blueBg: "#2563EB12",
    purple: "#7C3AED", purpleBg: "#7C3AED12",
    orange: "#EA580C", orangeBg: "#EA580C12",
    logoGrad: "linear-gradient(135deg, #0097A7, #006B77)",
    ghGrad: "linear-gradient(135deg, #24292F, #1C2128)",
  }
};

// ── DATA ─────────────────────────────────────────────────────

const gps = [
  { id: "gp1", name: "Marcos Andrade", avatar: "MA", email: "marcos@agencia.com", projectIds: [1, 2] },
  { id: "gp2", name: "Fernanda Lima",  avatar: "FL", email: "fernanda@agencia.com", projectIds: [3, 4] },
];

const projects = [
  { id: 1, name: "Banco Meridian",   client: "Meridian S.A.",  health: "on_track", progress: 78, sprint: "Sprint 12", repo: "meridian/banking-app",  daysLeft: 8,  gpId: "gp1" },
  { id: 2, name: "E-commerce Vora",  client: "Vora Retail",    health: "at_risk",  progress: 43, sprint: "Sprint 6",  repo: "vora/ecommerce",        daysLeft: 3,  gpId: "gp1" },
  { id: 3, name: "Portal RH Nex",    client: "Nex Corp",       health: "on_track", progress: 91, sprint: "Sprint 18", repo: "nex/hr-portal",          daysLeft: 14, gpId: "gp2" },
  { id: 4, name: "App Fintech Kaia", client: "Kaia Pay",       health: "late",     progress: 31, sprint: "Sprint 4",  repo: "kaia/fintech-app",       daysLeft: 0,  gpId: "gp2" },
];

const developers = [
  { id: 1, name: "Lucas Ferreira",  role: "Backend",  avatar: "LF", score: 4.9, deliveryRate: 94, reworkRate: 6,  jiraPoints: 38, githubLogin: "lucas-ferreira", prCount: 12, mergedPRs: 11, openPRs: 1, commits: 47, reviews: 8,  approvalsGiven: 6,  linesAdded: 1840, linesRemoved: 420,  avgCycleTime: 18, stalePRs: 0, weeklyCommits: [3,5,4,7,6,8,4] },
  { id: 2, name: "Ana Costa",       role: "Frontend", avatar: "AC", score: 4.6, deliveryRate: 88, reworkRate: 14, jiraPoints: 31, githubLogin: "ana-costa",      prCount: 9,  mergedPRs: 8,  openPRs: 1, commits: 31, reviews: 14, approvalsGiven: 11, linesAdded: 2310, linesRemoved: 890,  avgCycleTime: 22, stalePRs: 0, weeklyCommits: [2,4,3,5,4,6,3] },
  { id: 3, name: "Pedro Alves",     role: "Backend",  avatar: "PA", score: 3.7, deliveryRate: 72, reworkRate: 28, jiraPoints: 24, githubLogin: "pedro-alves",    prCount: 7,  mergedPRs: 5,  openPRs: 2, commits: 19, reviews: 2,  approvalsGiven: 1,  linesAdded: 680,  linesRemoved: 210,  avgCycleTime: 54, stalePRs: 2, weeklyCommits: [1,2,1,3,2,1,2] },
  { id: 4, name: "Mariana Silva",   role: "Frontend", avatar: "MS", score: 5.0, deliveryRate: 97, reworkRate: 3,  jiraPoints: 42, githubLogin: "mariana-silva",  prCount: 14, mergedPRs: 14, openPRs: 0, commits: 58, reviews: 19, approvalsGiven: 15, linesAdded: 3120, linesRemoved: 1050, avgCycleTime: 14, stalePRs: 0, weeklyCommits: [5,7,6,9,8,10,6] },
];

const pullRequests = [
  { id: 1, number: 234, title: "feat: Payment gateway v2 integration",    author: "LF", jiraKey: "BANK-041", status: "merged",    cycleTime: 16, branch: "feat/BANK-041-payment-gateway",  stale: false },
  { id: 2, number: 235, title: "fix: Auth token refresh race condition",   author: "PA", jiraKey: "BANK-042", status: "in_review", cycleTime: 72, branch: "fix/BANK-042-auth-token",         stale: true  },
  { id: 3, number: 236, title: "feat: Dashboard balance widget",           author: "AC", jiraKey: "BANK-043", status: "approved",  cycleTime: 20, branch: "feat/BANK-043-balance-widget",    stale: false },
  { id: 4, number: 237, title: "feat: Transaction history export CSV",     author: "MS", jiraKey: "BANK-044", status: "open",      cycleTime: 8,  branch: "feat/BANK-044-tx-export",         stale: false },
  { id: 5, number: 238, title: "feat: Notification center UI",             author: "AC", jiraKey: "BANK-045", status: "merged",    cycleTime: 24, branch: "feat/BANK-045-notifs",            stale: false },
  { id: 6, number: 239, title: "feat: KYC document upload API",            author: "LF", jiraKey: "BANK-046", status: "merged",    cycleTime: 14, branch: "feat/BANK-046-kyc-upload",        stale: false },
];

const cards = [
  { id: "BANK-041", title: "Payment gateway integration",   dev: "LF", pts: 8, status: "done",        prNumber: 234 },
  { id: "BANK-042", title: "Auth token refresh flow",       dev: "PA", pts: 5, status: "test",        prNumber: 235 },
  { id: "BANK-043", title: "Dashboard balance widget",      dev: "AC", pts: 3, status: "done",        prNumber: 236 },
  { id: "BANK-044", title: "Transaction history export",    dev: "MS", pts: 5, status: "in_progress", prNumber: 237 },
  { id: "BANK-045", title: "Notification center UI",        dev: "AC", pts: 3, status: "uat",         prNumber: 238 },
  { id: "BANK-046", title: "KYC document upload API",       dev: "LF", pts: 8, status: "done",        prNumber: 239 },
];

const burndownData = [
  { sprint: "S1", baseline: 40, actual: 38 },{ sprint: "S2", baseline: 36, actual: 30 },
  { sprint: "S3", baseline: 32, actual: 35 },{ sprint: "S4", baseline: 28, actual: 22 },
  { sprint: "S5", baseline: 24, actual: 26 },{ sprint: "S6", baseline: 20, actual: 18 },
  { sprint: "S7", baseline: 16, actual: 14 },{ sprint: "S8", baseline: 12, actual: 10 },
  { sprint: "S9", baseline: 8,  actual: 11 },{ sprint: "S10", baseline: 4, actual: 7  },
  { sprint: "S11", baseline: 0, actual: 4  },
];

const progressData = [
  { name: "Done", value: 58, color: "#16A34A" },
  { name: "UAT",  value: 17, color: "#0097A7" },
  { name: "Test", value: 12, color: "#2563EB" },
  { name: "In Progress", value: 13, color: "#D97706" },
];

// ── CONFIG HELPERS ────────────────────────────────────────────
function getStatusConfig(C) {
  return {
    done:        { label: "Done",        color: C.green,  bg: C.greenBg  },
    uat:         { label: "UAT",         color: C.primary,bg: C.primaryDim},
    test:        { label: "Test",        color: C.blue,   bg: C.blueBg   },
    in_progress: { label: "In Progress", color: C.yellow, bg: C.yellowBg },
    todo:        { label: "To Do",       color: C.textMuted,bg: C.surfaceAlt},
  };
}
function getPRStatusConfig(C) {
  return {
    merged:    { label: "Merged",    color: C.purple, bg: C.purpleBg },
    approved:  { label: "Approved",  color: C.green,  bg: C.greenBg  },
    in_review: { label: "In Review", color: C.blue,   bg: C.blueBg   },
    open:      { label: "Open",      color: C.yellow, bg: C.yellowBg },
    closed:    { label: "Closed",    color: C.textMuted, bg: C.surfaceAlt },
  };
}
function getHealthConfig(C) {
  return {
    on_track: { label: "On Track", color: C.green,  bg: C.greenBg  },
    at_risk:  { label: "At Risk",  color: C.yellow, bg: C.yellowBg },
    late:     { label: "Late",     color: C.red,    bg: C.redBg    },
  };
}
function getDevColors(isDark) {
  return isDark
    ? ["#00C9B1","#A855F7","#F59E0B","#22C55E"]
    : ["#0097A7","#7C3AED","#D97706","#16A34A"];
}

// ── MICRO COMPONENTS ─────────────────────────────────────────

function GhBadge({ C }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:3,padding:"2px 6px",borderRadius:4,background:C.githubDim,border:`1px solid ${C.githubAccent}30`,fontSize:9,color:C.githubAccent,fontWeight:600 }}>
      <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
      GitHub
    </div>
  );
}

function RateBar({ value, color, label, C }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
      <span style={{ fontSize:10,color:C.textMuted,width:52 }}>{label}</span>
      <div style={{ flex:1,height:3,background:C.border,borderRadius:2,overflow:"hidden" }}>
        <div style={{ width:`${value}%`,height:"100%",background:color,borderRadius:2 }} />
      </div>
      <span style={{ fontSize:10,color,fontWeight:600,width:28,fontFamily:"'DM Mono',monospace" }}>{value}%</span>
    </div>
  );
}

function ScoreStars({ score, C }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:3 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ width:6,height:6,borderRadius:"50%",background:i<=Math.floor(score)?C.primary:C.border }} />
      ))}
      <span style={{ fontSize:11,color:C.textMuted,marginLeft:4,fontFamily:"'DM Mono',monospace" }}>{score}</span>
    </div>
  );
}

function DevCard({ dev, devColor, selected, onClick, C }) {
  return (
    <div onClick={onClick} style={{ background:selected?C.primaryDim:C.surface,border:`1px solid ${selected?C.primary+"50":dev.stalePRs>0?C.yellow+"40":C.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",transition:"all 0.2s",boxShadow:selected?`0 0 0 2px ${C.primaryGlow}`:C.shadowCard,position:"relative" }}>
      {dev.stalePRs > 0 && <div style={{ position:"absolute",top:10,right:10,background:C.yellow,borderRadius:"50%",width:8,height:8 }} />}
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
        <div style={{ width:34,height:34,borderRadius:10,background:`${devColor}18`,border:`1px solid ${devColor}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:devColor,fontFamily:"'DM Mono',monospace" }}>{dev.avatar}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:12,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{dev.name}</div>
          <div style={{ fontSize:9,color:devColor,fontWeight:500 }}>{dev.role}</div>
        </div>
        <div style={{ fontSize:12,fontWeight:700,color:devColor,fontFamily:"'DM Mono',monospace" }}>{dev.score}</div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:5,marginBottom:10 }}>
        <RateBar value={dev.deliveryRate} color={C.green} label="Delivery" C={C} />
        <RateBar value={dev.reworkRate} color={dev.reworkRate>20?C.red:C.yellow} label="Rework" C={C} />
      </div>
      <div style={{ background:C.surfaceAlt,borderRadius:8,padding:"8px 10px",border:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4 }}>
        {[["⑂",dev.mergedPRs,"PRs"],["◎",dev.commits,"Commits"],["◷",`${dev.avgCycleTime}h`,"Cycle"],["✓",dev.approvalsGiven,"Reviews"]].map(([icon,val,lbl])=>(
          <div key={lbl} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
            <span style={{ fontSize:12 }}>{icon}</span>
            <span style={{ fontSize:11,fontWeight:700,color:C.text,fontFamily:"'DM Mono',monospace" }}>{val}</span>
            <span style={{ fontSize:8,color:C.textDim }}>{lbl}</span>
          </div>
        ))}
      </div>
      {dev.stalePRs > 0 && <div style={{ marginTop:8,padding:"3px 8px",borderRadius:6,background:C.yellowBg,border:`1px solid ${C.yellow}30`,fontSize:10,color:C.yellow,fontWeight:600 }}>⚠ {dev.stalePRs} stale PR</div>}
    </div>
  );
}

function ThemeToggle({ theme, setTheme, C }) {
  const isDark = theme === "dark";
  return (
    <div onClick={() => setTheme(isDark?"light":"dark")} style={{ width:44,height:24,borderRadius:12,background:isDark?C.primary:C.border,border:`1px solid ${isDark?C.primary:C.borderLight}`,cursor:"pointer",position:"relative",transition:"all 0.3s",flexShrink:0 }}>
      <div style={{ width:18,height:18,borderRadius:"50%",background:isDark?C.bg:C.surface,position:"absolute",top:2,left:isDark?22:2,transition:"left 0.3s",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}>{isDark?"🌙":"☀️"}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label, C }) {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,boxShadow:C.shadow }}>
      <div style={{ color:C.textMuted,marginBottom:4 }}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{ color:p.color,fontWeight:600 }}>{p.name}: {p.value}</div>)}
    </div>
  );
}

// ── GP PORTFOLIO CARD (owner view) ────────────────────────────
function GPPortfolioCard({ gp, gpProjects, isSelected, onClick, C }) {
  const total = gpProjects.length;
  const onTrack = gpProjects.filter(p=>p.health==="on_track").length;
  const atRisk  = gpProjects.filter(p=>p.health==="at_risk").length;
  const late    = gpProjects.filter(p=>p.health==="late").length;
  const avgProgress = Math.round(gpProjects.reduce((s,p)=>s+p.progress,0)/total);

  return (
    <div onClick={onClick} style={{ background:isSelected?C.primaryDim:C.surface,border:`1px solid ${isSelected?C.primary+"60":late>0?C.red+"30":atRisk>0?C.yellow+"30":C.border}`,borderRadius:12,padding:"16px 18px",cursor:"pointer",transition:"all 0.2s",boxShadow:isSelected?`0 0 0 2px ${C.primaryGlow}`:C.shadowCard }}>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
        <div style={{ width:38,height:38,borderRadius:10,background:C.primaryDim,border:`1px solid ${C.primaryGlow}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.primaryText,fontFamily:"'DM Mono',monospace" }}>{gp.avatar}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13,fontWeight:600,color:C.text }}>{gp.name}</div>
          <div style={{ fontSize:10,color:C.textMuted }}>Project Manager · {total} projects</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:20,fontWeight:700,color:C.primaryText,fontFamily:"'DM Mono',monospace" }}>{avgProgress}%</div>
          <div style={{ fontSize:9,color:C.textDim }}>avg progress</div>
        </div>
      </div>

      {/* health pills */}
      <div style={{ display:"flex",gap:6,marginBottom:12 }}>
        {[{v:onTrack,c:C.green,bg:C.greenBg,l:"On Track"},{v:atRisk,c:C.yellow,bg:C.yellowBg,l:"At Risk"},{v:late,c:C.red,bg:C.redBg,l:"Late"}].map(h=>(
          h.v > 0 && <div key={h.l} style={{ padding:"2px 8px",borderRadius:20,background:h.bg,border:`1px solid ${h.c}30`,fontSize:10,color:h.c,fontWeight:600 }}>● {h.v} {h.l}</div>
        ))}
      </div>

      {/* project mini list */}
      <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
        {gpProjects.map(p=>{
          const hc = p.health==="on_track"?C.green:p.health==="at_risk"?C.yellow:C.red;
          return (
            <div key={p.id} style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:8,color:hc }}>●</span>
              <span style={{ fontSize:11,color:C.textMuted,flex:1 }}>{p.name}</span>
              <div style={{ width:60,height:4,background:C.border,borderRadius:2,overflow:"hidden" }}>
                <div style={{ width:`${p.progress}%`,height:"100%",background:hc,borderRadius:2 }} />
              </div>
              <span style={{ fontSize:10,color:hc,fontFamily:"'DM Mono',monospace",width:28 }}>{p.progress}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── GP SELECTOR (owner topbar) ────────────────────────────────
function GPSelector({ selectedGP, setSelectedGP, C }) {
  const [open, setOpen] = useState(false);
  const current = selectedGP ? gps.find(g=>g.id===selectedGP) : null;

  return (
    <div style={{ position:"relative" }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:8,background:selectedGP?C.primaryDim:C.surfaceAlt,border:`1px solid ${selectedGP?C.primaryGlow:C.border}`,cursor:"pointer",fontSize:12,color:selectedGP?C.primaryText:C.textMuted,fontWeight:selectedGP?600:400,transition:"all 0.15s",minWidth:160 }}>
        {current ? (
          <>
            <div style={{ width:22,height:22,borderRadius:6,background:C.primaryDim,border:`1px solid ${C.primaryGlow}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.primaryText }}>{current.avatar}</div>
            {current.name.split(" ")[0]}
          </>
        ) : (
          <><span style={{ fontSize:13 }}>◈</span> All GPs</>
        )}
        <span style={{ marginLeft:"auto",fontSize:10,color:C.textDim }}>▾</span>
      </div>

      {open && (
        <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",boxShadow:C.shadow,zIndex:100 }}>
          <div onClick={()=>{setSelectedGP(null);setOpen(false)}} className="hov" style={{ padding:"9px 12px",fontSize:12,color:C.textMuted,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontSize:13 }}>◈</span> All GPs
          </div>
          {gps.map(gp=>(
            <div key={gp.id} onClick={()=>{setSelectedGP(gp.id);setOpen(false)}} className="hov" style={{ padding:"9px 12px",fontSize:12,color:C.text,cursor:"pointer",display:"flex",alignItems:"center",gap:8,borderTop:`1px solid ${C.border}` }}>
              <div style={{ width:22,height:22,borderRadius:6,background:C.primaryDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.primaryText }}>{gp.avatar}</div>
              <div>
                <div style={{ fontWeight:600 }}>{gp.name}</div>
                <div style={{ fontSize:9,color:C.textDim }}>{gp.projectIds.length} projects</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── OWNER PORTFOLIO VIEW ─────────────────────────────────────
function OwnerPortfolioView({ selectedGP, C }) {
  const filteredGPs = selectedGP ? gps.filter(g=>g.id===selectedGP) : gps;

  // aggregate stats for filtered scope
  const scopeProjects = selectedGP
    ? projects.filter(p=>p.gpId===selectedGP)
    : projects;
  const onTrack = scopeProjects.filter(p=>p.health==="on_track").length;
  const atRisk  = scopeProjects.filter(p=>p.health==="at_risk").length;
  const late    = scopeProjects.filter(p=>p.health==="late").length;
  const avgProgress = Math.round(scopeProjects.reduce((s,p)=>s+p.progress,0)/scopeProjects.length);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>

      {/* Top KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12 }}>
        {[
          { label:"Total Projects", value:scopeProjects.length, color:C.primaryText },
          { label:"On Track",       value:onTrack,              color:C.green        },
          { label:"At Risk",        value:atRisk,               color:C.yellow       },
          { label:"Late",           value:late,                 color:late>0?C.red:C.textMuted },
          { label:"Avg Progress",   value:`${avgProgress}%`,    color:C.primaryText  },
        ].map((kpi,i)=>(
          <div key={i} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",borderTop:`3px solid ${kpi.color}`,boxShadow:C.shadowCard }}>
            <div style={{ fontSize:10,color:C.textMuted,fontWeight:500,marginBottom:6 }}>{kpi.label}</div>
            <div style={{ fontSize:24,fontWeight:700,color:kpi.color,fontFamily:"'DM Mono',monospace" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* GP Portfolio Cards */}
      <div>
        <div style={{ fontSize:13,fontWeight:600,color:C.text,marginBottom:12 }}>
          {selectedGP ? "GP Portfolio" : "All Project Managers"}
          <span style={{ fontSize:10,color:C.textMuted,fontWeight:400,marginLeft:8 }}>
            {selectedGP ? `Filtered · ${scopeProjects.length} projects` : `${gps.length} GPs · ${projects.length} projects`}
          </span>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14 }}>
          {filteredGPs.map(gp=>{
            const gpProjects = projects.filter(p=>p.gpId===gp.id);
            return <GPPortfolioCard key={gp.id} gp={gp} gpProjects={gpProjects} isSelected={false} onClick={()=>{}} C={C} />;
          })}
        </div>
      </div>

      {/* All projects table */}
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px",boxShadow:C.shadowCard }}>
        <div style={{ fontSize:13,fontWeight:600,color:C.text,marginBottom:14 }}>
          Project Overview
          {selectedGP && <span style={{ fontSize:10,color:C.primaryText,fontWeight:500,marginLeft:8,padding:"2px 8px",borderRadius:4,background:C.primaryDim }}>filtered by GP</span>}
        </div>
        {/* header */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 120px 80px 100px 120px 90px",gap:8,padding:"6px 12px",marginBottom:2 }}>
          {["Project","Client","Sprint","GP","Health","Progress"].map(h=>(
            <div key={h} style={{ fontSize:9,color:C.textDim,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em" }}>{h}</div>
          ))}
        </div>
        {scopeProjects.map(p=>{
          const gp = gps.find(g=>g.id===p.gpId);
          const hc = p.health==="on_track"?C.green:p.health==="at_risk"?C.yellow:C.red;
          const hLabel = p.health==="on_track"?"On Track":p.health==="at_risk"?"At Risk":"Late";
          return (
            <div key={p.id} className="hov" style={{ display:"grid",gridTemplateColumns:"1fr 120px 80px 100px 120px 90px",gap:8,padding:"10px 12px",borderRadius:8,cursor:"pointer",transition:"background 0.15s",alignItems:"center" }}>
              <div>
                <div style={{ fontSize:13,fontWeight:500,color:C.text }}>{p.name}</div>
                <div style={{ fontSize:10,color:C.textDim,fontFamily:"'DM Mono',monospace" }}>{p.repo}</div>
              </div>
              <span style={{ fontSize:12,color:C.textMuted }}>{p.client}</span>
              <span style={{ fontSize:11,color:C.textMuted,fontFamily:"'DM Mono',monospace" }}>{p.sprint}</span>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                <div style={{ width:22,height:22,borderRadius:6,background:C.primaryDim,border:`1px solid ${C.primaryGlow}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:C.primaryText }}>{gp?.avatar}</div>
                <span style={{ fontSize:11,color:C.textMuted }}>{gp?.name.split(" ")[0]}</span>
              </div>
              <span style={{ padding:"3px 10px",borderRadius:20,background:`${hc}15`,border:`1px solid ${hc}30`,fontSize:10,fontWeight:600,color:hc }}>● {hLabel}</span>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                <div style={{ flex:1,height:4,background:C.border,borderRadius:2,overflow:"hidden" }}>
                  <div style={{ width:`${p.progress}%`,height:"100%",background:hc,borderRadius:2 }} />
                </div>
                <span style={{ fontSize:10,color:hc,fontFamily:"'DM Mono',monospace",fontWeight:600,width:28 }}>{p.progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PROJECT DETAIL VIEW (shared by owner drill-down and GP) ───
function ProjectDetailView({ project, activeTab, setActiveTab, C, themedDevs, isDark }) {
  const [selectedDev, setSelectedDev] = useState(0);
  const statusConfig   = getStatusConfig(C);
  const prStatusConfig = getPRStatusConfig(C);
  const stalePRs = pullRequests.filter(p=>p.stale).length;

  return (
    <div style={{ flex:1,overflow:"auto",display:"flex",flexDirection:"column" }}>
      {/* topbar */}
      <div style={{ padding:"14px 28px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.surface,flexShrink:0 }}>
        <div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:18,fontWeight:700,color:C.text,letterSpacing:"-0.4px" }}>{project.name}</span>
            <span style={{ padding:"3px 10px",borderRadius:20,background:getHealthConfig(C)[project.health].bg,border:`1px solid ${getHealthConfig(C)[project.health].color}30`,fontSize:10,fontWeight:600,color:getHealthConfig(C)[project.health].color }}>● {getHealthConfig(C)[project.health].label}</span>
            <div style={{ display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:5,background:C.githubDim,border:`1px solid ${C.githubAccent}25`,fontSize:10,color:C.githubAccent }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              {project.repo}
            </div>
          </div>
          <div style={{ fontSize:12,color:C.textMuted,marginTop:2 }}>{project.client} · {project.sprint} · {project.daysLeft>0?`${project.daysLeft} days left`:"⚠ Overdue"}</div>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          {stalePRs > 0 && <div style={{ padding:"7px 12px",borderRadius:8,background:C.yellowBg,border:`1px solid ${C.yellow}40`,fontSize:11,color:C.yellow,fontWeight:600 }}>⚠ {stalePRs} stale PR</div>}
          <div style={{ padding:"7px 14px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,color:C.textMuted,cursor:"pointer",background:C.bg }}>Export Report</div>
          <div style={{ padding:"7px 14px",borderRadius:8,background:C.ghGrad,fontSize:12,color:"#fff",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="white"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            Sync GitHub
          </div>
          <div style={{ padding:"7px 16px",borderRadius:8,background:C.logoGrad,fontSize:12,color:"#fff",fontWeight:700,cursor:"pointer",boxShadow:`0 2px 12px ${C.primaryGlow}` }}>Sync Jira</div>
        </div>
      </div>

      {/* tabs */}
      <div style={{ display:"flex",borderBottom:`1px solid ${C.border}`,padding:"0 28px",background:C.surface,flexShrink:0 }}>
        {[{key:"overview",label:"Overview"},{key:"sprint",label:"Sprint"},{key:"developers",label:"Developers"},{key:"pullrequests",label:"Pull Requests"},{key:"backlog",label:"Backlog"}].map(tab=>(
          <div key={tab.key} className="tab-i" onClick={()=>setActiveTab(tab.key)} style={{ padding:"11px 18px",fontSize:13,cursor:"pointer",color:activeTab===tab.key?C.primaryText:C.textMuted,borderBottom:activeTab===tab.key?`2px solid ${C.primary}`:"2px solid transparent",fontWeight:activeTab===tab.key?600:400,transition:"all 0.15s",marginBottom:-1,display:"flex",alignItems:"center",gap:6 }}>
            {tab.label}
            {tab.key==="pullrequests"&&stalePRs>0&&<div style={{ width:14,height:14,borderRadius:"50%",background:C.yellow,fontSize:8,fontWeight:700,color:"#000",display:"flex",alignItems:"center",justifyContent:"center" }}>{stalePRs}</div>}
          </div>
        ))}
      </div>

      <div style={{ flex:1,padding:"24px 28px",overflow:"auto" }}>

        {/* OVERVIEW */}
        {activeTab==="overview"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr) 1px repeat(3,1fr)",gap:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",boxShadow:C.shadowCard }}>
              {[
                {label:"Cards",value:"115",sub:"total sprint",color:C.primaryText,src:"jira"},
                {label:"Completed",value:"67",sub:"58% done",color:C.green,src:"jira"},
                {label:"Points",value:"240",sub:"BE 144 · FE 96",color:C.purple,src:"jira"},
                {label:"Progress",value:"78%",sub:"on track",color:C.primaryText,src:"jira"},
                null,
                {label:"Open PRs",value:"2",sub:"4 merged",color:C.github,src:"github"},
                {label:"Stale PRs",value:`${stalePRs}`,sub:"needs attention",color:stalePRs>0?C.yellow:C.green,src:"github"},
                {label:"Avg Cycle",value:"22h",sub:"open→merge",color:C.blue,src:"github"},
              ].map((kpi,i)=>{
                if(kpi===null) return <div key={i} style={{ background:C.border,width:1 }} />;
                return (
                  <div key={i} style={{ padding:"16px 18px",borderRight:`1px solid ${C.border}` }}>
                    <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:6 }}>
                      <span style={{ fontSize:10,color:C.textMuted,fontWeight:500 }}>{kpi.label}</span>
                      {kpi.src==="github"&&<GhBadge C={C} />}
                    </div>
                    <div style={{ fontSize:24,fontWeight:700,color:kpi.color,letterSpacing:"-0.5px",fontFamily:"'DM Mono',monospace" }}>{kpi.value}</div>
                    <div style={{ fontSize:10,color:C.textDim,marginTop:3 }}>{kpi.sub}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 190px 190px",gap:14 }}>
              <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",boxShadow:C.shadowCard }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:14 }}>
                  <div><div style={{ fontSize:13,fontWeight:600,color:C.text }}>Sprint Burndown</div><div style={{ fontSize:11,color:C.textMuted }}>Story points</div></div>
                  <div style={{ display:"flex",gap:12 }}>
                    {[{c:C.textDim,l:"Baseline"},{c:C.primary,l:"Actual"}].map(leg=>(
                      <div key={leg.l} style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.textMuted }}>
                        <div style={{ width:14,height:2,background:leg.c }} />{leg.l}
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={148}>
                  <LineChart data={burndownData} margin={{top:4,right:4,bottom:0,left:-20}}>
                    <XAxis dataKey="sprint" tick={{fill:C.textDim,fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:C.textDim,fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip C={C}/>}/>
                    <Line type="monotone" dataKey="baseline" stroke={C.textDim} strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="Baseline"/>
                    <Line type="monotone" dataKey="actual" stroke={C.primary} strokeWidth={2.5} dot={{fill:C.primary,r:3,strokeWidth:0}} name="Actual"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {[{data:progressData,label:"Progress",center:"78%"},{data:[{name:"Backend",value:144,color:"#0097A7"},{name:"Frontend",value:96,color:"#7C3AED"}],label:"Points",center:"240"}].map(chart=>(
                <div key={chart.label} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 16px",boxShadow:C.shadowCard }}>
                  <div style={{ fontSize:13,fontWeight:600,color:C.text }}>{chart.label}</div>
                  <div style={{ fontSize:11,color:C.textMuted,marginBottom:10 }}>By {chart.label==="Progress"?"status":"type"}</div>
                  <div style={{ position:"relative",height:95 }}>
                    <ResponsiveContainer width="100%" height={95}>
                      <PieChart><Pie data={chart.data} cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={2} dataKey="value">{chart.data.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart>
                    </ResponsiveContainer>
                    <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center" }}>
                      <div style={{ fontSize:14,fontWeight:700,color:C.text,fontFamily:"'DM Mono',monospace" }}>{chart.center}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:4,marginTop:6 }}>
                    {chart.data.map(d=>(
                      <div key={d.name} style={{ display:"flex",justifyContent:"space-between" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:5 }}><div style={{ width:6,height:6,borderRadius:"50%",background:d.color }}/><span style={{ fontSize:10,color:C.textMuted }}>{d.name}</span></div>
                        <span style={{ fontSize:10,color:d.color,fontWeight:700,fontFamily:"'DM Mono',monospace" }}>{d.value}{chart.label==="Progress"?"%":"pts"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize:13,fontWeight:600,color:C.text,marginBottom:12 }}>Team Performance <span style={{ fontSize:10,color:C.textMuted,fontWeight:400,marginLeft:6 }}>Jira + GitHub</span></div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
                {themedDevs.map((dev,i)=>(
                  <DevCard key={dev.id} dev={dev} devColor={dev._color} selected={selectedDev===i} onClick={()=>{setSelectedDev(i);setActiveTab("developers");}} C={C}/>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SPRINT */}
        {activeTab==="sprint"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14 }}>
              {[{label:"Total Cards",value:"115",color:C.text},{label:"Completed",value:"67",color:C.green},{label:"Remaining",value:"48",color:C.yellow},{label:"Completion",value:"58%",color:C.primaryText}].map((kpi,i)=>(
                <div key={i} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",boxShadow:C.shadowCard }}>
                  <div style={{ fontSize:11,color:C.textMuted }}>{kpi.label}</div>
                  <div style={{ fontSize:26,fontWeight:700,color:kpi.color,marginTop:6,fontFamily:"'DM Mono',monospace" }}>{kpi.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px",boxShadow:C.shadowCard }}>
              <div style={{ fontSize:13,fontWeight:600,color:C.text,marginBottom:14 }}>Cards in Sprint</div>
              <div style={{ display:"grid",gridTemplateColumns:"64px 1fr 40px 28px 70px 85px 90px",gap:8,padding:"6px 12px",marginBottom:2 }}>
                {["Key","Title","Dev","Pts","PR #","PR Status","Status"].map(h=>(
                  <div key={h} style={{ fontSize:9,color:C.textDim,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em" }}>{h}</div>
                ))}
              </div>
              {cards.map(card=>{
                const s=statusConfig[card.status];
                const dev=themedDevs.find(d=>d.avatar===card.dev);
                const pr=pullRequests.find(p=>p.number===card.prNumber);
                const prs=pr?getPRStatusConfig(C)[pr.status]:null;
                return (
                  <div key={card.id} className="hov" style={{ display:"grid",gridTemplateColumns:"64px 1fr 40px 28px 70px 85px 90px",gap:8,padding:"10px 12px",borderRadius:8,cursor:"pointer",transition:"background 0.15s",alignItems:"center" }}>
                    <span style={{ fontSize:10,color:C.textDim,fontFamily:"'DM Mono',monospace" }}>{card.id}</span>
                    <span style={{ fontSize:13,color:C.text }}>{card.title}</span>
                    <div style={{ width:26,height:26,borderRadius:7,background:`${dev?._color}15`,border:`1px solid ${dev?._color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:dev?._color }}>{card.dev}</div>
                    <span style={{ fontSize:10,color:C.textMuted,fontFamily:"'DM Mono',monospace" }}>{card.pts}</span>
                    {pr?<span style={{ fontSize:10,color:C.githubAccent,fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",gap:2 }}><svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>#{pr.number}</span>:<span style={{ fontSize:10,color:C.textDim }}>—</span>}
                    {prs?<span style={{ padding:"2px 8px",borderRadius:5,background:prs.bg,color:prs.color,fontSize:10,fontWeight:600,textAlign:"center" }}>{prs.label}</span>:<span/>}
                    <span style={{ padding:"3px 8px",borderRadius:5,background:s.bg,color:s.color,fontSize:10,fontWeight:600,textAlign:"center" }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DEVELOPERS */}
        {activeTab==="developers"&&(
          <div style={{ display:"flex",gap:20 }}>
            <div style={{ display:"flex",flexDirection:"column",gap:10,width:240,flexShrink:0 }}>
              {themedDevs.map((dev,i)=>(
                <DevCard key={dev.id} dev={dev} devColor={dev._color} selected={selectedDev===i} onClick={()=>setSelectedDev(i)} C={C}/>
              ))}
            </div>
            <div style={{ flex:1,display:"flex",flexDirection:"column",gap:14 }}>
              {(()=>{
                const dev=themedDevs[selectedDev];
                return (
                  <>
                    <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px",boxShadow:C.shadowCard }}>
                      <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:18 }}>
                        <div style={{ width:48,height:48,borderRadius:12,background:`${dev._color}15`,border:`1px solid ${dev._color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:dev._color,fontFamily:"'DM Mono',monospace" }}>{dev.avatar}</div>
                        <div><div style={{ fontSize:17,fontWeight:700,color:C.text }}>{dev.name}</div><div style={{ fontSize:12,color:dev._color }}>{dev.role} · <span style={{ color:C.githubAccent }}>@{dev.githubLogin}</span></div></div>
                        <div style={{ marginLeft:"auto",display:"flex",gap:8,alignItems:"center" }}><ScoreStars score={dev.score} C={C}/><span style={{ fontSize:18,fontWeight:800,color:dev._color,fontFamily:"'DM Mono',monospace" }}>{dev.score}</span></div>
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10 }}>
                        {[
                          {l:"Delivery",v:`${dev.deliveryRate}%`,c:C.green,src:"jira"},
                          {l:"Rework",v:`${dev.reworkRate}%`,c:dev.reworkRate>20?C.red:C.yellow,src:"jira"},
                          {l:"Jira Pts",v:dev.jiraPoints,c:C.primaryText,src:"jira"},
                          {l:"PRs Merged",v:dev.mergedPRs,c:C.purple,src:"github"},
                          {l:"Commits",v:dev.commits,c:C.github,src:"github"},
                          {l:"Cycle Time",v:`${dev.avgCycleTime}h`,c:dev.avgCycleTime>48?C.red:dev.avgCycleTime>24?C.yellow:C.green,src:"github"},
                          {l:"Reviews",v:dev.approvalsGiven,c:C.blue,src:"github"},
                        ].map(m=>(
                          <div key={m.l} style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px" }}>
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                              <div style={{ fontSize:9,color:C.textMuted,fontWeight:500 }}>{m.l}</div>
                              {m.src==="github"&&<div style={{ width:6,height:6,borderRadius:"50%",background:C.githubAccent,opacity:0.5 }}/>}
                            </div>
                            <div style={{ fontSize:18,fontWeight:700,color:m.c,fontFamily:"'DM Mono',monospace" }}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 22px",boxShadow:C.shadowCard }}>
                      <div style={{ fontSize:12,fontWeight:600,color:C.text,marginBottom:10,display:"flex",alignItems:"center",gap:8 }}>Pull Requests <GhBadge C={C}/>{dev.stalePRs>0&&<span style={{ fontSize:10,color:C.yellow,fontWeight:600 }}>⚠ {dev.stalePRs} stale</span>}</div>
                      {pullRequests.filter(pr=>pr.author===dev.avatar).map(pr=>{
                        const s=prStatusConfig[pr.status];
                        return (
                          <div key={pr.id} className="hov" style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:7,cursor:"pointer",transition:"background 0.15s" }}>
                            <span style={{ fontSize:10,color:C.textDim,fontFamily:"'DM Mono',monospace",width:36 }}>#{pr.number}</span>
                            <div style={{ flex:1,minWidth:0 }}><div style={{ fontSize:12,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{pr.title}</div></div>
                            <span style={{ fontSize:10,color:C.primaryText,fontFamily:"'DM Mono',monospace",background:C.primaryDim,padding:"1px 6px",borderRadius:4 }}>{pr.jiraKey}</span>
                            <span style={{ fontSize:10,color:pr.cycleTime>48?C.red:pr.cycleTime>24?C.yellow:C.green,fontFamily:"'DM Mono',monospace",width:32 }}>{pr.cycleTime}h</span>
                            <span style={{ padding:"2px 8px",borderRadius:5,background:s.bg,color:s.color,fontSize:10,fontWeight:600,width:80,textAlign:"center" }}>{s.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* PULL REQUESTS */}
        {activeTab==="pullrequests"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14 }}>
              {[{label:"Total PRs",value:pullRequests.length,color:C.primaryText},{label:"Merged",value:pullRequests.filter(p=>p.status==="merged").length,color:C.purple},{label:"Open / In Review",value:pullRequests.filter(p=>p.status==="open"||p.status==="in_review").length,color:C.blue},{label:"Stale (>24h)",value:stalePRs,color:stalePRs>0?C.yellow:C.green}].map((kpi,i)=>(
                <div key={i} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",borderTop:`3px solid ${kpi.color}`,boxShadow:C.shadowCard }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}><div style={{ fontSize:11,color:C.textMuted,fontWeight:500 }}>{kpi.label}</div><GhBadge C={C}/></div>
                  <div style={{ fontSize:28,fontWeight:700,color:kpi.color,marginTop:6,fontFamily:"'DM Mono',monospace" }}>{kpi.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px",boxShadow:C.shadowCard }}>
              <div style={{ fontSize:13,fontWeight:600,color:C.text,marginBottom:14 }}>Pull Requests <span style={{ fontSize:10,color:C.textMuted,fontWeight:400,marginLeft:6 }}>{project.repo}</span></div>
              {pullRequests.map(pr=>{
                const s=prStatusConfig[pr.status];
                const dev=themedDevs.find(d=>d.avatar===pr.author);
                return (
                  <div key={pr.id} className="hov" style={{ display:"grid",gridTemplateColumns:"60px 1fr 80px 80px 70px 90px 80px",gap:8,padding:"10px 12px",borderRadius:8,cursor:"pointer",transition:"background 0.15s",background:pr.stale?`${C.yellow}08`:"transparent",border:`1px solid ${pr.stale?C.yellow+"25":"transparent"}`,marginBottom:2,alignItems:"center" }}>
                    <span style={{ fontSize:11,color:C.textMuted,fontFamily:"'DM Mono',monospace" }}>#{pr.number}</span>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12,color:C.text,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{pr.title}</div>
                      <div style={{ fontSize:10,color:C.textDim,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{pr.branch}</div>
                    </div>
                    <div style={{ width:26,height:26,borderRadius:7,background:`${dev?._color}15`,border:`1px solid ${dev?._color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:dev?._color }}>{pr.author}</div>
                    <span style={{ fontSize:10,color:C.primaryText,fontWeight:600,fontFamily:"'DM Mono',monospace",background:C.primaryDim,padding:"2px 6px",borderRadius:4 }}>{pr.jiraKey}</span>
                    <span style={{ fontSize:11,color:pr.cycleTime>48?C.red:pr.cycleTime>24?C.yellow:C.green,fontFamily:"'DM Mono',monospace",fontWeight:600 }}>{pr.cycleTime}h</span>
                    <span style={{ padding:"3px 8px",borderRadius:5,background:s.bg,color:s.color,fontSize:10,fontWeight:600,textAlign:"center" }}>{s.label}</span>
                    <div>{pr.stale&&<span style={{ fontSize:10,color:C.yellow,fontWeight:600 }}>⚠ Stale</span>}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px",boxShadow:C.shadowCard }}>
              <div style={{ fontSize:13,fontWeight:600,color:C.text,marginBottom:16 }}>Commit Activity <span style={{ fontSize:10,color:C.textMuted,fontWeight:400 }}>— last 7 days</span></div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14 }}>
                {themedDevs.map(dev=>{
                  const data=dev.weeklyCommits.map((c,i)=>({day:["M","T","W","T","F","S","S"][i],commits:c}));
                  return (
                    <div key={dev.id} style={{ background:C.surfaceAlt,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}` }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                        <div style={{ width:24,height:24,borderRadius:6,background:`${dev._color}18`,border:`1px solid ${dev._color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:dev._color }}>{dev.avatar}</div>
                        <div><div style={{ fontSize:11,fontWeight:600,color:C.text }}>{dev.name.split(" ")[0]}</div><div style={{ fontSize:9,color:C.textDim }}>{dev.commits} commits</div></div>
                      </div>
                      <ResponsiveContainer width="100%" height={44}>
                        <BarChart data={data} margin={{top:0,right:0,left:0,bottom:0}} barSize={7}>
                          <Bar dataKey="commits" fill={dev._color} radius={[2,2,0,0]} opacity={0.85}/>
                          <XAxis dataKey="day" tick={{fill:C.textDim,fontSize:8}} axisLine={false} tickLine={false}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* BACKLOG */}
        {activeTab==="backlog"&&(
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px",boxShadow:C.shadowCard }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontSize:13,fontWeight:600,color:C.text }}>Backlog</div>
              <span style={{ padding:"3px 10px",borderRadius:20,background:C.primaryDim,border:`1px solid ${C.primaryGlow}`,fontSize:11,color:C.primaryText,fontWeight:600 }}>45 cards</span>
            </div>
            {[{epic:"Authentication",cards:["Login with SSO","Two-factor setup","Session management"]},{epic:"Payments",cards:["Recurring billing","Invoice generation","Refund flow"]},{epic:"Notifications",cards:["Push notification center","Email digest","In-app alerts"]}].map((group,gi)=>(
              <div key={gi} style={{ marginBottom:14 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:C.surfaceAlt,borderRadius:8,marginBottom:3,border:`1px solid ${C.border}` }}>
                  <div style={{ width:6,height:6,borderRadius:"50%",background:C.primary }}/>
                  <span style={{ fontSize:12,fontWeight:600,color:C.text }}>{group.epic}</span>
                  <span style={{ fontSize:10,color:C.textDim }}>{group.cards.length} cards</span>
                </div>
                {group.cards.map((c,ci)=>(
                  <div key={ci} className="hov" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px 9px 28px",borderRadius:8,cursor:"pointer",transition:"background 0.15s" }}>
                    <span style={{ fontSize:12,color:C.textMuted }}>{c}</span>
                    <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                      <span style={{ fontSize:10,color:C.textDim,fontFamily:"'DM Mono',monospace" }}>5 pts</span>
                      <span style={{ padding:"2px 8px",borderRadius:4,background:C.surfaceAlt,border:`1px solid ${C.border}`,color:C.textMuted,fontSize:10,fontWeight:600 }}>To Do</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────
export default function SpravioDashboard() {
  const [theme, setTheme] = useState("light");
  const [role, setRole] = useState("owner");           // "owner" | "gp"
  const [activeGP, setActiveGP] = useState("gp1");     // which GP is logged in (GP view)
  const [selectedGP, setSelectedGP] = useState(null);  // owner filter
  const [activeProject, setActiveProject] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [ownerView, setOwnerView] = useState("portfolio"); // "portfolio" | "project"

  const C = THEMES[theme];
  const isDark = theme === "dark";
  const devColors = getDevColors(isDark);
  const themedDevs = developers.map((d,i)=>({...d,_color:devColors[i]}));

  // projects visible to the current user
  const visibleProjects = role === "gp"
    ? projects.filter(p => p.gpId === activeGP)
    : selectedGP
      ? projects.filter(p => p.gpId === selectedGP)
      : projects;

  const currentProject = visibleProjects[activeProject] ?? visibleProjects[0];
  const currentGP = gps.find(g=>g.id===activeGP);

  return (
    <div style={{ background:C.bg,minHeight:"100vh",fontFamily:"'DM Sans',system-ui,sans-serif",color:C.text,display:"flex",overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
        .hov:hover{background:${C.surfaceHover}!important;}
        .tab-i:hover{color:${C.text}!important;}
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width:220,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0 }}>

        {/* Logo + theme */}
        <div style={{ padding:"18px 20px 16px",borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:28,height:28,borderRadius:8,background:C.logoGrad,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 8px ${C.primaryGlow}` }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10L6 4L9 7L12 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="3" r="1.5" fill="white"/></svg>
              </div>
              <span style={{ fontSize:16,fontWeight:700,color:C.text,letterSpacing:"-0.3px" }}>Spravio</span>
            </div>
            <ThemeToggle theme={theme} setTheme={setTheme} C={C}/>
          </div>
        </div>

        {/* Role switcher (demo only) */}
        <div style={{ padding:"10px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:4 }}>
          {[{r:"owner",l:"Owner"},{r:"gp",l:"GP View"}].map(item=>(
            <div key={item.r} onClick={()=>{setRole(item.r);setActiveProject(0);setOwnerView("portfolio");}} style={{ flex:1,padding:"5px 0",borderRadius:7,fontSize:11,fontWeight:600,textAlign:"center",cursor:"pointer",background:role===item.r?C.primary:C.surfaceAlt,color:role===item.r?(isDark?C.bg:"#fff"):C.textMuted,border:`1px solid ${role===item.r?C.primary:C.border}`,transition:"all 0.2s" }}>
              {item.l}
            </div>
          ))}
        </div>

        {/* GP switcher (only in GP view) */}
        {role==="gp"&&(
          <div style={{ padding:"8px 12px",borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontSize:9,color:C.textDim,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6,paddingLeft:2 }}>Logged in as</div>
            <div style={{ display:"flex",gap:4 }}>
              {gps.map(gp=>(
                <div key={gp.id} onClick={()=>{setActiveGP(gp.id);setActiveProject(0);}} style={{ flex:1,padding:"6px 4px",borderRadius:7,cursor:"pointer",textAlign:"center",background:activeGP===gp.id?C.primaryDim:C.surfaceAlt,border:`1px solid ${activeGP===gp.id?C.primaryGlow:C.border}`,transition:"all 0.15s" }}>
                  <div style={{ fontSize:10,fontWeight:700,color:activeGP===gp.id?C.primaryText:C.textMuted }}>{gp.avatar}</div>
                  <div style={{ fontSize:9,color:activeGP===gp.id?C.primaryText:C.textDim }}>{gp.name.split(" ")[0]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding:"12px 10px",flex:1,overflow:"auto" }}>
          {/* Owner nav */}
          {role==="owner"&&(
            <>
              <div style={{ fontSize:9,color:C.textDim,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",padding:"0 10px 8px" }}>Workspace</div>
              <div className="hov" onClick={()=>setOwnerView("portfolio")} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,marginBottom:2,cursor:"pointer",transition:"all 0.15s",background:ownerView==="portfolio"?C.primaryDim:"transparent",color:ownerView==="portfolio"?C.primaryText:C.textMuted,fontSize:13,fontWeight:ownerView==="portfolio"?600:400,border:`1px solid ${ownerView==="portfolio"?C.primaryGlow:"transparent"}` }}>
                <span style={{ fontSize:14 }}>⊞</span> Portfolio
              </div>
            </>
          )}

          <div style={{ fontSize:9,color:C.textDim,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",padding:"12px 10px 8px" }}>
            {role==="gp"?"My Projects":"Projects"}
          </div>
          {visibleProjects.map((p,i)=>{
            const hc=p.health==="on_track"?C.green:p.health==="at_risk"?C.yellow:C.red;
            const gpData = role==="owner" ? gps.find(g=>g.id===p.gpId) : null;
            return (
              <div key={p.id} className="hov" onClick={()=>{setActiveProject(i);if(role==="owner")setOwnerView("project");}} style={{ padding:"8px 10px",borderRadius:8,marginBottom:3,cursor:"pointer",transition:"all 0.15s",background:(role==="owner"?ownerView==="project":true)&&activeProject===i?C.primaryDim:"transparent",border:`1px solid ${(role==="owner"?ownerView==="project":true)&&activeProject===i?C.primaryGlow:"transparent"}` }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <span style={{ fontSize:12,fontWeight:(role==="owner"?ownerView==="project":true)&&activeProject===i?600:400,color:(role==="owner"?ownerView==="project":true)&&activeProject===i?C.text:C.textMuted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:140 }}>{p.name}</span>
                  <span style={{ fontSize:8,color:hc }}>●</span>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",marginTop:2 }}>
                  <div style={{ fontSize:10,color:C.textDim }}>{p.client}</div>
                  {gpData&&<div style={{ fontSize:9,color:C.textDim }}>{gpData.avatar}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* User footer */}
        <div style={{ padding:"12px 16px",borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:28,height:28,borderRadius:8,background:C.primaryDim,border:`1px solid ${C.primaryGlow}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.primaryText }}>
              {role==="owner"?"OW":currentGP?.avatar}
            </div>
            <div>
              <div style={{ fontSize:11,fontWeight:600,color:C.text }}>{role==="owner"?"Agency Owner":currentGP?.name}</div>
              <div style={{ fontSize:10,color:C.textMuted }}>{role==="owner"?"All projects":currentGP?.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      {role==="owner"&&ownerView==="portfolio" ? (
        <div style={{ flex:1,overflow:"auto",display:"flex",flexDirection:"column" }}>
          {/* Owner portfolio topbar */}
          <div style={{ padding:"14px 28px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.surface,flexShrink:0 }}>
            <div>
              <div style={{ fontSize:18,fontWeight:700,color:C.text,letterSpacing:"-0.4px" }}>Portfolio Overview</div>
              <div style={{ fontSize:12,color:C.textMuted,marginTop:2 }}>All projects across your agency</div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ fontSize:11,color:C.textMuted,fontWeight:500 }}>Filter by GP</div>
              <GPSelector selectedGP={selectedGP} setSelectedGP={setSelectedGP} C={C}/>
              <div style={{ padding:"7px 14px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,color:C.textMuted,cursor:"pointer",background:C.bg }}>
                Export All Reports
              </div>
            </div>
          </div>
          <div style={{ flex:1,padding:"24px 28px",overflow:"auto" }}>
            <OwnerPortfolioView selectedGP={selectedGP} C={C}/>
          </div>
        </div>
      ) : (
        <ProjectDetailView
          project={currentProject}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          C={C}
          themedDevs={themedDevs}
          isDark={isDark}
        />
      )}
    </div>
  );
}
