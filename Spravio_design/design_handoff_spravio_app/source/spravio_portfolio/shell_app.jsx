// Shell App Wrapper — TweaksPanel + state management + mount hook reutilizável
const { useState: _useState, useEffect: _useEffect, useCallback: _useCallback } = React;

function TweaksPanel({ tweaks, setTweak, visible, onClose }) {
  if (!visible) return null;
  const T = ({ k, label, options }) => (
    <div className="sv-tw-group">
      <div className="sv-tw-label">{label}</div>
      <div className="sv-tw-btns">
        {options.map(([v, l]) => (
          <button key={v} className={tweaks[k] === v ? "on" : ""} onClick={() => setTweak(k, v)}>{l}</button>
        ))}
      </div>
    </div>
  );
  return (
    <div className="sv-tweaks">
      <div className="sv-tweaks-head">
        <span className="sv-tweaks-title">Tweaks</span>
        <button className="sv-tweaks-close" onClick={onClose}>×</button>
      </div>
      <div className="sv-tweaks-body">
        <T k="theme" label="Tema" options={[["dark","Dark"],["light","Light"]]} />
        <T k="density" label="Densidade" options={[["high","Alta"],["medium","Média"],["low","Baixa"]]} />
        <T k="role" label="Role simulado" options={[["OWNER","Owner"],["PM","PM"],["VIEWER","Viewer"]]} />
        <T k="dataPreset" label="Fake data" options={[["small","Pequena"],["medium","Média"],["large","Grande"]]} />
      </div>
      <div className="sv-tw-foot">
        <span>⌘K para command</span>
        <span>persistido</span>
      </div>
    </div>
  );
}

function RoleRestrictedNote({ role, pageId }) {
  if (role === "OWNER") return null;
  const pageMap = {
    portfolio: { title: "Portfolio", forRoles: ["OWNER"] },
    budget:    { title: "Financials", forRoles: ["OWNER","PM"] },
    forecast:  { title: "Forecast", forRoles: ["OWNER","PM"] },
    integrations: { title: "Integrações", forRoles: ["OWNER","PM"] },
  };
  const info = pageMap[pageId];
  if (info && !info.forRoles.includes(role)) {
    return (
      <div className="sv-role-note" style={{ background: "oklch(0.72 0.14 55 / 0.12)" }}>
        <div className="ic">!</div>
        <div>
          <b>{info.title}</b> requer role {info.forRoles.join(" ou ")} — você está vendo uma visão limitada.
        </div>
      </div>
    );
  }
  return null;
}

// Hook que carrega tweaks + aplica e expõe setter
function useSpravioShell(currentPageId) {
  const [tweaks, setTweaks] = _useState(() => window.SpravioBoot.loadTweaks());
  const [paletteOpen, setPaletteOpen] = _useState(false);
  const [tweaksOpen, setTweaksOpen] = _useState(false);

  _useEffect(() => { window.SpravioBoot.applyTweaks(tweaks); window.SpravioBoot.saveTweaks(tweaks); }, [tweaks]);

  const setTweak = _useCallback((k, v) => setTweaks(t => ({ ...t, [k]: v })), []);

  _useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setPaletteOpen(o => !o); }
      if (e.key === "Escape") { setPaletteOpen(false); setTweaksOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Edit mode host wiring
  _useEffect(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  const data = (window.SPRAVIO_DATA && window.SPRAVIO_DATA[tweaks.dataPreset]) || window.SPRAVIO_DATA.medium;
  const role = tweaks.role;

  const nav = _useCallback((id) => {
    const href = window.SpravioBoot.NAV_ROUTES[id];
    if (href) window.location.href = href;
  }, []);

  return { tweaks, setTweak, data, role, paletteOpen, setPaletteOpen, tweaksOpen, setTweaksOpen, nav };
}

Object.assign(window, { TweaksPanel, RoleRestrictedNote, useSpravioShell });
