# Site "Meu Cuidado" v2 (Next.js + GSAP) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a landing do Meu Cuidado em Next.js 14 + GSAP/Lenis/Canvas (pegada do `abisay.tech`), com layout repensado, tom acolhedor, WCAG 2.2 AA testado, preservando 100% dos contratos de produção (convite, URLs, endpoints, deploy).

**Architecture:** Next.js 14 App Router (JS puro, CSS com tokens). Motion num `useGSAP` central (`components/Landing.js`) + Lenis (smooth scroll) + Canvas 2D nativo (partículas). Route handlers `/api/*` server-side gravam no Supabase existente. Substitui o Astro no mesmo repo, numa branch nova. Deploy Vercel (re-detecta Next automaticamente).

**Tech Stack:** Next.js 14.2, React 18, GSAP 3 + ScrollTrigger + @gsap/react, Lenis, @supabase/supabase-js, next/font/local (Manrope), Vitest, @axe-core/playwright.

**Spec:** `docs/superpowers/specs/2026-08-13-site-meu-cuidado-nextjs-design.md` (leia antes de começar).

**Referência de stack/motion:** o projeto `C:\www\abisay` (Next+GSAP+Lenis) é a referência concreta — os arquivos citados nas tasks visuais mostram o padrão exato a adaptar (trocando cobre→teal e endurecido→acolhedor). O hero aprovado está em `docs/reference/hero-mock.html`.

## Global Constraints

- **Domínio/SEO:** origem `https://cuidado.abisay.tech`. Canonical/OG/sitemap usam essa origem.
- **URLs preservadas 1:1:** `/`, `/politica-de-privacidade/`, `/exclusao-de-conta/` (Next App Router + `trailingSlash: true`).
- **Convite (contrato com o app):** com `?token=<t>` a raiz redireciona para `mylittle://invite/<t>` (formato EXATO — esquema do app, não muda) + fallback visível aos 2500ms; sem token → landing. `data-invite` setado sincronicamente; navegação **deferida ao `DOMContentLoaded`** (não abortar o parse).
- **Idioma:** pt-BR. **Fonte:** Manrope local (`next/font/local`, woff2 em `public/fonts`, `display: swap`).
- **Paleta:** teal `#0F5C52`, deep `#0A3F38`, mint `#6FD6C0`, mint-l `#C6E1D8`, creme `#F6F3EE`, ink `#12211F`.
- **Acessibilidade:** WCAG 2.2 AA. Cada componente nasce acessível (labels, foco visível, semântica, alt, canvas `aria-hidden`); respeitar `prefers-reduced-motion` em todas as camadas. Contraste AA — mint só em texto grande/decorativo.
- **Segurança:** nenhuma chave no browser; inserts via route handler; honeypot `website`; env server-side (`process.env`, não `PUBLIC_`).
- **Banco:** tabelas `test_signups`/`feedback` JÁ existem (RLS insert-only) no projeto `yuhcttcjidsrsdgzxdqv`. **Nenhuma migração nova.**
- **Assets:** `public/fonts/manrope-{500,700,800}.woff2`, `public/brand/glifo-{branco,teal}.png`, `public/screenshots/*.webp`, `public/og.png`, `public/favicon.png` já existem (reusar).

---

## File Structure

- **Tooling/base:** `package.json`, `next.config.mjs`, `jsconfig.json`, `vitest.config.js`, `.gitignore`; remover `astro.config.mjs`, `tsconfig.json`, `src/` (Astro).
- **App Router:** `app/layout.js`, `app/globals.css`, `app/page.js`, `app/politica-de-privacidade/page.js`, `app/exclusao-de-conta/page.js`, `app/sitemap.js`, `app/robots.js`, `app/api/{signup,feedback}/route.js`.
- **Componentes:** `Landing.js`, `Nav.js`, `Hero.js`, `Manifesto.js`, `HowItWorks.js`, `Features.js`, `Gallery.js`, `TestCta.js`, `FeedbackForm.js`, `Faq.js`, `Footer.js`, `InviteOverlay.js`, `ParticleField.js`, `ParticleGlyph.js`.
- **Lib:** `lib/inviteToken.js` (+test), `lib/validation.js` (+test), `lib/supabase.js`.

---

### Task 1: Scaffold Next.js + design system (tokens/fonte)

**Files:**
- Create: `package.json`, `next.config.mjs`, `jsconfig.json`, `vitest.config.js`, `app/layout.js`, `app/globals.css`, `app/page.js` (placeholder)
- Modify: `.gitignore`
- Delete: `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/` (todo o Astro: `src/pages`, `src/layouts`, `src/components`, `src/styles`, `src/lib`)
- Keep: `public/` (assets), `legacy/`, `docs/`

**Interfaces:**
- Produces: layout raiz com `<html lang="pt-BR" class={manrope.variable}>`; tokens CSS em `app/globals.css` (`--teal --deep --mint --mint-l --cream --ink`, escala `clamp()`, `--ease`, `.visually-hidden`, reduced-motion global); classe utilitária `data-animate` (estilo base pré-JS: visível).

- [ ] **Step 1: Remover o Astro** — apagar `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts` e a pasta `src/` inteira. (O código de `src/lib/{inviteToken,validation}` é reintroduzido, já em JS, nas Tasks 2 e 7 — o código completo está neste plano, não dependa dos arquivos removidos.)

```bash
git rm -r src astro.config.mjs tsconfig.json vitest.config.ts
```

- [ ] **Step 2: package.json**

```json
{
  "name": "mylittle-site",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "gsap": "^3.12.5",
    "@gsap/react": "^2.1.1",
    "lenis": "^1.1.14",
    "@supabase/supabase-js": "^2"
  },
  "devDependencies": {
    "vitest": "^2"
  }
}
```
(Confirme as versões atuais no npm. `@axe-core/playwright` + `playwright` são adicionados na Task 10, não agora.)

- [ ] **Step 3: next.config.mjs**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
}
export default nextConfig
```

- [ ] **Step 4: jsconfig.json**

```json
{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }
```

- [ ] **Step 5: vitest.config.js**

```js
import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { environment: 'node', include: ['lib/**/*.test.js'] } })
```

- [ ] **Step 6: .gitignore** — garantir: `node_modules`, `.next`, `out`, `.vercel`, `.env`, `dist` (remover `.astro`).

- [ ] **Step 7: app/layout.js** — Manrope local + skip-link + script inline de reduced-motion (o script de convite entra na Task 2; SEO/metadata na Task 9). Base:

```jsx
import localFont from 'next/font/local'
import './globals.css'

const manrope = localFont({
  src: [
    { path: '../public/fonts/manrope-500.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/manrope-700.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/manrope-800.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata = { title: 'Meu Cuidado', description: 'Meu Cuidado' } // completo na Task 9

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} no-js`}>
      <head>
        {/* Detecta reduced-motion e no-js ANTES do paint (padrão do abisay: app/layout.js) */}
        <script dangerouslySetInnerHTML={{ __html:
          `document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js');` +
          `if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('reduced')}`
        }} />
      </head>
      <body>
        <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 8: app/globals.css** — tokens + reset leve + reduced-motion + `.visually-hidden` + `.skip-link` + base `data-animate`. Referência de organização: `C:\www\abisay\app\globals.css` (linhas 1-51 tokens, 149-151 reduced-motion). Adapte os valores para a paleta teal:

```css
:root{
  --teal:#0f5c52; --deep:#0a3f38; --mint:#6fd6c0; --mint-l:#c6e1d8; --cream:#f6f3ee; --ink:#12211f;
  --font: var(--font-manrope), system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --ease: cubic-bezier(0.22,1,0.36,1);
  --maxw:1240px; --pad-x:clamp(20px,5vw,64px);
  --fs-display:clamp(2.4rem,6vw,4.4rem); --fs-h2:clamp(1.7rem,3.6vw,2.6rem);
  --fs-lead:clamp(1.05rem,1.6vw,1.28rem); --fs-body:1rem;
  --space-8:8px; --space-12:12px; --space-16:16px; --space-24:24px; --space-40:40px; --space-64:64px;
}
*{box-sizing:border-box;margin:0}
html{scroll-behavior:smooth}
body{font-family:var(--font);color:var(--ink);background:var(--cream);line-height:1.5;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}
:where(a,button):focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.skip-link{position:absolute;left:-999px;top:8px;background:var(--teal);color:#fff;padding:10px 16px;border-radius:8px;z-index:100}
.skip-link:focus{left:8px}
.no-js [data-animate]{opacity:1 !important;transform:none !important}
@media (prefers-reduced-motion: reduce){
  html{scroll-behavior:auto}
  *{animation-duration:.001ms !important;transition-duration:.001ms !important}
}
```

- [ ] **Step 9: app/page.js placeholder**

```jsx
export default function Home() {
  return <main id="conteudo"><h1 style={{ color: 'var(--teal)', padding: '64px' }}>Meu Cuidado</h1></main>
}
```

- [ ] **Step 10: Instalar e validar** — `npm install`; `npm run dev` → `localhost:3000` mostra o placeholder com Manrope e teal. `npm run build` sem erros. (Next roda em :3000 por padrão — diferente do Astro :4321.)

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js + tokens + Manrope (remove Astro)"
```

---

### Task 2: Convite + páginas legais (CRÍTICO — preserva produção)

**Files:**
- Create: `lib/inviteToken.js`, `lib/inviteToken.test.js`, `components/InviteOverlay.js`, `app/politica-de-privacidade/page.js`, `app/exclusao-de-conta/page.js`
- Modify: `app/layout.js` (script inline de convite no `<head>`), `app/globals.css` (toggling do overlay), `app/page.js` (montar overlay + `<main class="landing">` placeholder)

**Interfaces:**
- Produces: `parseInviteToken(search): string|null`, `buildDeepLink(token): string`; overlay com `#invite-overlay` e link `#invite-fallback`.

- [ ] **Step 1: Teste falhando** — `lib/inviteToken.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { parseInviteToken, buildDeepLink } from './inviteToken.js'

describe('inviteToken', () => {
  it('extrai o token', () => { expect(parseInviteToken('?token=abc123')).toBe('abc123') })
  it('null sem token', () => { expect(parseInviteToken('')).toBeNull(); expect(parseInviteToken('?foo=bar')).toBeNull() })
  it('monta o deep link', () => { expect(buildDeepLink('abc123')).toBe('mylittle://invite/abc123') })
})
```

- [ ] **Step 2: Rodar (falha)** — `npm test` → falha.

- [ ] **Step 3: Implementar** — `lib/inviteToken.js`:

```js
export function parseInviteToken(search) {
  const t = new URLSearchParams(search).get('token')
  return t && t.trim() ? t : null
}
export function buildDeepLink(token) {
  return 'mylittle://invite/' + token
}
```

- [ ] **Step 4: Rodar (passa)** — `npm test` verde.

- [ ] **Step 5: Script de convite no `<head>` do `app/layout.js`** — adicionar um segundo `<script dangerouslySetInnerHTML>` DEPOIS do de reduced-motion. Lógica inline (não importa o módulo — roda antes da hidratação), guardada por token:

```js
`(function(){var t=new URLSearchParams(location.search).get('token');if(!t||!t.trim())return;`+
`document.documentElement.dataset.invite='1';var deep='mylittle://invite/'+t;`+
`function go(){location.href=deep;setTimeout(function(){var a=document.getElementById('invite-fallback');`+
`if(a){a.href=deep;a.parentElement.style.display='block';}},2500);}`+
`if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();})();`
```
(Comentar em ambos — `inviteToken.js` e este inline — que o formato `mylittle://invite/<token>` deve ficar em sincronia.)

- [ ] **Step 6: CSS toggling** em `app/globals.css`:

```css
#invite-overlay{display:none}
html[data-invite="1"] .landing{display:none}
html[data-invite="1"] #invite-overlay{display:flex}
```

- [ ] **Step 7: InviteOverlay.js** (server component simples, tema teal): `#invite-overlay` com spinner (`aria-hidden`), texto "Abrindo o convite no aplicativo Meu Cuidado…", e um bloco de fallback (`display:none` inline) com `<a id="invite-fallback" href="#">Abrir no aplicativo</a>`. Spinner via CSS keyframes (gated por reduced-motion).

- [ ] **Step 8: app/page.js** — renderiza `<InviteOverlay/>` e `<main id="conteudo" className="landing">` com placeholder (seções entram nas próximas tasks).

- [ ] **Step 9: Páginas legais** — portar o texto de `legacy/politica-de-privacidade/index.html` e `legacy/exclusao-de-conta/index.html` (texto **idêntico**, só re-tematizado teal, fundo creme, card, links teal). Cada página é um server component com seu `<main id="conteudo">`. Manter links internos `/`, `/politica-de-privacidade/`, `/exclusao-de-conta/`. (SEO/title por página na Task 9.)

- [ ] **Step 10: Verificar** — `npm run dev`: `/?token=abc` → overlay aparece, tenta `mylittle://` (browser reclama do esquema — esperado), fallback surge aos 2500ms; `/` sem token → landing; `/politica-de-privacidade/` e `/exclusao-de-conta/` renderizam. `npm run build` → confirmar rotas `politica-de-privacidade/` e `exclusao-de-conta/` geradas (trailing slash). No DOM com token, confirmar que `.landing` E `#invite-overlay` existem (o script NÃO aborta o parse — controller verificará no browser).

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "feat: convite (token) + paginas legais (Next)"
```

---

### Task 3: Landing orquestrador — Lenis + GSAP + Nav + reveal utils

**Files:**
- Create: `components/Landing.js`, `components/Nav.js`
- Modify: `app/page.js` (montar `<Nav/>` e envolver conteúdo no orquestrador), `app/globals.css` (nav, barra de progresso, `.line`/`data-animate`)

**Interfaces:**
- Consumes: nada (base de motion).
- Produces: `<Landing>` ("use client") que instala Lenis + `useGSAP({scope})` central e ativa: reveals `data-animate="up"`, line-mask `data-animate="line"`, nav solidifica, barra de progresso, magnetismo (`data-magnetic`), tilt (`data-tilt`). Todos os componentes seguintes usam esses atributos.

**Referência concreta:** `C:\www\abisay\components\Landing.js` — copie a ARQUITETURA (não o conteúdo): Lenis dinâmico (`Landing.js:26-96`), `useGSAP` único (`:98-162`), nav toggleClass (`:102-106`), progresso (`:109-112`), reveal `data-animate` (`:130-136`), magnetismo (`:53-68`), tilt (`:70-87`), e o gate `body.reduced`/`clearProps` (`:100,114-117`). E `Nav.js` (header fixo + `.nav--solid`).

- [ ] **Step 1: Landing.js** — `"use client"`; `gsap.registerPlugin(useGSAP, ScrollTrigger)`; `useEffect` que importa Lenis dinamicamente só se `!document.documentElement.classList.contains('reduced')`, sincroniza com `ScrollTrigger.update`, roda o `raf` loop e intercepta âncoras internas; `useGSAP(() => { if reduced → gsap.set('[data-animate]',{clearProps:'all'}); return; senão timelines de reveal/line/progress/nav }, { scope: root })`. Envolve `{children}` num `<div ref={root}>` + `<span data-progress>` fixo no topo.

- [ ] **Step 2: Nav.js** — glifo (`/brand/glifo-branco.png`, alt "Meu Cuidado") + wordmark "Meu Cuidado" + botão "Participar do teste" (`href="#testar"`). `data-nav`; vira `.nav--solid` (blur + bg translúcido) no scroll. Foco visível, `<nav aria-label>`.

- [ ] **Step 3: CSS** — `.nav`/`.nav--solid`, `[data-progress]` (barra teal fixa topo, `transform-origin:left;transform:scaleX(0)`), `.line{overflow:hidden}` + `.line__i`, base de `[data-animate]`.

- [ ] **Step 4: page.js** — `<Landing><Nav/> …conteúdo… </Landing>` (o overlay de convite fica fora do Landing, no topo).

- [ ] **Step 5: Verificar** — dev: scroll suave (Lenis), barra de progresso enche, nav solidifica ao rolar; um elemento `data-animate="up"` de teste revela ao entrar na viewport. Ativar reduced-motion no DevTools → sem smooth scroll, conteúdo visível estático. `npm run build` verde.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: landing orquestrador (lenis + gsap) + nav"`

---

### Task 4: Hero + ParticleField (canvas)

**Files:**
- Create: `components/Hero.js`, `components/ParticleField.js`
- Modify: `app/page.js`, `app/globals.css` (cena teal do hero)

**Interfaces:**
- Consumes: assets; atributos de motion da Task 3 (`data-animate="line"|"up"`, `data-magnetic`).
- Produces: `<Hero/>` (cena 1).

**Referência:** hero aprovado em `docs/reference/hero-mock.html` (estrutura/estilo — abrir e portar; imagens em base64 lá viram assets de `public/`). Partículas: `C:\www\abisay\components\StrikeMark.js` (campo de partículas canvas reativo ao ponteiro + flutuação; gate reduced-motion desenha frame estático em `:121-126`).

- [ ] **Step 1: Hero.js** — cena teal (gradiente `radial-gradient(120% 90% at 85% 8%, #1a7d6b 0%, var(--teal) 40%, var(--deep) 100%)`): badge "Em teste fechado · Android"; `<h1>` com `data-animate="line"` e as linhas em `.line>.line__i`, com "quem você ama" em `<span class="hl">` (mint); subtítulo `data-animate="up"`; CTAs "Quero testar →" (`#testar`, `data-magnetic`) e "Como funciona" (`#como-funciona`); mini-stats; celular flutuante (`/screenshots/hoje-light.webp`, `width`/`height` explícitos) com float/tilt suave em CSS (gated). `<ParticleField/>` ao fundo, `aria-hidden`.

- [ ] **Step 2: ParticleField.js** — `"use client"`; canvas full-bleed do hero; partículas mint/mint-l suaves (opacidade baixa, movimento lento senoidal, leve reação ao ponteiro). `aria-hidden="true"`. Se `reduced`, desenha 1 frame estático (sem `requestAnimationFrame`). Limpa no unmount.

- [ ] **Step 3: page.js** — inserir `<Hero/>` como primeira seção do `.landing`.

- [ ] **Step 4: Verificar** — hero fiel ao mock, line-mask reveal na entrada, celular flutua, partículas suaves; responsivo (empilha <720px); reduced-motion desliga entrada+float+partículas. Sem overflow horizontal. Controller verifica no browser.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: hero + campo de particulas (canvas)"`

---

### Task 5: Manifesto + Como funciona (pin + parallax)

**Files:**
- Create: `components/Manifesto.js`, `components/HowItWorks.js`
- Modify: `app/page.js`, `app/globals.css`

**Interfaces:**
- Produces: `<Manifesto/>` (cena creme), `<HowItWorks/>` (`#como-funciona`).

**Referência:** pin/parallax via ScrollTrigger — padrão de `C:\www\abisay\components\Landing.js:139-151` (parallax por `scrub`). Para pin, `ScrollTrigger` com `pin:true` na seção do HowItWorks (adicionar ao `useGSAP` central).

- [ ] **Step 1: Manifesto.js** — cena creme, uma frase-manifesto forte (pt-BR) sobre o cuidado, com `data-animate="line"` (reveal por linha). Respiro (padding generoso). `<h2>`.

- [ ] **Step 2: HowItWorks.js** — `id="como-funciona"`, `<h2>`; 3 passos (1 cadastra o remédio → 2 recebe o lembrete → 3 marca como tomado) como `<ol>` semântico (`<li>` com número decorativo `aria-hidden`, ícone SVG inline, título `<h3>`, texto). Marcar a seção com `data-pin` e os passos com `data-animate="up"` + stagger.

- [ ] **Step 3: Motion** — no `useGSAP` central (Task 3), adicionar: pin da seção `#como-funciona` (`pin:true`, `scrub`) com os passos avançando; parallax leve nos ícones. Tudo pulado sob `reduced`.

- [ ] **Step 4: page.js** — inserir `<Manifesto/>` e `<HowItWorks/>` após o Hero.

- [ ] **Step 5: Verificar** — reveal por linha no manifesto; a seção "segura" (pin) enquanto os passos entram; sem travar o scroll; reduced-motion ok; `<ol>/<li>` presentes (a11y). `npm run build` verde.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: manifesto + como funciona (pin + parallax)"`

---

### Task 6: Recursos + Galeria imersiva

**Files:**
- Create: `components/Features.js`, `components/Gallery.js`
- Modify: `app/page.js`, `app/globals.css`

**Interfaces:**
- Produces: `<Features/>` (4 pilares), `<Gallery/>` (cena teal escura).

**Referência:** stagger/parallax de listas e imagens — `C:\www\abisay\components\Landing.js:142-151`.

- [ ] **Step 1: Features.js** — `<h2>` + 4 cards (títulos verbatim: "Lembretes na hora certa", "Cuide da família", "Tudo organizado", "Claro & escuro") com texto curto pt-BR e screenshot webp: `hoje-light`, `pessoas-light`, `remedios-light`, e o par `hoje-light`+`hoje-dark` no card de tema. `data-animate="up"` + stagger; hover levanta o card (`transform` gated por reduced-motion); `width`/`height` nas imagens; `alt` significativo.

- [ ] **Step 2: Gallery.js** — cena teal escura, `<h2>` "Conheça as telas"; showcase das 6 telas (`/screenshots/*.webp`) em molduras, com parallax por `scrub` (colunas em velocidades levemente diferentes). `overflow:hidden` no wrapper; NÃO hijack de scroll; SEM overflow horizontal do body; `loading="lazy"`; `alt`. Reduced-motion → estático.

- [ ] **Step 3: page.js** — inserir `<Features/>` e `<Gallery/>` após "Como funciona".

- [ ] **Step 4: Verificar** — cards revelam com stagger e hover; galeria com parallax suave; SEM scrollbar horizontal (`documentElement.scrollWidth <= innerWidth`) em 375px e 1280px; reduced-motion ok. Controller verifica no browser.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: recursos + galeria imersiva"`

---

### Task 7: validation (TDD) + supabase + route handlers

**Files:**
- Create: `lib/validation.js`, `lib/validation.test.js`, `lib/supabase.js`, `app/api/signup/route.js`, `app/api/feedback/route.js`
- Create (local, não commitar): `.env` com `SUPABASE_URL`, `SUPABASE_ANON_KEY` (o controller já tem os valores; `.env` é gitignored)

**Interfaces:**
- Produces: `isValidEmail(s)`, `sanitize(s,max)`, `isBot(body)`, `validateSignup(body)`, `validateFeedback(body)`, `getSupabaseClient()`; endpoints `POST /api/signup`, `POST /api/feedback`.

- [ ] **Step 1: Teste falhando** — `lib/validation.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { isValidEmail, isBot, validateSignup, validateFeedback, sanitize } from './validation.js'

describe('validation', () => {
  it('valida email', () => { expect(isValidEmail('a@b.com')).toBe(true); expect(isValidEmail('nope')).toBe(false) })
  it('honeypot', () => { expect(isBot({ website: 'x' })).toBe(true); expect(isBot({})).toBe(false) })
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
  it('sanitize corta no max e trima', () => {
    expect(sanitize('  hi  ', 10)).toBe('hi')
    expect(sanitize('x'.repeat(300), 5)).toBe('xxxxx')
    expect(sanitize('   ', 10)).toBe('')
  })
})
```

- [ ] **Step 2: Rodar (falha)** — `npm test`.

- [ ] **Step 3: Implementar `lib/validation.js`**

```js
const MAX = { name: 120, email: 200, kind: 20, message: 2000 }
const FEEDBACK_KINDS = ['bug', 'ideia', 'elogio', 'outro']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(s) { return typeof s === 'string' && EMAIL_RE.test(s.trim()) }
export function sanitize(s, max) { return typeof s === 'string' ? s.trim().slice(0, max) : '' }
export function isBot(body) {
  return !!(body && typeof body === 'object' && typeof body.website === 'string' && body.website.trim() !== '')
}
export function validateSignup(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'dados invalidos' }
  const name = sanitize(body.name, MAX.name)
  const email = sanitize(body.email, MAX.email)
  if (!name) return { ok: false, error: 'nome obrigatorio' }
  if (!isValidEmail(email)) return { ok: false, error: 'email invalido' }
  return { ok: true, data: { name, email, source: 'site' } }
}
export function validateFeedback(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'dados invalidos' }
  const kind = sanitize(body.kind, MAX.kind)
  const message = sanitize(body.message, MAX.message)
  const name = body.name ? sanitize(body.name, MAX.name) : null
  if (!FEEDBACK_KINDS.includes(kind)) return { ok: false, error: 'tipo invalido' }
  if (!message) return { ok: false, error: 'mensagem obrigatoria' }
  return { ok: true, data: { name, kind, message } }
}
```

- [ ] **Step 4: Rodar (passa)** — `npm test` verde.

- [ ] **Step 5: lib/supabase.js**

```js
import { createClient } from '@supabase/supabase-js'
let client
export function getSupabaseClient() {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL/SUPABASE_ANON_KEY')
  client = createClient(url, key, { auth: { persistSession: false } })
  return client
}
```

- [ ] **Step 6: Endpoints** — `app/api/signup/route.js`:

```js
import { getSupabaseClient } from '@/lib/supabase'
import { isBot, validateSignup } from '@/lib/validation'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    if (isBot(body)) return Response.json({ ok: true })
    const v = validateSignup(body)
    if (!v.ok) return Response.json({ ok: false, error: v.error }, { status: 400 })
    const { error } = await getSupabaseClient().from('test_signups').insert(v.data)
    if (error) return Response.json({ ok: false, error: 'db' }, { status: 500 })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
```
`app/api/feedback/route.js`: idem, importando `validateFeedback`, inserindo em `'feedback'`.

- [ ] **Step 7: Verificar** — `npm run dev`; usar marcador `__e2e_probe__` (controller limpa via Supabase). `curl -X POST localhost:3000/api/signup -H 'Content-Type: application/json' -d '{"name":"__e2e_probe__","email":"a@b.com"}'` → `{ok:true}`; e-mail inválido → 400; honeypot (`"website":"x"`) → 200 sem inserir; idem `/api/feedback`. Reportar as linhas-marcador. `npm test` verde; `npm run build` verde.

- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: endpoints signup/feedback + validacao (TDD)"`

---

### Task 8: Forms (TestCta + ParticleGlyph, FeedbackForm)

**Files:**
- Create: `components/TestCta.js`, `components/FeedbackForm.js`, `components/ParticleGlyph.js`
- Modify: `app/page.js`, `app/globals.css`

**Interfaces:**
- Consumes: `POST /api/signup`, `POST /api/feedback`; `isValidEmail` de `lib/validation.js`.

**Referência:** "assembly" de partículas — `C:\www\abisay\components\ParticleMark.js` (partículas formam o símbolo via `IntersectionObserver`; gate reduced-motion frame estático).

- [ ] **Step 1: TestCta.js** — `"use client"`; `id="testar"`, cena mint; copy do teste fechado; `<form method="post" onSubmit>` (nome, e-mail `type="email"`, honeypot `website` em `.visually-hidden` + `aria-hidden` + `tabIndex={-1}` + `autoComplete="off"`). `handleSubmit`: `e.preventDefault()`; validação client (nome + `isValidEmail`); `fetch('/api/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,website})})`; estados `idle|enviando|ok|erro` (botão desabilita em enviando); sucesso: "Valeu! Em breve te enviamos o link do teste."; status em `role="status" aria-live="polite"`. `<label htmlFor>` reais (use `useId`). `<ParticleGlyph/>` decorativo (`aria-hidden`).

- [ ] **Step 2: ParticleGlyph.js** — `"use client"`; canvas que amostra os pixels de `/brand/glifo-teal.png` (ou branco) e faz as partículas convergirem para formar o glifo quando a seção entra na viewport (`IntersectionObserver`). Cores mint suaves. `aria-hidden`. Reduced-motion → desenha o glifo montado estático.

- [ ] **Step 3: FeedbackForm.js** — `"use client"`; form (nome opcional, `kind` `<select>` [bug/ideia/elogio/outro] com labels pt-BR e values exatos, mensagem `<textarea>`, honeypot). `fetch('/api/feedback')`; mesmos estados + `aria-live`; labels reais.

- [ ] **Step 4: page.js** — inserir `<TestCta/>` e `<FeedbackForm/>` após a Galeria.

- [ ] **Step 5: Verificar** — enviar os dois forms no dev (marcador `__e2e_probe__`) → controller confirma linhas e limpa; e-mail inválido/mensagem vazia bloqueiam client-side; honeypot → sucesso sem inserir; teclado/labels/foco ok; `method="post"` (sem `?name=` na URL no fallback). Partículas montam o glifo ao entrar; reduced-motion estático. `npm run build` verde.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: forms testar/feedback + particulas do glifo"`

---

### Task 9: FAQ + Footer + SEO (metadata/sitemap/robots)

**Files:**
- Create: `components/Faq.js`, `components/Footer.js`, `app/sitemap.js`, `app/robots.js`
- Modify: `app/layout.js` (metadata/OG/JSON-LD), `app/page.js`, `app/politica-de-privacidade/page.js`, `app/exclusao-de-conta/page.js` (metadata por página)
- Delete: `public/robots.txt` (substituído por `app/robots.js`) — ou manter e não criar `app/robots.js` (escolher um; não ter os dois)

**Interfaces:**
- Produces: `<Faq/>`, `<Footer/>`, sitemap/robots.

- [ ] **Step 1: Faq.js** — cena creme; `<h2>`; acordeão acessível: cada item é `<button aria-expanded aria-controls>` + região `<div id role="region">`, operável por teclado (Enter/Espaço), 1 aberto por vez ou múltiplos (à escolha). 5-6 perguntas pt-BR: teste fechado (como funciona), Android/iOS, privacidade/dados, é gratuito, como recebo o link, como dou feedback. Reduced-motion: sem animação de altura.

- [ ] **Step 2: Footer.js** — cena teal; links "Política de Privacidade" (`/politica-de-privacidade/`), "Exclusão de conta" (`/exclusao-de-conta/`), "Contato" (`mailto:abisaytech@gmail.com`), © + `new Date().getFullYear()` Meu Cuidado. `<footer>`, foco visível.

- [ ] **Step 3: SEO no layout** — `export const metadata` completo em `app/layout.js`: `metadataBase: new URL('https://cuidado.abisay.tech')`, `title` template, `description` pt-BR, `alternates.canonical`, `openGraph` (title/description/url/images `/og.png`/type website/locale pt_BR/siteName), `twitter` (summary_large_image). JSON-LD `SoftwareApplication` via `<script type="application/ld+json" dangerouslySetInnerHTML>` no layout (nome "Meu Cuidado", `applicationCategory:"HealthApplication"`, `operatingSystem:"Android"`, `offers` price "0"/BRL).

- [ ] **Step 4: sitemap/robots** — `app/sitemap.js` retorna as 3 URLs (`/`, `/politica-de-privacidade/`, `/exclusao-de-conta/`) com `metadataBase`. `app/robots.js` (`rules: allow /`, `sitemap: 'https://cuidado.abisay.tech/sitemap.xml'`). Remover `public/robots.txt` para não conflitar.

- [ ] **Step 5: Títulos reais por página** — `export const metadata` em `app/page.js` (title "Meu Cuidado — Lembretes de remédios para você e quem você cuida" + description) e nas duas legais (títulos/descrições próprios).

- [ ] **Step 6: page.js** — inserir `<Faq/>` após o Feedback e `<Footer/>` no fim.

- [ ] **Step 7: Verificar** — `npm run build`; grep no HTML de `.next`/produção-preview: canonical/OG/twitter/JSON-LD com `https://cuidado.abisay.tech`; `/sitemap.xml` e `/robots.txt` (do `app/robots.js`) servidos; FAQ operável por teclado. Commit:

```bash
git add -A && git commit -m "feat: FAQ + footer + SEO (OG, JSON-LD, sitemap)"
```

---

### Task 10: Acessibilidade — auditoria WCAG 2.2 AA (gate)

**Files:**
- Create: `tests/a11y.spec.js` (Playwright + axe), `docs/reference/contraste-aa.md` (tabela de pares)
- Modify: `package.json` (devDeps: `@axe-core/playwright`, `@playwright/test`), correções pontuais nos componentes conforme achados

**Interfaces:**
- Produces: suíte axe verde (zero violações críticas/sérias) nas 3 rotas + estados dos forms.

- [ ] **Step 1: Instalar** — `npm i -D @axe-core/playwright @playwright/test` e `npx playwright install chromium`.

- [ ] **Step 2: Teste axe** — `tests/a11y.spec.js`: para cada rota (`/`, `/politica-de-privacidade/`, `/exclusao-de-conta/`), abrir no dev server, rodar `AxeBuilder` e `expect(results.violations.filter(v => ['critical','serious'].includes(v.impact))).toEqual([])`. Incluir um caso que preenche/submete o form e checa o estado de erro/sucesso (aria-live). Exemplo:

```js
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const path of ['/', '/politica-de-privacidade/', '/exclusao-de-conta/']) {
  test(`a11y ${path}`, async ({ page }) => {
    await page.goto('http://localhost:3000' + path)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()
    const serious = results.violations.filter(v => ['critical','serious'].includes(v.impact))
    expect(serious).toEqual([])
  })
}
```

- [ ] **Step 3: Rodar + corrigir** — subir o dev server; `npx playwright test tests/a11y.spec.js`. Para cada violação: corrigir no componente (contraste, label, role, foco, heading, alt). Repetir até zero críticas/sérias. **Atenção ao contraste do mint sobre teal** — se axe apontar, escurecer o mint no texto ou usar creme/branco.

- [ ] **Step 4: Tabela de contraste** — documentar em `docs/reference/contraste-aa.md` os pares (texto/fundo) usados e seus ratios (≥4.5 normal, ≥3 grande).

- [ ] **Step 5: Manual** — navegar só por teclado ponta-a-ponta (convite/overlay, nav, CTAs, testar, feedback, FAQ) e uma passada de leitor de tela; anotar e corrigir o que travar. (Controller executa/valida no browser.)

- [ ] **Step 6: Lighthouse** — `npm run build && npm start`; rodar Lighthouse a11y (controller) — meta ≥ 95; corrigir gaps.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "test: auditoria a11y WCAG AA (axe) + correcoes"`

---

### Task 11: Deploy Vercel + verificação em produção

**Files:** — (nenhum de código; a Vercel re-detecta Next pelo `package.json`)

- [ ] **Step 1: Envs** — confirmar que `SUPABASE_URL` e `SUPABASE_ANON_KEY` já estão no projeto Vercel `project-n4b32` (Production/Preview) — já configuradas na v1; nada a fazer além de conferir.

- [ ] **Step 2: Deploy** — mergear/push na `main` (a Vercel builda; **confirmar que o framework preset mudou para Next.js** no build log — o projeto era Astro). O adapter Astro some; Next gera as funções `/api/*` nativamente.

- [ ] **Step 3: Verificar produção** em `https://cuidado.abisay.tech`:
  - `/` landing com motion; `/?token=teste` → overlay + deep link + fallback; `mylittle.vercel.app/?token=teste` → 307 preservando o token.
  - `/politica-de-privacidade/` e `/exclusao-de-conta/` abrem (texto preservado, mesmas URLs).
  - `POST /api/signup` e `/api/feedback` reais (marcador) → linhas nas tabelas → controller limpa.
  - a11y: axe/Lighthouse contra produção sem violações sérias.
  - **Teste de convite ponta-a-ponta com app real** (dispositivo) — item do usuário.

- [ ] **Step 4: Commit final / tag** — se tudo verde, `git commit --allow-empty -m "chore: site v2 (Next.js) em producao"`.

---

## Notas de execução

- `npm test` deve ficar verde a partir da Task 2 (inviteToken) e Task 7 (validation).
- Tasks visuais/motion (3,4,5,6,8) verificam por build + inspeção no browser (o controller roda o dev server e checa DOM/console/overflow/reduced-motion, como na v1).
- **Maior risco = Task 2** (convite): validar no browser que o script NÃO aborta o parse (overlay + landing + fallback no DOM com token) antes de seguir.
- **a11y é gate (Task 10)** e também responsabilidade de cada componente — não deixar tudo pro fim.
- Reusar sempre os assets já em `public/` e o `abisay` (`C:\www\abisay`) como referência de motion.
- Next roda em **:3000** (não :4321).
