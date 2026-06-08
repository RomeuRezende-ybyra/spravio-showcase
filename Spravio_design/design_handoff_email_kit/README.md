# Handoff: Spravio Email Kit

## Overview

Kit com **9 emails transacionais e de ciclo de vida** para o produto Spravio (plataforma de visibilidade de sprints para agências). Este pacote contém mocks HTML de referência visual + especificação completa para implementação em um sistema real de entrega de emails (SendGrid, Resend, Postmark, AWS SES, MJML etc.).

## ⚠ About the Design Files

O arquivo `Spravio Email Kit.html` bundled aqui é uma **referência visual** — um preview navegável dos 9 templates lado a lado, com chrome de showcase (abas de navegação, labels de stage, metadados fake de "de/para/assunto").

**Não é código de produção.** O HTML usa CSS moderno (oklch, color-mix, flexbox, grid, fontes via Google Fonts link, JS para navegação) que **não funciona em clients de email** como Gmail, Outlook, Apple Mail, Yahoo etc.

**A tarefa do dev é:**
1. Extrair cada um dos 9 templates do mock
2. **Recriar** cada template usando o padrão de email do codebase alvo — tipicamente:
   - **MJML** (recomendado — compila pra HTML compatível)
   - **React Email** (se stack já é React)
   - **HTML manual com tabelas inline** (último caso, mais trabalhoso)
3. Integrar com o provider de envio existente (variáveis, templates, triggers)
4. Testar em Litmus ou Email on Acid antes de produção

## Fidelity

**High-fidelity (hi-fi).** Cores, tipografia, hierarquia, spacing, copy e estrutura estão finais e devem ser reproduzidos com precisão. Ajustes são necessários apenas pelos constraints de clients de email:

- `oklch()` e `color-mix()` → converter pra hex fixos (valores abaixo)
- Fontes Google → usar stack com fallback system; Fraunces e JetBrains Mono gracefully degradam
- Flexbox/grid → substituir por `<table>` com `cellpadding/cellspacing="0"` e `role="presentation"`
- Border-radius → manter, a maioria dos clients suporta
- Botão CTA → usar técnica de *bulletproof button* (VML fallback pra Outlook)

## Design Tokens

### Cores (hex, prontas pra email)
```
--cream       #faf5ea  (background geral)
--cream-2     #f2ebd9  (background secundário, panels)
--cream-3     #e8dfc4  (pills, destaque sutil)
--paper       #fdfbf6  (corpo do email / cards)
--ink         #1a140c  (texto primário, CTA bg)
--ink-2       #4a3d30  (texto secundário)
--ink-3       #8a7a68  (texto terciário, captions)
--rule        #e8ddc8  (bordas sutis, dividers)
--rule-2      #d4c5a8  (bordas mais marcadas)
--accent      #c96a3c  (terracotta — brand color)
--accent-soft #f5e6d8  (backgrounds acentuados)
--accent-deep #8b4420  (links, emphasis em texto)
--good        #4a8b5c  (verde — sucesso, KPI positivo)
--warn        #c89540  (amarelo — atenção)
--bad         #b8432a  (vermelho — alerta crítico)
```

### Tipografia
| Uso | Família | Peso | Tamanho | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Display H1 grande | Fraunces (serif) | 300 | 36px | 1.1 | -0.02em |
| Display H1 pequeno | Fraunces | 300 | 28px | 1.15 | -0.02em |
| Display H1 *em italic* | Fraunces italic | 300 | herda | herda | herda |
| KPI value | Fraunces | 400 | 26–36px | 1.0 | normal |
| Panel title | Fraunces | 400 | 22px | 1.2 | -0.01em |
| Body | Inter | 400 | 15px | 1.65 | normal |
| Body compacto | Inter | 400 | 13px | 1.5 | normal |
| CTA | Inter | 600 | 14px | 1.0 | 0.01em |
| Eyebrow / labels | JetBrains Mono | 500 | 10px | 1.0 | 0.14em uppercase |
| Metadata | JetBrains Mono | 500 | 10–11px | 1.6 | 0.08–0.12em |

**Fallback stacks para email** (Fraunces e JetBrains Mono não são web-safe — declare stack):
- Display: `Fraunces, 'Times New Roman', Georgia, serif`
- Body: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`
- Mono: `'JetBrains Mono', 'SF Mono', Consolas, 'Courier New', monospace`

### Spacing / Layout
- **Container max-width**: 640px (padrão para email)
- **Padding body**: 40px (vertical e horizontal interno)
- **Padding header**: 32px 40px
- **Padding footer**: 28px 40px 32px
- **Border-radius**: 4px (card exterior), 10px (botões, inputs), 12px (panels, KPIs, alerts)

### Shadows
Emails não devem depender de shadow (muitos clients ignoram). Use bordas sutis (`1px solid #e8ddc8`) no lugar.

## Estrutura comum a todos os emails

Cada email tem 3 seções empilhadas:

### 1. Header (topo)
- Logo à esquerda: quadrado `32x32` com `border-radius: 8px`, fundo `#1a140c`, letra **"s"** em Fraunces italic `18px` cor `#c96a3c`
- Ao lado: "Spravio" em Fraunces 400, 18px, cor `#1a140c`
- Direita: metadado em JetBrains Mono uppercase cor `#8a7a68`, formato: `01 · TRANSACIONAL` (número do email + categoria)
- Divisor: `1px solid #e8ddc8` em baixo

### 2. Body
- Começa com **eyebrow** (mono, uppercase, cor accent-deep `#8b4420`, com uma linha `20px × 1px` antes)
- **H1** grande com palavras-chave em italic cor `#8b4420`
- **Parágrafo(s)** em Inter 15px, cor `#4a3d30`, line-height 1.65
- **Componente principal** do email (varia — ver cada um)
- **CTA primário** (botão preto) + CTA secundário opcional (outline)

### 3. Footer corporativo (igual em TODOS)
- Background: `#f2ebd9`
- Border-top: `1px solid #e8ddc8`
- Logo miniatura (24×24) + nome
- **Endereço legal**:
  ```
  Spravio Technologies Ltda.
  Av. Paulista, 1578 · Bela Vista · São Paulo, SP 01310-200 · Brasil
  CNPJ 00.000.000/0001-00
  ```
  (Substituir pelo endereço/CNPJ reais do cliente)
- **Links** (mono, uppercase, 10px): spravio.io · Docs · Status · Segurança · Contato
- **Legal** (mono, uppercase, 10px, cor `#8a7a68`):
  `© 2026 SPRAVIO · PRIVACIDADE · TERMOS · LGPD`
- **Unsubscribe** (Inter 10px): "Você está recebendo este email porque tem uma conta no Spravio. [Gerenciar notificações]"

## Os 9 Templates

> Todos os emails são em **português (BR)**. Os tokens entre `{{ }}` devem ser substituídos pelo template engine do provider (Handlebars, Mustache, Liquid etc.).

---

### 01 · Welcome
- **Gatilho**: primeiro login após signup
- **Remetente**: `Spravio <oi@spravio.io>`
- **Assunto**: `Bem-vinda ao Spravio, {{firstName}}`
- **Tom**: Warm editorial — assinado pelo founder
- **Componentes**:
  - Eyebrow: "Bem-vinda · 14 dias de trial"
  - H1 em 2 linhas: "Que bom *te ver por aqui,* {{firstName}}."
  - Intro pessoal sobre o porquê do produto
  - **Lista de 3 steps** numerados (círculo outline accent) com título + descrição:
    1. Conecte Jira, GitHub ou Azure DevOps
    2. Veja seu primeiro dashboard
    3. Convide seu time (opcional)
  - CTA: "Conectar minha primeira ferramenta →" → `{{appUrl}}/integrations`
  - P.S. assinado: "— Romeu, founder"
- **Dados dinâmicos**: `firstName`, `appUrl`

---

### 02 · Confirmação de Email (Verify)
- **Gatilho**: imediato após signup (antes do primeiro login)
- **Remetente**: `Spravio <noreply@spravio.io>`
- **Assunto**: `Confirme seu email · Spravio`
- **Tom**: Direto ao ponto, mas amigável
- **Componentes**:
  - Eyebrow: "Confirmação · 15 min"
  - H1 (versão small): "Confirme seu email para ativar a conta."
  - Parágrafo explicativo
  - CTA primário: "Confirmar email →" → `{{verifyUrl}}`
  - **Divider com label**: "Ou use o código"
  - **Code block** (card preto `#1a140c`, texto creme, border-radius 12px, padding 20px):
    - Label mono: "Código de verificação"
    - Código em Fraunces 300, 44px, letter-spacing 0.25em: `{{code}}`
    - Expiração mono pequeno: "EXPIRA EM 15 MINUTOS"
  - Disclaimer final pequeno sobre ignorar se não foi ele
- **Dados dinâmicos**: `verifyUrl`, `code`, `email`

---

### 03 · Reset de Senha
- **Gatilho**: usuário clica "esqueci senha"
- **Remetente**: `Spravio <noreply@spravio.io>`
- **Assunto**: `Código para redefinir senha · {{code}}`
- **Tom**: Direto, com ênfase em segurança
- **Componentes**:
  - Eyebrow: "Segurança · 15 min"
  - H1: "Redefinição de senha solicitada."
  - Parágrafo com email em **bold**: "Alguém pediu para redefinir a senha da conta **{{email}}**..."
  - **Code block** idêntico ao Verify (card preto, código grande)
  - CTA: "Redefinir no navegador →" → `{{resetUrl}}`
  - **Alert warn** (background amarelo suave, border amarela, círculo com "!"):
    - Título: "Não foi você?"
    - Texto: ignorar o email + link "reporte uma tentativa suspeita"
- **Dados dinâmicos**: `code`, `email`, `resetUrl`

---

### 04 · Convite para Org
- **Gatilho**: admin adiciona colaborador
- **Remetente**: `Spravio <noreply@spravio.io>`
- **Assunto**: `{{inviterName}} te convidou para {{orgName}} no Spravio`
- **Tom**: Direto, informativo
- **Componentes**:
  - Eyebrow: "Convite para colaborar"
  - H1 small com nome em peso 400 + org em italic accent-deep
  - Parágrafo explicando role + projetos
  - **Panel** (background cream-2, border-radius 12px, padding 20px):
    - Label mono: "Detalhes do convite"
    - **Definition list** com 4 linhas (workspace, role, quem convidou, projetos) — dt em mono uppercase, dd em Inter regular
  - CTA primário: "Aceitar convite →" → `{{acceptUrl}}`
  - CTA secundário: "Recusar"
  - Nota: "Convite expira em 7 dias..."
- **Dados dinâmicos**: `inviterName`, `orgName`, `inviteeEmail`, `role`, `projectsCount`, `projectNames`, `acceptUrl`, `declineUrl`

---

### 05 · Onboarding D3 (Conecte seu Jira)
- **Gatilho**: D+3 do signup, sem integração conectada
- **Remetente**: `Romeu Rezende <romeu@spravio.io>` (pessoal, não noreply)
- **Assunto**: `{{firstName}}, faltam {{daysLeft}} dias — conectou o Jira ainda?`
- **Tom**: Warm, assinado pelo founder, urgência leve
- **Componentes**:
  - Eyebrow: "Onboarding · dia 3 de 14"
  - H1 small: "Faltam *11 dias* de trial, {{firstName}}." (número em italic accent)
  - Parágrafo diagnóstico (identifica que não conectou)
  - **3 steps** (igual welcome):
    1. OAuth em 2 cliques
    2. Primeiro forecast IA em 30s
    3. Alertas ligam sozinhos
  - CTA primário: "Conectar Jira agora →"
  - CTA secundário: "Conectar GitHub"
  - P.S. assinado pelo Romeu
- **Dados dinâmicos**: `firstName`, `daysLeft`, links das integrações

---

### 06 · Alerta de PR Stale
- **Gatilho**: automação (PRs sem atividade > 72h em sprint ativo)
- **Remetente**: `Spravio <alerts@spravio.io>`
- **Assunto**: `⚠ {{count}} PRs críticos sem atividade há +72h — {{projectName}}`
- **Tom**: Notificação técnica, urgente mas informativa
- **Componentes**:
  - Eyebrow: "Alerta · {{projectName}}"
  - H1 small com número em peso 400 + "+72 horas" em italic cor `#b8432a`
  - Parágrafo explicando o problema
  - **Alerts repetidos** (um por PR), cada um:
    - Background `#b8432a` @ 8% opacity, border `#b8432a` @ 30%
    - Círculo com "⚠" em `#b8432a`
    - Título: "PR #{{number}} · {{title}}"
    - Subtexto: autor, tempo aberto, LOC, status de review
  - CTA primário: "Ver no Spravio →" → `{{appUrl}}/project/{{id}}`
  - CTA secundário: "Silenciar 24h"
  - Nota sobre threshold configurável + link para settings
- **Dados dinâmicos**: `projectName`, `prList[{number, title, author, hoursOpen, loc, reviewStatus}]`, `appUrl`, `snoozeUrl`, `settingsUrl`

---

### 07 · Resumo Semanal (Weekly Digest)
- **Gatilho**: toda segunda-feira 8h local
- **Remetente**: `Spravio <digest@spravio.io>`
- **Assunto**: `Seu resumo · {{orgName}} · {{dateRange}}`
- **Tom**: Neutro, informativo, "summary"
- **Componentes**:
  - Eyebrow: "Resumo · {{dateRange}} · {{orgName}}"
  - H1 small: "Semana em *números.*"
  - Parágrafo intro
  - **Grid de 3 KPIs** (3 colunas, gap 8px):
    - Cards brancos com border, padding 14px
    - Label mono, valor em Fraunces grande (26px), sublabel mono com delta
    - KPI.good → valor em verde `#4a8b5c`, KPI.bad → valor em vermelho `#b8432a`
    - Exemplos: "Cards entregues · 47 · +12% vs. semana anterior"
  - **Panel "Destaques"** com lista de 3 itens (ul sem bullet, com divisores internos):
    - `**{{projectName}}** · {{finding}} · [ver]`
  - CTA: "Abrir dashboard →"
- **Dados dinâmicos**: `orgName`, `dateRange`, `kpis[{label, value, tone, sublabel}]`, `highlights[{projectName, finding, url}]`, `dashboardUrl`

---

### 08 · Trial Expirando (3 dias)
- **Gatilho**: D+11 do signup
- **Remetente**: `Romeu Rezende <romeu@spravio.io>`
- **Assunto**: `Faltam 3 dias de trial, {{firstName}}`
- **Tom**: Warm, apreciativo, convite sem pressão
- **Componentes**:
  - Eyebrow: "Trial · 3 dias restantes"
  - H1 small: "Obrigado por testar o Spravio, *{{firstName}}.*"
  - Parágrafo com **métricas do próprio uso** (projetos conectados, alertas recebidos — personalizadas)
  - **Panel** explicando o fallback gratuito ("o que acontece se não assinar")
  - **Grid de 2 cards** (pricing):
    - Studio: R$ 89/dev/mês, min 3 devs
    - Solo: R$ 39/mês, 1 pessoa, 3 projetos
  - CTA primário: "Escolher plano →"
  - CTA secundário: "Agendar uma call"
  - P.S. assinado pelo Romeu
- **Dados dinâmicos**: `firstName`, `projectsCount`, `alertsCount`, `alertsResolved`, pricing URLs

---

### 09 · Fatura / Billing
- **Gatilho**: mensal, dia 1º
- **Remetente**: `Spravio Billing <billing@spravio.io>`
- **Assunto**: `Fatura Spravio · {{month}} · R$ {{total}}`
- **Tom**: Formal, transacional
- **Componentes**:
  - Eyebrow: "Fatura · {{month}}"
  - H1 small: "Fatura disponível, {{orgName}}."
  - Parágrafo explicando cobrança automática + data + último 4 dígitos do cartão
  - **Panel (borda, sem padding interno, conteúdo em rows)**:
    - Primeira row (paper bg): "Plano · **{{planName}}** · {{devCount}} devs × R$ {{perDev}}"
    - Row: "Subtotal · R$ {{subtotal}}"
    - Row: "Integrações extra · R$ {{extras}}"
    - Row: "Impostos (ISS) · R$ {{tax}}"
    - Row destacada (cream-2 bg, fonte maior): "**Total · R$ {{total}}**"
  - **Alert good** (verde): "Pagamento agendado — débito em {{chargeDate}}, NFS-e enviada..."
  - CTA primário: "Baixar fatura em PDF →"
  - CTA secundário: "Gerenciar cobrança"
- **Dados dinâmicos**: `month`, `orgName`, `planName`, `devCount`, `perDev`, `subtotal`, `extras`, `tax`, `total`, `cardLast4`, `chargeDate`, `invoiceEmail`, `pdfUrl`, `billingUrl`

---

## Componentes Reutilizáveis (mapear em MJML/React Email)

Recomendo criar estes componentes compartilhados no projeto:

| Componente | Onde aparece | Props |
|---|---|---|
| `<Layout>` | Todos | children, emailNumber, category |
| `<Header>` | Todos | emailNumber, category |
| `<Footer>` | Todos | — (estático, só atualizar com legal do cliente) |
| `<Eyebrow>` | Todos | text |
| `<Heading>` | Todos | text, emphasizedWords[], size="lg"\|"sm" |
| `<Paragraph>` | Todos | children (permitir **bold** e links accent-deep) |
| `<ButtonPrimary>` | 8/9 | href, children (com suporte bulletproof pra Outlook) |
| `<ButtonSecondary>` | 4/9 | href, children |
| `<CodeBlock>` | Verify, Reset | code, label, expireText |
| `<Panel>` | Invite, Weekly, Trial, Invoice | label, children |
| `<Steps>` | Welcome, Onboarding | items[{title, description}] |
| `<Alert>` | Reset, PR stale, Invoice | tone: "good"\|"warn"\|"bad", icon, title, description |
| `<DefinitionList>` | Invite, Invoice | items[{term, definition}] |
| `<KPIGrid>` | Weekly, Trial | kpis[{label, value, tone, sublabel}] |

## Responsividade

Emails devem funcionar em **320px (iPhone SE) até 640px+ (desktop)**. Recomendações:
- Usar `<table>` com `width="100%"` e `max-width="640"`
- KPI grid de 3 colunas: empilhar em vertical abaixo de 480px (`@media (max-width: 480px) { .kpi-grid td { display: block; width: 100%; } }`)
- Padding do body: reduzir para 24px em mobile (classe `.email-body` → responsive via `<!--[if !mso]><!-->` blocks)
- CTAs: manter largura automática, não forçar full-width a menos que pedido

## Dark mode

O design funciona bem em **light mode**. Para dark mode de clients que suportam (Apple Mail, iOS Mail):
- Usar `@media (prefers-color-scheme: dark)` com overrides
- Não depender só de imagens (não muda cor)
- Cor `#1a140c` vira `#faf5ea` em dark; `#fdfbf6` vira `#1a140c`; manter accent `#c96a3c` que funciona nos dois
- Testar em Litmus antes de enviar

## Localização

Todo texto está em **pt-BR**. Se for internacionalizar futuramente:
- Separar strings em arquivo i18n (não hardcoded)
- Ajustar `lang="pt-BR"` no `<html>` dinamicamente
- Formatação de data/moeda via `Intl.DateTimeFormat`/`Intl.NumberFormat`
- Endereço do footer muda conforme entidade legal local

## Testing Checklist

- [ ] Renderiza em Gmail (web + iOS + Android)
- [ ] Renderiza em Apple Mail (macOS + iOS)
- [ ] Renderiza em Outlook 365 (Windows + web + macOS) — esse é o mais chato
- [ ] Renderiza em Yahoo Mail
- [ ] Dark mode em Apple Mail
- [ ] Links clickáveis em todos
- [ ] Variables (`{{ }}`) preenchem corretamente
- [ ] Unsubscribe funcional e one-click (CAN-SPAM / LGPD)
- [ ] SPF / DKIM / DMARC configurados no domínio `spravio.io`
- [ ] List-Unsubscribe header presente
- [ ] Plain text fallback gerado (Litmus ou manual)

## Files

- `Spravio Email Kit.html` — mock visual de referência (abrir no browser pra ver os 9 templates com navegação por abas)
- `README.md` — este arquivo

## Notas finais

- Endereço, CNPJ e razão social no footer são **placeholder** — substituir pelos dados reais da Spravio Technologies Ltda.
- Email `oi@spravio.io`, `alerts@spravio.io` etc. precisam existir no provider (ou ser configurados como aliases)
- Signatário "Romeu Rezende" nos emails warm é fictício — ajustar pro founder real
- O código de verificação `473924` e dados de exemplo (Maria, Studio Lapa, Banco Meridian) são mocks — vão ser substituídos por variáveis
