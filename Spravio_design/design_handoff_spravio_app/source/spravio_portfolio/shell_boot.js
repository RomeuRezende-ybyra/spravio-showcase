// Shell boot — helpers compartilhados entre todas as páginas Spravio
// Carrega tweaks do localStorage, provê navegação via sidebar, wraps em shell

const TWEAK_DEFAULTS = {
  theme: "dark",
  density: "high",
  role: "OWNER",
  dataPreset: "medium",
  chartStyle: "gradient",
};

function loadTweaks() {
  try {
    const s = JSON.parse(localStorage.getItem("spravio_portfolio_tweaks") || "{}");
    return { ...TWEAK_DEFAULTS, ...s };
  } catch { return { ...TWEAK_DEFAULTS }; }
}

function saveTweaks(t) {
  try { localStorage.setItem("spravio_portfolio_tweaks", JSON.stringify(t)); } catch {}
}

function applyTweaks(t) {
  const html = document.documentElement;
  html.setAttribute("data-theme", t.theme);
  html.setAttribute("data-density", t.density);
  html.setAttribute("data-role", t.role);
  html.setAttribute("data-data-preset", t.dataPreset);
}

// Navigation map — routes para páginas
const NAV_ROUTES = {
  portfolio:    "Spravio Portfolio.html",
  projects:     "Spravio Projects.html",
  sprints:      "Spravio Sprints.html",
  developers:   "Spravio Portfolio.html", // placeholder
  prs:          "Spravio PRs.html",
  budget:       "Spravio Financial.html",
  forecast:     "Spravio Forecast.html",
  integrations: "Spravio Integrations.html",
  settings:     "Spravio Settings.html",
};

window.SpravioBoot = {
  TWEAK_DEFAULTS,
  loadTweaks,
  saveTweaks,
  applyTweaks,
  NAV_ROUTES,
};
