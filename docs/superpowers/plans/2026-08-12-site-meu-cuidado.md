# Site "Meu Cuidado" — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o repo `mylittle-redirect` num site de marketing Astro (landing com motion + captação de testadores + feedback), preservando as URLs e o deep link de convite.

**Architecture:** Astro (`output: 'server'` + adapter Vercel; páginas `prerender=true`, endpoints `prerender=false`), ilhas React com Framer Motion, formulários gravando no Supabase via endpoints server-side. Deploy contínuo na Vercel, mesmo repo.

**Tech Stack:** Astro 5, React, Framer Motion, @astrojs/vercel, @astrojs/sitemap, @supabase/supabase-js, Vitest, Manrope (woff2 local).

**Spec:** `docs/superpowers/specs/2026-08-12-site-meu-cuidado-design.md` (leia antes de começar).

## Global Constraints

- **Domínio:** `mylittle.vercel.app`. Meta/OG/canonical/sitemap usam essa origem.
- **URLs preservadas 1:1:** `/`, `/politica-de-privacidade/`, `/exclusao-de-conta/`.
- **Convite:** com `?token=<t>` a raiz redireciona para `mylittle://invite/<t>` + fallback visível; sem token → landing.
- **Idioma:** pt-BR. **Fonte:** Manrope local (`font-display: swap`).
- **Paleta:** teal `#0F5C52`, teal profundo `#0A3F38`, mint `#6FD6C0`, mint claro `#C6E1D8`, creme `#F6F3EE`, tinta `#12211F`.
- **Acessibilidade:** respeitar `prefers-reduced-motion`; contraste AA; foco visível; labels nos inputs; `alt` nas imagens.
- **Segurança:** nenhuma chave sensível no browser; inserts via endpoint; honeypot anti-bot.
- **Astro mudou entre versões** — confirme a sintaxe (`output`, `prerender`, adapters, `Astro.request`) contra os docs da versão instalada antes de codar cada task.
- Texto jurídico das páginas legais é **migrado íntegro** (só re-tematizado), a partir dos HTMLs atuais preservados em `legacy/`.

---

## File Structure

Ver a árvore completa na Seção 3 do spec. Resumo dos arquivos criados/modificados por responsabilidade:
- **Tooling/base:** `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/layouts/Base.astro`, `src/styles/tokens.css`, `public/fonts/*`.
- **Rotas:** `src/pages/index.astro`, `.../politica-de-privacidade/index.astro`, `.../exclusao-de-conta/index.astro`, `src/pages/api/{signup,feedback}.ts`.
- **Componentes:** `Nav.astro`, `Hero.tsx`, `Features.astro`, `HowItWorks.astro`, `Gallery.tsx`, `TestCta.tsx`, `FeedbackForm.tsx`, `Footer.astro`, `Reveal.tsx`, `InviteRedirect.astro`.
- **Lib:** `src/lib/supabase.ts`, `src/lib/validation.ts`.

---

### Task 1: Scaffold Astro + tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `.env.example`
- Create: `src/styles/tokens.css`, `src/layouts/Base.astro`, `src/pages/index.astro` (placeholder), `public/fonts/` (Manrope woff2)
- Move: `index.html`, `politica-de-privacidade/`, `exclusao-de-conta/` → `legacy/` (preservar o texto original como referência)

**Interfaces:**
- Produces: layout `Base.astro` com props `{ title: string; description: string; ogImage?: string }`; variáveis CSS de `tokens.css` (`--teal`, `--deep`, `--mint`, `--mint-l`, `--cream`, `--ink`, `--space-*`).

- [ ] **Step 1: Preservar o legado** — mover os arquivos atuais para `legacy/` (o texto das páginas legais será portado na Task 2; o `index.html` é a referência do redirect).

```bash
mkdir legacy && git mv index.html legacy/ && git mv politica-de-privacidade legacy/ && git mv exclusao-de-conta legacy/
```

- [ ] **Step 2: package.json** — criar com scripts e deps (confirme versões atuais no npm):

```json
{
  "name": "mylittle-site",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^5",
    "@astrojs/react": "^4",
    "@astrojs/vercel": "^8",
    "@astrojs/sitemap": "^3",
    "react": "^18",
    "react-dom": "^18",
    "framer-motion": "^11",
    "@supabase/supabase-js": "^2"
  },
  "devDependencies": { "vitest": "^2", "@types/react": "^18", "@types/react-dom": "^18" }
}
```

- [ ] **Step 3: astro.config.mjs**

```js
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://mylittle.vercel.app',
  output: 'server',
  adapter: vercel(),
  integrations: [react(), sitemap()],
})
```

- [ ] **Step 4: tokens.css** — variáveis da paleta + escala de espaçamento (8/12/16/24/40/64) + reset leve. Importar no `Base.astro`.
- [ ] **Step 5: Base.astro** — `<html lang="pt-BR">`, `<head>` com `<meta charset/viewport>`, `<title>`/`description` via props, `@font-face` das Manrope (500/700/800) apontando `public/fonts`, `<slot />`. (SEO/OG completos entram na Task 10.)
- [ ] **Step 6: index.astro placeholder** — usa `Base` e renderiza um `<h1>` teal só pra validar o pipeline.
- [ ] **Step 7: `.gitignore`** — `node_modules`, `dist`, `.vercel`, `.env`, `.astro`.
- [ ] **Step 8: rodar** — `npm install && npm run dev`; abrir `localhost:4321` e confirmar o placeholder com a fonte Manrope e a cor teal. `npm run build` sem erros.
- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "chore: scaffold Astro + tokens + Base layout"
```

---

### Task 2: Redirect de convite + páginas legais (CRÍTICO — preserva produção)

**Files:**
- Create: `src/components/InviteRedirect.astro`, `src/lib/inviteToken.ts`, `src/lib/inviteToken.test.ts`
- Create: `src/pages/politica-de-privacidade/index.astro`, `src/pages/exclusao-de-conta/index.astro`
- Modify: `src/pages/index.astro` (montar o `InviteRedirect` + um bloco `.landing` placeholder)

**Interfaces:**
- Produces: `parseInviteToken(search: string): string | null` (lê `?token=`), `buildDeepLink(token: string): string` (`mylittle://invite/<token>`).

- [ ] **Step 1: Teste falhando** — `src/lib/inviteToken.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseInviteToken, buildDeepLink } from './inviteToken'

describe('inviteToken', () => {
  it('extrai o token da query', () => {
    expect(parseInviteToken('?token=abc123')).toBe('abc123')
  })
  it('retorna null sem token', () => {
    expect(parseInviteToken('')).toBeNull()
    expect(parseInviteToken('?foo=bar')).toBeNull()
  })
  it('monta o deep link', () => {
    expect(buildDeepLink('abc123')).toBe('mylittle://invite/abc123')
  })
})
```

- [ ] **Step 2: Rodar (falha)** — `npm test` → falha ("parseInviteToken is not a function").
- [ ] **Step 3: Implementar** — `src/lib/inviteToken.ts`:

```ts
export function parseInviteToken(search: string): string | null {
  const t = new URLSearchParams(search).get('token')
  return t && t.trim() ? t : null
}
export function buildDeepLink(token: string): string {
  return 'mylittle://invite/' + token
}
```

- [ ] **Step 4: Rodar (passa)** — `npm test` verde.
- [ ] **Step 5: InviteRedirect.astro** — overlay oculto (spinner + texto "Abrindo o convite no aplicativo Meu Cuidado…" + botão de fallback `#invite-fallback`, tema teal) + `<script is:inline>` no topo que usa a mesma lógica (inline, sem import) do Step 3: se houver token, seta `document.documentElement.dataset.invite='1'`, `location.href` = deep link e, após 2500ms, revela o fallback. CSS: `html[data-invite="1"] .landing{display:none} html[data-invite="1"] #invite-overlay{display:flex}` e o inverso (overlay `display:none` por padrão).
- [ ] **Step 6: index.astro** — dentro do `Base`, renderizar `<InviteRedirect />` + `<main class="landing">` com um placeholder (as seções entram nas próximas tasks).
- [ ] **Step 7: Páginas legais** — portar o texto de `legacy/politica-de-privacidade/index.html` e `legacy/exclusao-de-conta/index.html` para os `.astro`, usando `Base` e `tokens.css` (fundo creme, `main` card, links teal). **Manter o texto jurídico idêntico**; só trocar cores/estrutura. Manter os links internos `/`, `/politica-de-privacidade/`, `/exclusao-de-conta/`.
- [ ] **Step 8: Verificar** — `npm run dev`: `/?token=abc` mostra o overlay e tenta o deep link (o browser vai reclamar do esquema `mylittle://` — esperado); `/` sem token mostra a landing; `/politica-de-privacidade/` e `/exclusao-de-conta/` renderizam o texto. `npm run build` gera os `index.html` nas rotas certas.
- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: redirect de convite (token) + paginas legais re-tematizadas"
```

---

### Task 3: Assets (screenshots, glifo, og, favicon, fontes)

**Files:**
- Create: `public/screenshots/*.webp`, `public/brand/glifo-branco.png`, `public/brand/glifo-teal.svg`, `public/og.png`, `public/favicon.png`, `public/robots.txt`
- (Fontes woff2 já em `public/fonts` na Task 1 — se ainda em ttf, converter para woff2 aqui.)

**Interfaces:**
- Produces: caminhos estáticos usados pelos componentes (`/screenshots/hoje-light.webp`, etc.).

- [ ] **Step 1: Screenshots** — copiar de `C:/www/my-little/.store-shots/` os prints crus (`hoje-light`, `pessoas-light`, `remedios-light`, `editar-light`, `hoje-dark`, `pessoas-dark`) e converter para **webp** (largura alvo ~640px, qualidade ~82) em `public/screenshots/`. (Usar o jimp completo do scratchpad ou `sharp` via `npx`.)
- [ ] **Step 2: Glifo** — copiar `C:/www/my-little/assets/android-icon-foreground.png` → `public/brand/glifo-branco.png`. Extrair/usar o glifo teal (`brand-mark.png` recolorido) como `glifo-teal.svg` ou png para o favicon/nav sobre fundo claro.
- [ ] **Step 3: OG image** — reaproveitar o gráfico de destaque teal; gerar `public/og.png` **1200×630** (o feature graphic é 1024×500; recompor num canvas 1200×630 com o mesmo fundo/telas). `public/favicon.png` a partir do ícone teal.
- [ ] **Step 4: robots.txt** — permitir tudo + apontar `Sitemap: https://mylittle.vercel.app/sitemap-index.xml`.
- [ ] **Step 5: Verificar** — imagens abrem no dev; tamanhos de webp razoáveis (<120KB cada).
- [ ] **Step 6: Commit** — `git add -A && git commit -m "chore: assets (screenshots webp, glifo, og, favicon)"`

---

### Task 4: Nav + Hero (island com motion)

**Files:**
- Create: `src/components/Nav.astro`, `src/components/Hero.tsx`
- Modify: `src/pages/index.astro` (montar Nav + Hero)

**Interfaces:**
- Consumes: assets da Task 3; tokens da Task 1.
- Produces: `<Hero client:load />` (ilha React).

- [ ] **Step 1: Portar o mockup aprovado** — o arquivo `C:/Users/jahn/AppData/Local/Temp/claude/C--www-my-little/73966264-bbf0-4d71-bb7e-3fd7d4b6587d/scratchpad/hero-mock.html` tem o CSS/estrutura **já aprovados** do hero (gradiente teal, badge pulsante, headline com "quem você ama" em mint, CTAs, mini-stats, celular flutuante com float+tilt, glow). Portar esse markup/estilo para `Hero.tsx`.
- [ ] **Step 2: Motion com Framer Motion** — trocar as animações CSS de entrada por `motion.div` com `initial/animate` e stagger (badge → h1 → sub → CTAs → celular); manter float/glow em CSS (contínuos). Envolver em checagem de `prefers-reduced-motion` (`useReducedMotion` do framer-motion) → sem transform, só fade.
- [ ] **Step 3: Nav.astro** — glifo + "Meu Cuidado" + botão "Participar do teste" com `href="#testar"` (âncora pro CTA da Task 9). Sticky opcional com leve blur ao rolar.
- [ ] **Step 4: index** — montar `<Nav />` + `<Hero client:load />` no topo do `.landing`. Os CTAs "Quero testar" apontam `#testar`.
- [ ] **Step 5: Verificar** — hero idêntico ao mockup, animações suaves, responsivo (empilha < 720px), reduced-motion desliga o movimento.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: nav + hero com motion"`

---

### Task 5: Reveal util + Features + HowItWorks

**Files:**
- Create: `src/components/Reveal.tsx`, `src/components/Features.astro`, `src/components/HowItWorks.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `<Reveal client:visible>` (envolve conteúdo; aplica fade-up `whileInView` com `once: true`, respeitando reduced-motion).

- [ ] **Step 1: Reveal.tsx** — componente React que recebe `children` e um `delay?` e usa `motion.div` `initial={{opacity:0,y:24}}` `whileInView={{opacity:1,y:0}}` `viewport={{once:true, margin:'-80px'}}`; se reduced-motion, renderiza sem animação.
- [ ] **Step 2: Features.astro** — 4 cards (`Lembretes na hora certa`, `Cuide da família`, `Tudo organizado`, `Claro & escuro`), cada um com título, texto curto e uma screenshot webp (hoje/pessoas/remedios + um par claro/escuro para o de tema). Cada card envolto em `<Reveal client:visible>`. Hover: `translateY(-4px)` + sombra.
- [ ] **Step 3: HowItWorks.astro** — 3 passos numerados (cadastra → recebe lembrete → marca como tomado), ícones simples (SVG inline), `Reveal` com stagger por `delay`.
- [ ] **Step 4: index** — inserir as duas seções após o Hero.
- [ ] **Step 5: Verificar** — reveal dispara ao rolar; cards e passos legíveis; reduced-motion ok; `npm run build` verde.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: features + como funciona (reveal on scroll)"`

---

### Task 6: Gallery (island com parallax)

**Files:**
- Create: `src/components/Gallery.tsx`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Gallery.tsx** — faixa horizontal com as telas do app (webp) em frames de celular; scroll horizontal com snap OU rolagem vertical com parallax sutil (`useScroll`/`useTransform` do framer-motion para deslocar levemente as colunas em velocidades diferentes). Reduced-motion → sem parallax.
- [ ] **Step 2: index** — inserir a galeria após "Como funciona".
- [ ] **Step 3: Verificar** — galeria fluida, sem travar o scroll da página, responsiva, reduced-motion ok.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: galeria de telas com parallax"`

---

### Task 7: Supabase — tabelas + RLS

**Files:**
- Create: `supabase/migrations/2026-08-12-site-forms.sql` (registro; aplicar via MCP/console)

- [ ] **Step 1: Migração** — criar `test_signups` e `feedback` com RLS habilitado e policies **insert-only** para `anon`, exatamente como na Seção 6 do spec.
- [ ] **Step 2: Aplicar** — rodar no projeto `yuhcttcjidsrsdgzxdqv` (Supabase MCP `apply_migration` ou console). **Confirmar** que não há policy de SELECT para `anon`.
- [ ] **Step 3: Verificar** — inserir uma linha de teste como `anon` (deve passar); `select` como `anon` (deve retornar vazio/negado). Limpar a linha de teste.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(db): tabelas test_signups + feedback (RLS insert-only)"`

---

### Task 8: validation.ts (TDD) + endpoints signup/feedback

**Files:**
- Create: `src/lib/validation.ts`, `src/lib/validation.test.ts`, `src/lib/supabase.ts`
- Create: `src/pages/api/signup.ts`, `src/pages/api/feedback.ts`
- Create: `.env` (local, não commitado) com `SUPABASE_URL`, `SUPABASE_ANON_KEY`

**Interfaces:**
- Produces: `isValidEmail(s): boolean`, `sanitize(s, max): string`, `isBot(body): boolean` (honeypot `website` preenchido), `validateSignup(body): {ok, data?, error?}`, `validateFeedback(body): {ok, data?, error?}`.

- [ ] **Step 1: Testes falhando** — `validation.test.ts` cobrindo: e-mail válido/inválido; honeypot preenchido → `isBot=true`; `validateSignup` rejeita nome vazio/e-mail ruim e aceita válido; `validateFeedback` exige `kind` ∈ {bug,ideia,elogio,outro} e `message` não vazia; `sanitize` corta no máx e trima.

```ts
import { describe, it, expect } from 'vitest'
import { isValidEmail, isBot, validateSignup, validateFeedback } from './validation'

describe('validation', () => {
  it('valida email', () => {
    expect(isValidEmail('a@b.com')).toBe(true)
    expect(isValidEmail('nope')).toBe(false)
  })
  it('honeypot', () => {
    expect(isBot({ website: 'x' })).toBe(true)
    expect(isBot({})).toBe(false)
  })
  it('signup', () => {
    expect(validateSignup({ name: '', email: 'a@b.com' }).ok).toBe(false)
    expect(validateSignup({ name: 'Ana', email: 'bad' }).ok).toBe(false)
    expect(validateSignup({ name: 'Ana', email: 'a@b.com' }).ok).toBe(true)
  })
  it('feedback', () => {
    expect(validateFeedback({ kind: 'x', message: 'oi' }).ok).toBe(false)
    expect(validateFeedback({ kind: 'bug', message: '' }).ok).toBe(false)
    expect(validateFeedback({ kind: 'bug', message: 'trava' }).ok).toBe(true)
  })
})
```

- [ ] **Step 2: Rodar (falha)** — `npm test`.
- [ ] **Step 3: Implementar `validation.ts`** — as funções acima (regex de e-mail simples e robusta, `sanitize` com `.trim().slice(0,max)`, honeypot checa `website`).
- [ ] **Step 4: Rodar (passa)** — `npm test` verde.
- [ ] **Step 5: `supabase.ts`** — `createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_ANON_KEY)` (server-side; sem sessão persistida).
- [ ] **Step 6: Endpoints** — `src/pages/api/signup.ts` e `feedback.ts` com `export const prerender = false` e `export async function POST({ request })`: parseia JSON, `isBot` → `200 {ok:true}` (silencioso), valida, insere na tabela, retorna `{ok:true}` ou `400 {ok:false,error}`. Try/catch → `500`.

```ts
// src/pages/api/signup.ts
import type { APIRoute } from 'astro'
import { supabase } from '../../lib/supabase'
import { isBot, validateSignup } from '../../lib/validation'
export const prerender = false
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}))
  if (isBot(body)) return Response.json({ ok: true })
  const v = validateSignup(body)
  if (!v.ok) return Response.json({ ok: false, error: v.error }, { status: 400 })
  const { error } = await supabase.from('test_signups').insert(v.data)
  if (error) return Response.json({ ok: false, error: 'db' }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 7: Verificar** — `npm run dev`; `curl -X POST localhost:4321/api/signup -d '{"name":"Ana","email":"a@b.com"}' -H 'Content-Type: application/json'` → `{ok:true}` e linha em `test_signups`; e-mail inválido → 400; honeypot → 200 sem gravar. Idem feedback. Limpar linhas de teste.
- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: endpoints signup/feedback + validacao (TDD)"`

---

### Task 9: Forms (islands) TestCta + FeedbackForm

**Files:**
- Create: `src/components/TestCta.tsx`, `src/components/FeedbackForm.tsx`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `POST /api/signup`, `POST /api/feedback`.

- [ ] **Step 1: TestCta.tsx** — bloco `id="testar"` com copy do teste fechado + form (nome, e-mail, honeypot `website` escondido via CSS). `onSubmit`: `fetch('/api/signup', {method:'POST', body: JSON.stringify(...)})`; estados `idle/enviando/ok/erro`; on ok mostra "Valeu! Em breve te enviamos o link do teste." Validação client-side espelhando a do servidor.
- [ ] **Step 2: FeedbackForm.tsx** — form (nome opcional, `kind` select [bug/ideia/elogio/outro], mensagem textarea, honeypot). `fetch('/api/feedback')`; mesmos estados; mensagem de sucesso.
- [ ] **Step 3: index** — inserir `<TestCta client:visible />` e `<FeedbackForm client:visible />` antes do footer.
- [ ] **Step 4: Verificar** — enviar os dois forms no dev → linhas nas tabelas; erros exibidos; honeypot não quebra UX; teclado/foco/labels ok. Limpar linhas de teste.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: formularios de teste e feedback (islands)"`

---

### Task 10: Footer + SEO + montagem final

**Files:**
- Create: `src/components/Footer.astro`
- Modify: `src/layouts/Base.astro` (OG/Twitter/JSON-LD), `src/pages/index.astro`

- [ ] **Step 1: Footer.astro** — links `Política de Privacidade` (`/politica-de-privacidade/`), `Exclusão de conta` (`/exclusao-de-conta/`), `Contato` (`mailto:abisaytech@gmail.com`), © + ano. Tema teal.
- [ ] **Step 2: SEO no Base** — `<meta name="description">` pt-BR; canonical; Open Graph (`og:title/description/image/url/type`) e Twitter card usando `/og.png`; `<script type="application/ld+json">` com `SoftwareApplication` (nome "Meu Cuidado", `applicationCategory: "HealthApplication"`, `operatingSystem: "Android"`, `offers` preço 0).
- [ ] **Step 3: title/description reais** — na `index.astro` passar título ("Meu Cuidado — Lembretes de remédios para você e quem você cuida") e description ao `Base`. Idem páginas legais.
- [ ] **Step 4: Verificar** — `npm run build`; conferir `sitemap-index.xml` gerado, `robots.txt`, tags no HTML final; rodar Lighthouse local (SEO/Best-Practices/Perf altos, CLS baixo).
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: footer + SEO (OG, JSON-LD, sitemap)"`

---

### Task 11: Deploy Vercel + verificação em produção

**Files:** — (nenhum de código; config na Vercel)

- [ ] **Step 1: Env vars na Vercel** — no projeto do site, setar `SUPABASE_URL` e `SUPABASE_ANON_KEY` (o mesmo projeto `yuhcttcjidsrsdgzxdqv`) para Production/Preview.
- [ ] **Step 2: Deploy** — `git push` na branch de deploy (a Vercel builda o Astro automaticamente). Confirmar que o framework preset detectou Astro e o adapter Vercel gerou as funções.
- [ ] **Step 3: Verificar produção** — em `https://mylittle.vercel.app`:
  - `/` mostra a landing; `/?token=teste` mostra o overlay e dispara o deep link.
  - `/politica-de-privacidade/` e `/exclusao-de-conta/` abrem (texto preservado).
  - Enviar 1 signup e 1 feedback reais → linhas nas tabelas; depois limpar.
  - **Testar o fluxo de convite de ponta a ponta** com um convite real do app (garantir que o deep link ainda abre o app).
- [ ] **Step 4: Commit final / tag** — se tudo verde, `git commit --allow-empty -m "chore: site em producao"` (ou tag).

---

## Notas de execução

- Rodar `npm test` deve ficar verde a partir da Task 2 (inviteToken) e Task 8 (validation).
- As tasks visuais (4, 5, 6, 9) verificam por build + inspeção no browser (não há teste automatizado de layout).
- **Risco maior = Task 2** (não quebrar o convite): validá-la com cuidado antes de seguir; ela é o contrato com o app em produção.
- Reaproveitar sempre os assets do app (`C:/www/my-little/assets` e `.store-shots`) para coesão de marca.
