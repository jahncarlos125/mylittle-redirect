# Site "Meu Cuidado" v2 (Next.js + GSAP) — Design (spec)

**Data:** 2026-08-13
**Repo:** `jahncarlos125/mylittle-redirect` (Vercel, projeto `project-n4b32`, domínio `cuidado.abisay.tech`)
**Objetivo:** Reconstruir a landing do app **Meu Cuidado** com a mesma stack e pegada de motion do site `abisay.tech` (Next.js 14 + GSAP + Lenis + Canvas 2D), **repensando o layout** com uma narrativa em cenas, mantendo a **paleta teal** e a **fonte Manrope** já existentes, elevando o motion (scroll effects, parallax, partículas) e atingindo **acessibilidade WCAG 2.2 AA testada** — **sem quebrar** nenhum contrato de produção (convite, URLs, endpoints, deploy).

Substitui a implementação atual em Astro (mesma pasta/repo), numa branch nova.

---

## 1. Objetivos e critérios de sucesso

- Landing profissional e "com personalidade", coesa com o rebrand teal/sálvia, no nível de motion do `abisay.tech`.
- **Captar testadores** (form "Quero testar") e **coletar feedback** — mesmos endpoints/tabelas já em produção.
- **SEO** preservado/melhorado (canonical/OG/JSON-LD/sitemap/robots em `cuidado.abisay.tech`).
- **Acessibilidade WCAG 2.2 AA** verificada por testes automatizados (axe-core) + manuais (teclado/leitor de tela). Gate: zero violações críticas/sérias no axe; Lighthouse a11y ≥ 95.
- **Não quebrar produção:**
  - `cuidado.abisay.tech/?token=<t>` (e o legado `mylittle.vercel.app/?token=<t>` que redireciona preservando o token) → deep link `mylittle://invite/<t>` + fallback visível.
  - `/`, `/politica-de-privacidade/`, `/exclusao-de-conta/` nas mesmas URLs (com trailing slash).
  - `POST /api/signup` e `POST /api/feedback` gravando nas tabelas `test_signups`/`feedback` (Supabase `yuhcttcjidsrsdgzxdqv`, RLS insert-only, envs já configuradas na Vercel).

## 2. Restrições (Global Constraints)

- **Stack:** Next.js 14 (App Router), React 18, **JavaScript** (sem TypeScript), **CSS puro com tokens** (sem Tailwind/UI kit) — espelhando o `abisay.tech`. Motion com **GSAP 3 + ScrollTrigger** (via `@gsap/react`/`useGSAP`), **Lenis** (smooth scroll) e **Canvas 2D nativo** (partículas). `@vercel/analytics` opcional.
- **Domínio/SEO:** origem `https://cuidado.abisay.tech`. Canonical/OG/sitemap usam essa origem.
- **URLs preservadas 1:1:** `/`, `/politica-de-privacidade/`, `/exclusao-de-conta/` — via App Router + `trailingSlash: true`.
- **Convite (contrato com o app):** com `?token=` a raiz redireciona para `mylittle://invite/<token>` (formato **exato**, esquema do app — não muda) com fallback visível aos 2500ms; sem token → landing. A navegação para o esquema é **deferida ao `DOMContentLoaded`** (não abortar o parse), com `data-invite` setado sincronicamente para esconder a landing antes do paint.
- **Idioma:** pt-BR. **Fonte:** **Manrope** local (`next/font/local`, woff2 já em `public/fonts`, `display: swap`).
- **Paleta (marca sálvia):** teal `#0F5C52`, teal profundo `#0A3F38`, mint `#6FD6C0`, mint claro `#C6E1D8`, creme `#F6F3EE`, tinta `#12211F`.
- **Acessibilidade:** WCAG 2.2 AA (detalhe na Seção 8). Respeitar `prefers-reduced-motion` em todas as camadas.
- **Segurança:** nenhuma chave sensível no browser; inserts via route handler server-side; honeypot anti-bot.
- Texto jurídico das páginas legais é **migrado íntegro** (só re-tematizado), a partir do que já existe em `legacy/` / nas páginas Astro atuais.

## 3. Stack e arquitetura

- **Next.js 14 App Router** — deploy nativo na Vercel (sem adapter). Páginas estáticas por padrão; route handlers `/api/*` viram serverless functions automaticamente.
- **`next.config.mjs`:** `reactStrictMode: true`, **`trailingSlash: true`** (preserva as URLs com barra). Sem rewrites (rotas casam 1:1).
- **Motion:** um `useGSAP({ scope })` central no orquestrador client (`components/Landing.js`), registrando `ScrollTrigger`; Lenis importado dinamicamente só se motion permitido; Canvas 2D em componentes dedicados.
- **Dados:** Supabase (reusa projeto `yuhcttcjidsrsdgzxdqv`), tabelas `test_signups`/`feedback` **já criadas** (RLS insert-only). Route handlers usam a anon key via env server-side (`SUPABASE_URL`/`SUPABASE_ANON_KEY`), com validação + honeypot. **Nenhuma migração nova de banco** (reusa o que existe).

### Estrutura de arquivos (alvo)
```
next.config.mjs
package.json                     (Next/React/GSAP/@gsap/react/lenis; vitest p/ validação)
jsconfig.json                    (alias @/*)
public/
  fonts/manrope-{500,700,800}.woff2     (já existem)
  brand/glifo-branco.png, glifo-teal.png (já existem)
  screenshots/*.webp                     (já existem)
  og.png, favicon.png, robots.txt        (og/favicon já existem)
app/
  layout.js            (<html lang=pt-BR>, Manrope, metadata/OG/JSON-LD, script inline reduced-motion + convite, skip-link)
  page.js              (landing: renderiza <Landing/>)
  globals.css          (tokens + todo o CSS do site, cenas teal/creme/mint)
  sitemap.js           (/sitemap.xml)  robots via public/robots.txt (ou app/robots.js)
  politica-de-privacidade/page.js
  exclusao-de-conta/page.js
  api/
    signup/route.js    (POST → test_signups)
    feedback/route.js  (POST → feedback)
components/            ("use client" onde necessário)
  Landing.js           (orquestrador: Lenis + useGSAP único + magnetismo/tilt)
  Nav.js               (header fixo que solidifica no scroll; skip-link target)
  Hero.js              (headline line-mask + celular + ParticleField mint)
  Manifesto.js         (frase-manifesto, reveal por linha)   [nova cena]
  HowItWorks.js        (3 passos, pin + parallax)
  Features.js          (4 pilares + screenshots, reveal/parallax)
  Gallery.js           (showcase de telas, parallax/scrub)
  TestCta.js           (form "Quero testar" + ParticleGlyph assembly)
  FeedbackForm.js      (form de feedback)
  Faq.js               (acordeão acessível)                  [nova cena]
  Footer.js
  ParticleField.js     (canvas partículas do hero)
  ParticleGlyph.js     (canvas "assembly" formando o glifo no CTA)
  InviteOverlay.js     (overlay do convite: spinner + fallback)
lib/
  supabase.js          (getSupabaseClient() lazy, anon key server-side)
  validation.js        (isValidEmail, sanitize, isBot, validateSignup, validateFeedback)
  validation.test.js   (vitest — portado do atual)
```

## 4. Comportamento da raiz `/` (landing + convite)

O script de convite roda **inline no `<head>` do `app/layout.js`** (antes do paint), guardado por token (só age quando há `?token=`; as páginas legais nunca têm token, então são inertes):

```js
(function () {
  var t = new URLSearchParams(location.search).get('token');
  if (!t || !t.trim()) return;                 // sem token → landing normal
  document.documentElement.dataset.invite = '1'; // CSS esconde .landing, mostra #invite-overlay (pré-paint)
  var deep = 'mylittle://invite/' + t;
  function go() {
    location.href = deep;                        // deferido: não aborta o parse
    setTimeout(function () {
      var a = document.getElementById('invite-fallback');
      if (a) { a.href = deep; a.parentElement.style.display = 'block'; }
    }, 2500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
```

CSS global: `html[data-invite="1"] .landing { display:none } html[data-invite="1"] #invite-overlay { display:flex }` (overlay `display:none` por padrão). O overlay (`InviteOverlay.js`) replica "Abrindo o convite no aplicativo Meu Cuidado…" + spinner + botão de fallback `#invite-fallback`, no tema teal. SEO intacto (a landing real continua no HTML).

## 5. Layout / seções (narrativa em cenas)

Cenas alternando fundo **teal ↔ creme ↔ mint** (análogo ao ink/paper/copper do abisay), com scroll conduzindo o motion. Tom **acolhedor/saúde**: ritmo calmo, curvas suaves, respiro generoso.

1. **Hero** (cena teal) — badge "Em teste fechado · Android"; headline com **line-mask reveal** *"Nunca esqueça um remédio — o seu e o de <mint>quem você ama</mint>"*; subtítulo; CTAs "Quero testar →" (`#testar`) / "Como funciona" (`#como-funciona`); mini-stats; **celular flutuante** (tela Hoje) com float/tilt suave; **ParticleField** (partículas mint suaves ao fundo).
2. **Manifesto** (cena creme) *[novo]* — uma frase forte sobre o cuidado (problema→cuidado), reveal por linha. Respiro emocional.
3. **Como funciona** (`#como-funciona`) — 3 passos (cadastra → recebe lembrete → marca como tomado) com **pin + parallax** (a seção "segura" enquanto os passos avançam) e ícones SVG.
4. **Recursos** — 4 pilares (Lembretes na hora certa · Cuide da família · Tudo organizado · Claro & escuro) com screenshots reais (webp), reveal + parallax leve, hover que levanta o card.
5. **Galeria imersiva** (cena teal escura) — telas do app em showcase com parallax/scrub (sem hijack de scroll, sem overflow horizontal).
6. **CTA "Quero testar"** (`#testar`, cena mint) — copy do teste fechado + form (nome, e-mail, honeypot) + **ParticleGlyph** (partículas que se juntam formando o glifo do Meu Cuidado ao entrar na viewport).
7. **Feedback** — form (nome opcional, tipo [bug/ideia/elogio/outro], mensagem, honeypot).
8. **FAQ** *[novo]* — acordeão acessível (`<button aria-expanded>` + região): teste fechado, Android/iOS, privacidade/dados, gratuidade, como recebo o link.
9. **Footer** — Política de Privacidade · Exclusão de conta · Contato (`mailto:abisaytech@gmail.com`) · © + ano.

Global: barra de progresso de scroll no topo; nav que solidifica (blur) ao rolar; botões com leve magnetismo (só `hover:hover`/`pointer:fine`).

## 6. Formulários e backend (reuso do que existe)

- **Tabelas** `test_signups` e `feedback` já existem no projeto `yuhcttcjidsrsdgzxdqv` com RLS insert-only. **Sem migração nova.**
- **Route handlers** (`app/api/signup/route.js`, `app/api/feedback/route.js`): `export async function POST(request)`; parseia JSON; `isBot` (honeypot `website`) → 200 silencioso; valida; insere via `getSupabaseClient()` (dentro de try/catch → 500 limpo); retorna `{ok:true}` ou `400/500 {ok:false,error}`.
- **`lib/validation.js`** e **`lib/validation.test.js`** portados do atual (mesmas funções e testes, incluindo os de `sanitize`).
- **`lib/supabase.js`**: `getSupabaseClient()` lazy e memoizado, lendo `process.env`/env server-side, `persistSession:false`. **Não** `PUBLIC_`. Envs já na Vercel.
- Forms client (`TestCta.js`, `FeedbackForm.js`): validação client espelhando o servidor (importa `isValidEmail`), estados `idle/enviando/ok/erro`, honeypot escondido via `.visually-hidden` (clip 1px) + `aria-hidden` + `tabindex=-1`, `method="post"` no `<form>` (sem PII na URL no fallback pré-hidratação), `aria-live` nos status.

## 7. Motion (diretrizes) — mapeamento abisay → Meu Cuidado

Tudo num `useGSAP` central (`components/Landing.js`), com `gsap.registerPlugin(useGSAP, ScrollTrigger)`; Lenis via `import("lenis")` dinâmico. Tom mais calmo (durations ~0.7–1.1s, easing suave `cubic-bezier(0.22,1,0.36,1)`).

- **Smooth scroll (Lenis)** sincronizado com `ScrollTrigger.update`; âncoras internas com scroll suave + offset. Desligado sob reduced-motion.
- **Nav solidifica** (`ScrollTrigger` + `toggleClass`), **barra de progresso** (`scrub`).
- **Line-mask reveal** de títulos (`.line{overflow:hidden}` + `.line__i` sobe de `yPercent:115` com stagger) no hero e no CTA.
- **Reveal genérico** `data-animate="up"` (y:34, opacity:0 → entra a 88% da viewport).
- **Parallax** (fio/coluna do hero por `scrub`; imagens de recursos/galeria com `yPercent` sutil por `scrub`).
- **Pin + parallax** no "Como funciona".
- **Stagger** de listas (recursos, passos, stats).
- **Hover magnético** (`data-magnetic`) e **tilt 3D** (`data-tilt`) só em ponteiro fino; enriquecimento, nunca bloqueiam interação.
- **Canvas de partículas** (2D nativo): `ParticleField` (hero, campo mint suave reativo ao ponteiro) e `ParticleGlyph` (CTA, "assembly" formando o glifo via amostragem dos pixels do PNG, disparado por `IntersectionObserver`). Ambos `aria-hidden`; sob reduced-motion desenham **um frame estático**.

## 8. Acessibilidade (WCAG 2.2 AA) — requisito de primeira classe

**Alvo:** conformidade **AA** (AAA onde viável). É critério de sucesso e tem etapa de teste com gate.

Design/código:
- **Contraste AA** em todo texto (≥4.5:1 normal, ≥3:1 grande/UI). Auditar cada par. **Atenção:** mint `#6FD6C0` sobre teal fica no limite → usar mint só em texto grande (headline) e decorativo; texto corrido em branco/creme/ink. Documentar a tabela de pares de cor.
- **Semântica/landmarks:** `header/nav/main/section/footer`, **um `<h1>`**, hierarquia de headings correta, **skip-link** "pular para o conteúdo".
- **Teclado 100%:** foco visível (`:focus-visible` teal), ordem lógica, FAQ operável por teclado (`button aria-expanded`/`aria-controls`), nada só-mouse.
- **Formulários:** `<label>` reais, erros/sucesso via `aria-live` e não só por cor.
- **Imagens** com `alt`; **canvas `aria-hidden`**.
- **Movimento:** `prefers-reduced-motion` em todas as camadas (script pré-hidratação adiciona `body.reduced`; CSS zera animações; GSAP/Lenis/Canvas desligam). Sem flashes (2.3.1); movimento contínuo respeita reduced-motion (2.2.2).
- **Robustez:** zoom 200% sem quebra, `lang="pt-BR"`, `forced-colors` respeitado, alvos de toque adequados.

Testes (etapa dedicada, com gate):
- **axe-core** automatizado (Playwright) contra `/`, `/politica-de-privacidade/`, `/exclusao-de-conta/` e estados dos forms → **zero violações críticas/sérias**.
- **Lighthouse a11y ≥ 95** no build de produção.
- **Manual:** navegação só-teclado ponta-a-ponta (incl. convite, testar, feedback, FAQ) + passada de leitor de tela.
- Tabela de contraste par-a-par documentada no relatório.

## 9. SEO

- `app/layout.js` via Metadata API: `title`/`description` pt-BR, canonical `https://cuidado.abisay.tech/`, Open Graph + Twitter (`/og.png` 1200×630), JSON-LD `SoftwareApplication` (nome "Meu Cuidado", `applicationCategory: HealthApplication`, `operatingSystem: Android`, `offers` preço 0/BRL).
- `app/sitemap.js` (as 3 rotas) → gera `/sitemap.xml` (formato do Next, **não** `sitemap-index.xml`). `app/robots.js` (ou `public/robots.txt`) apontando `Sitemap: https://cuidado.abisay.tech/sitemap.xml`. HTML semântico, `alt`, imagens webp com dimensões (evita CLS).

## 10. Deploy / migração do repo

- Reescrita numa **branch nova** (worktree) a partir da `main` atual. Substitui os arquivos Astro por Next; remove `astro.config.mjs`, deps Astro, `src/` Astro; adiciona `app/`, `components/`, `lib/`, `next.config.mjs`.
- A Vercel **re-detecta Next.js** pelo `package.json` no próximo build do projeto `project-n4b32` (mesmo domínio `cuidado.abisay.tech`). Envs Supabase já configuradas.
- Rota de verificação em produção idêntica à atual (convite, legais, endpoints) + a11y.

## 11. Fora de escopo (YAGNI)

- i18n (só pt-BR), blog, login no site, painel admin (usa dashboard Supabase), analytics avançado, e-mail de novo signup, A/B testing, CAPTCHA, Three.js/WebGL (partículas são Canvas 2D). Nenhuma mudança no app nativo nem no esquema do banco.

## 12. Verificação

- `npm test` (validação) verde; `npm run build` verde; Next detectado na Vercel.
- Convite: `?token=abc` → overlay + deep link + fallback (2500ms); sem token → landing. Legado `mylittle.vercel.app/?token` preserva token.
- Legais nas mesmas URLs (texto preservado). Endpoints inserem/validam/honeypot em produção.
- **a11y:** axe sem violações sérias, Lighthouse a11y ≥ 95, teclado/leitor de tela ok.
- Motion suave, sem hijack de scroll nem overflow horizontal; reduced-motion desliga tudo.
- Build da Vercel verde em `cuidado.abisay.tech`.
