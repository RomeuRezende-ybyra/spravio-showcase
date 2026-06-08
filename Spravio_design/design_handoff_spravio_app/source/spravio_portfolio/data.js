// Fake data — consultoria BR realista
// Três presets: small (5 projetos), medium (11), large (22)

const CLIENTS_POOL = [
  { name: "Bradesco Seguros",    sector: "Financeiro" },
  { name: "Vivo Empresas",       sector: "Telecom" },
  { name: "Magazine Luiza",      sector: "Varejo" },
  { name: "Ambev",               sector: "FMCG" },
  { name: "Natura &Co",          sector: "Cosméticos" },
  { name: "Localiza",            sector: "Mobilidade" },
  { name: "Petrobras",           sector: "Energia" },
  { name: "Itaú Asset",          sector: "Financeiro" },
  { name: "Rede D'Or",           sector: "Saúde" },
  { name: "XP Inc",              sector: "Financeiro" },
  { name: "Santander BR",        sector: "Financeiro" },
  { name: "Raia Drogasil",       sector: "Saúde" },
  { name: "B3",                  sector: "Financeiro" },
  { name: "Eletrobras",          sector: "Energia" },
  { name: "Gerdau",              sector: "Indústria" },
  { name: "Suzano",              sector: "Indústria" },
  { name: "JBS",                 sector: "FMCG" },
  { name: "Totvs",               sector: "Software" },
  { name: "Banco Inter",         sector: "Financeiro" },
  { name: "Hapvida",             sector: "Saúde" },
  { name: "BRF",                 sector: "FMCG" },
  { name: "Cielo",               sector: "Financeiro" },
];

const PROJECT_NAMES = [
  "Portal do Corretor v3",
  "App B2B Checkout",
  "Data Platform — Lakehouse",
  "Jornada de Crédito Pessoa Física",
  "Anti-fraude ML Pipeline",
  "PDV Mobile — Migração Flutter",
  "Core Banking API",
  "Central de Atendimento IA",
  "Painel do Gestor — Refresh",
  "Onboarding Digital PJ",
  "CRM Força de Vendas",
  "Marketplace Interno",
  "Integração Open Finance",
  "Plataforma de E-commerce",
  "Dashboard Comercial",
  "Gateway de Pagamentos",
  "App do Cliente — v2",
  "Portal de Parceiros",
  "Sistema de Gestão Hospitalar",
  "Módulo Fiscal Integrado",
  "API Gateway Multi-tenant",
  "Intranet Corporativa",
];

const KEYS = ["PORT","B2B","DATA","CRED","ML","PDV","CORE","IA","PANEL","ONB","CRM","MKT","OPF","ECOM","DASH","GTW","APPC","PTR","HOSP","FISC","GATW","INTR"];

const DEV_POOL = [
  { name: "Mariana Carvalho",   role: "Backend",   rate: 180, avatar: "MC", color: "#D97757" },
  { name: "Rafael Okamoto",     role: "Frontend",  rate: 165, avatar: "RO", color: "#7B9E89" },
  { name: "Beatriz Nogueira",   role: "Fullstack", rate: 220, avatar: "BN", color: "#B28DBE" },
  { name: "Gustavo Martins",    role: "Backend",   rate: 175, avatar: "GM", color: "#D9A84E" },
  { name: "Isabela Prado",      role: "Mobile",    rate: 190, avatar: "IP", color: "#5E8CA8" },
  { name: "Thiago Ribeiro",     role: "Tech Lead", rate: 260, avatar: "TR", color: "#C46A5E" },
  { name: "Camila Vasconcelos", role: "QA",        rate: 145, avatar: "CV", color: "#8B9D5C" },
  { name: "André Figueiredo",   role: "DevOps",    rate: 215, avatar: "AF", color: "#9B7B9E" },
  { name: "Luana Barros",       role: "Product",   rate: 195, avatar: "LB", color: "#D97757" },
  { name: "Pedro Almeida",      role: "Frontend",  rate: 160, avatar: "PA", color: "#7B9E89" },
  { name: "Fernanda Lopes",     role: "Backend",   rate: 185, avatar: "FL", color: "#B28DBE" },
  { name: "Diego Salvador",     role: "Fullstack", rate: 205, avatar: "DS", color: "#D9A84E" },
  { name: "Juliana Macedo",     role: "Mobile",    rate: 180, avatar: "JM", color: "#5E8CA8" },
  { name: "Vinicius Teixeira",  role: "Backend",   rate: 170, avatar: "VT", color: "#C46A5E" },
  { name: "Aline Cordeiro",     role: "Design",    rate: 175, avatar: "AC", color: "#8B9D5C" },
  { name: "Rodrigo Siqueira",   role: "Backend",   rate: 200, avatar: "RS", color: "#9B7B9E" },
];

const GP_POOL = [
  { name: "Renata Siqueira",   avatar: "RS" },
  { name: "Felipe Andrade",    avatar: "FA" },
  { name: "Patrícia Moraes",   avatar: "PM" },
  { name: "Eduardo Campos",    avatar: "EC" },
  { name: "Carolina Freitas",  avatar: "CF" },
];

// Deterministic RNG so layout doesn't jump between reloads
function mulberry32(seed) {
  return function() {
    var t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function pickN(rng, arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function generateSparkline(rng, points = 14, trend = 0) {
  let v = 50 + rng() * 30;
  const out = [];
  for (let i = 0; i < points; i++) {
    v += (rng() - 0.5 + trend * 0.3) * 12;
    v = Math.max(5, Math.min(95, v));
    out.push(Math.round(v));
  }
  return out;
}

function generateBurndown(rng, total = 80, days = 14, onTrack = true) {
  const ideal = [];
  const actual = [];
  for (let i = 0; i <= days; i++) {
    ideal.push(Math.round(total - (total * i / days)));
    const noise = (rng() - 0.5) * 8;
    const lag = onTrack ? -2 : 5;
    const proj = Math.max(0, total - (total * i / days) + lag + noise);
    actual.push(Math.round(proj));
  }
  return { ideal, actual, total, days };
}

function makeProject(rng, i, client, pmName) {
  const name = PROJECT_NAMES[i % PROJECT_NAMES.length];
  const key = KEYS[i % KEYS.length] + (i >= KEYS.length ? "2" : "");
  const source = pick(rng, ["jira","azure","github","trello","linear"]);

  // Budget & consumption
  const budgetK = [180, 240, 320, 420, 540, 680, 820, 1200][Math.floor(rng() * 8)];
  const consumedPct = 20 + rng() * 78;
  const consumed = Math.round(budgetK * consumedPct / 100);

  // Health: derived from consumedPct + velocity + stale PRs
  let healthScore = 100;
  if (consumedPct > 85) healthScore -= 35;
  else if (consumedPct > 70) healthScore -= 15;

  // Sprint
  const sprintNum = 6 + Math.floor(rng() * 18);
  const sprintTotalPoints = 34 + Math.floor(rng() * 48);
  const sprintCompleted = Math.floor(sprintTotalPoints * (0.2 + rng() * 0.75));
  const sprintDay = 3 + Math.floor(rng() * 11);
  const sprintLength = 14;

  // Forecast
  const onTimeProb = Math.max(15, Math.min(95, Math.round(40 + (100 - consumedPct) * 0.6 + (rng() - 0.5) * 30)));
  if (onTimeProb < 40) healthScore -= 25;
  else if (onTimeProb < 65) healthScore -= 10;

  // Stale PRs
  const prsOpen = Math.floor(rng() * 12);
  const prsStale = Math.floor(prsOpen * rng() * 0.6);
  const prsCritical = Math.floor(prsStale * rng() * 0.5);
  if (prsCritical >= 2) healthScore -= 20;
  else if (prsStale >= 3) healthScore -= 10;

  healthScore = Math.max(10, Math.min(100, healthScore));
  const health = healthScore >= 70 ? "green" : healthScore >= 45 ? "yellow" : "red";

  // Developers
  const teamSize = 3 + Math.floor(rng() * 6);
  const team = pickN(rng, DEV_POOL, teamSize);

  // Dev score (avg)
  const avgDevScore = 2.8 + rng() * 2;

  // Issues breakdown
  const issuesTodo = Math.floor(rng() * 28);
  const issuesInProgress = 4 + Math.floor(rng() * 12);
  const issuesTest = Math.floor(rng() * 9);
  const issuesUAT = Math.floor(rng() * 5);
  const issuesDone = 40 + Math.floor(rng() * 140);

  // Velocity trend
  const velocityPoints = 10 + Math.floor(rng() * 45);
  const velocityTrend = pick(rng, ["up","up","stable","stable","down"]);

  // Sparkline for velocity history
  const velocitySpark = generateSparkline(rng, 8, velocityTrend === "up" ? 0.2 : velocityTrend === "down" ? -0.2 : 0);
  const burndown = generateBurndown(rng, sprintTotalPoints, sprintLength, onTimeProb > 60);

  // Dates
  const startMonthsAgo = 2 + Math.floor(rng() * 8);
  const deadlineMonthsAway = 1 + Math.floor(rng() * 6);

  // Recent activity — last 14 days, 0-5 intensity
  const activity = Array.from({length: 14}, () => Math.floor(rng() * 6));

  return {
    id: `prj_${key.toLowerCase()}_${i}`,
    key,
    name,
    client: client.name,
    clientSector: client.sector,
    source,
    pm: pmName,
    healthScore,
    health,
    budgetK,
    consumed,
    consumedPct: Math.round(consumedPct),
    sprintNum,
    sprintTotalPoints,
    sprintCompleted,
    sprintDay,
    sprintLength,
    onTimeProb,
    prsOpen,
    prsStale,
    prsCritical,
    teamSize,
    team,
    avgDevScore: Math.round(avgDevScore * 10) / 10,
    issuesTodo,
    issuesInProgress,
    issuesTest,
    issuesUAT,
    issuesDone,
    velocityPoints,
    velocityTrend,
    velocitySpark,
    burndown,
    startMonthsAgo,
    deadlineMonthsAway,
    activity,
    lastSyncMin: Math.floor(rng() * 58),
  };
}

function buildDataset(preset) {
  const counts = { small: 5, medium: 11, large: 22 };
  const n = counts[preset] || 11;
  const rng = mulberry32(preset === "small" ? 42 : preset === "large" ? 7777 : 1337);

  const projects = [];
  const clientsUsed = pickN(rng, CLIENTS_POOL, Math.min(n, CLIENTS_POOL.length));
  for (let i = 0; i < n; i++) {
    const client = clientsUsed[i % clientsUsed.length];
    const pm = pick(rng, GP_POOL);
    projects.push(makeProject(rng, i, client, pm.name));
  }

  // Aggregate KPIs
  const totalBudget = projects.reduce((s, p) => s + p.budgetK, 0);
  const totalConsumed = projects.reduce((s, p) => s + p.consumed, 0);
  const avgHealth = Math.round(projects.reduce((s, p) => s + p.healthScore, 0) / projects.length);
  const projectsAtRisk = projects.filter(p => p.health !== "green").length;
  const totalStalePRs = projects.reduce((s, p) => s + p.prsStale, 0);
  const criticalPRs = projects.reduce((s, p) => s + p.prsCritical, 0);
  const totalIssuesActive = projects.reduce((s, p) => s + p.issuesInProgress + p.issuesTest + p.issuesUAT, 0);
  const avgOnTime = Math.round(projects.reduce((s, p) => s + p.onTimeProb, 0) / projects.length);
  const totalDevelopers = new Set(projects.flatMap(p => p.team.map(d => d.name))).size;

  // Burn timeline (last 12 weeks, aggregated)
  const burnTimeline = Array.from({length: 12}, (_, i) => {
    const rng2 = mulberry32(1000 + i);
    return {
      week: i,
      spent: Math.round((totalConsumed / 12) * (0.7 + rng2() * 0.6)),
      budget: Math.round(totalBudget / 12),
    };
  });

  return {
    preset,
    projects,
    kpis: {
      totalBudget,
      totalConsumed,
      consumedPct: Math.round(totalConsumed / totalBudget * 100),
      avgHealth,
      projectsAtRisk,
      totalProjects: projects.length,
      totalStalePRs,
      criticalPRs,
      totalIssuesActive,
      avgOnTime,
      totalDevelopers,
      burnTimeline,
    },
  };
}

window.SPRAVIO_DATA = {
  small: buildDataset("small"),
  medium: buildDataset("medium"),
  large: buildDataset("large"),
};
