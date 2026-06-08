// Dados mock compartilhados entre telas
const SPRAVIO = {
  projects: [
    { id: 'mrd', key: 'MRD', name: 'Banco Meridian', client: 'Meridian', gp: 'Maria S.', gpInitials: 'MS', health: 'at-risk', forecast: 67, progress: 78, budget: 85, sprintName: 'Sprint 14', cards: { total: 42, done: 33, prog: 6, todo: 3 }, prStale: 2, devs: 4 },
    { id: 'vora', key: 'VRA', name: 'E-comm Vora', client: 'Vora', gp: 'Maria S.', gpInitials: 'MS', health: 'late', forecast: 41, progress: 52, budget: 92, sprintName: 'Sprint 8', cards: { total: 28, done: 16, prog: 8, todo: 4 }, prStale: 4, devs: 3 },
    { id: 'koru', key: 'KRU', name: 'Koru Health App', client: 'Koru', gp: 'Pedro L.', gpInitials: 'PL', health: 'on-track', forecast: 89, progress: 91, budget: 48, sprintName: 'Sprint 22', cards: { total: 35, done: 31, prog: 3, todo: 1 }, prStale: 0, devs: 5 },
    { id: 'finl', key: 'FNL', name: 'Finlit Dashboard', client: 'Finlit', gp: 'Maria S.', gpInitials: 'MS', health: 'on-track', forecast: 82, progress: 64, budget: 59, sprintName: 'Sprint 5', cards: { total: 24, done: 15, prog: 5, todo: 4 }, prStale: 1, devs: 3 },
    { id: 'atl', key: 'ATL', name: 'Atlas Logistics', client: 'Atlas', gp: 'Pedro L.', gpInitials: 'PL', health: 'at-risk', forecast: 58, progress: 43, budget: 71, sprintName: 'Sprint 11', cards: { total: 31, done: 13, prog: 9, todo: 9 }, prStale: 3, devs: 4 },
  ],
  prs: [
    { id: 187, title: 'refactor(api): extract payment service', author: 'Lucas F.', initials: 'LF', project: 'MRD', age: '76h', stale: 'critical', additions: 340, deletions: 127, comments: 3, cardRef: 'MRD-412' },
    { id: 203, title: 'feat(checkout): add pix instant', author: 'Renata K.', initials: 'RK', project: 'VRA', age: '48h', stale: 'warn', additions: 218, deletions: 45, comments: 1, cardRef: 'VRA-88' },
    { id: 198, title: 'fix(auth): session leak on refresh', author: 'Daniel P.', initials: 'DP', project: 'KRU', age: '6h', stale: null, additions: 32, deletions: 18, comments: 2, cardRef: 'KRU-301' },
    { id: 211, title: 'feat(dashboard): burndown chart v2', author: 'Sofia R.', initials: 'SR', project: 'FNL', age: '29h', stale: 'warn', additions: 512, deletions: 89, comments: 5, cardRef: 'FNL-120' },
  ],
  alerts: [
    { id: 1, type: 'pr-stale-critical', title: 'PR #187 parado há 76h', project: 'Banco Meridian', detail: 'refactor(api): extract payment service · Lucas F.', time: '2h', sev: 'critical', unread: true },
    { id: 2, type: 'sprint-risk', title: 'Sprint 14 em risco — probabilidade 42%', project: 'Banco Meridian', detail: 'IA forecast: 3 cards em In Progress há +4 dias, velocity 28% abaixo da média', time: '4h', sev: 'critical', unread: true },
    { id: 3, type: 'budget', title: 'E-comm Vora atingiu 92% do orçamento', project: 'E-comm Vora', detail: 'Restam 48h estimadas · budget 12h — cliente notificado?', time: '6h', sev: 'warn', unread: true },
    { id: 4, type: 'pr-stale-warn', title: '3 PRs aguardando review há +24h', project: 'Vários projetos', detail: 'VRA-88, FNL-120, ATL-51 — autor diferente em cada', time: '1d', sev: 'warn', unread: false },
    { id: 5, type: 'done-no-code', title: 'PRJ-204 marcado Done sem commit', project: 'Atlas Logistics', detail: 'Lucas F. moveu "Integração Correios" para Done sem PR vinculado', time: '1d', sev: 'info', unread: false },
    { id: 6, type: 'sync-ok', title: 'Jira sync concluído · 127 cards', project: 'Todos projetos', detail: '4.2s · 12 diffs detectados · nenhum conflito', time: '2d', sev: 'good', unread: false },
  ],
};
Object.assign(window, { SPRAVIO });
