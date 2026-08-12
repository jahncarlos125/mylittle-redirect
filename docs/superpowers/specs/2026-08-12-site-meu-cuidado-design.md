# Site "Meu Cuidado" — Design (spec)

**Data:** 2026-08-12
**Repo:** `jahncarlos125/mylittle-redirect` (Vercel, domínio `mylittle.vercel.app`)
**Objetivo:** transformar o repo (hoje só HTMLs estáticos: redirect de convite + páginas legais) em um **site de marketing** do app Meu Cuidado — landing page rica em motion, captação de testadores e feedback — **preservando** as URLs e o deep link de convite existentes.

---

## 1. Objetivos e critérios de sucesso

- Landing profissional e "com personalidade" (motion), coesa com o **rebrand teal/sálvia** do app.
- **Captar testadores** do teste fechado via formulário (coleta e-mail → o dono adiciona na lista do Play).
- **Coletar feedback** via formulário no próprio site.
- **SEO**: aparecer no Google por termos como "app lembrete de remédios".
- **Não quebrar nada** do que já existe:
  - `https://mylittle.vercel.app/?token=<token>` → deep link `mylittle://invite/<token>` (fonte: `inviteService.ts:34` do app).
  - `/politica-de-privacidade/` e `/exclusao-de-conta/` acessíveis nas mesmas URLs.

## 2. Restrições (Global Constraints)

- **Domínio:** `mylittle.vercel.app`. Meta/OG/sitemap usam essa origem.
- **URLs preservadas exatamente:** `/`, `/politica-de-privacidade/`, `/exclusao-de-conta/`.
- **Deep link de convite:** a raiz `/` DEVE, quando houver `?token=`, redirecionar para `mylittle://invite/<token>` com fallback visível (comportamento idêntico ao `index.html` atual). Sem token → mostra a landing.
- **Idioma:** pt-BR apenas.
- **Paleta (marca sálvia):** teal `#0F5C52`, teal profundo `#0A3F38`, mint `#6FD6C0`, mint claro `#C6E1D8`, creme `#F6F3EE`, texto escuro `#12211F`.
- **Tipografia:** Manrope (500/700/800), servida localmente (woff2 em `public/fonts`, `font-display: swap`).
- **Acessibilidade:** respeitar `prefers-reduced-motion` (desligar animações não essenciais); contraste AA; foco visível; formulários com labels.
- **Sem chave sensível no browser:** inserts no Supabase passam por endpoint server-side.

## 3. Stack e arquitetura

- **Astro** (latest — confirmar a versão instalada e ler os docs versionados antes de codar) + `@astrojs/vercel` (adapter) + `@astrojs/react` (islands) + `@astrojs/sitemap`.
- **Framer Motion** nas ilhas React (entrada do hero, reveal-on-scroll, parallax da galeria).
- **Modo de render:** Astro 5 não tem mais `output: 'hybrid'`. Usar `output: 'server'` (com adapter Vercel) e marcar cada **página** com `export const prerender = true` (vira estática) e cada **endpoint de API** com `export const prerender = false` (vira função serverless). Confirmar a sintaxe exata contra os docs da versão instalada.
- **Deploy:** Vercel, mesmo repo.
- **Dados:** Supabase (reusa o projeto `yuhcttcjidsrsdgzxdqv`), 2 tabelas novas + RLS insert-only. Endpoints usam a **anon key** (via env server-side) com validação + honeypot anti-bot.

### Estrutura de arquivos
```
astro.config.mjs
package.json
tsconfig.json
vercel.json                      (se necessário p/ headers)
public/
  fonts/manrope-{500,700,800}.woff2
  brand/glifo-branco.png, glifo-teal.svg
  screenshots/{hoje,pessoas,remedios,editar}-{light,dark}.webp
  og.png                          (preview social 1200x630)
  favicon.png
src/
  layouts/Base.astro              (<head>, meta, OG, fonts, JSON-LD)
  pages/
    index.astro                   (landing + overlay de convite)
    politica-de-privacidade/index.astro
    exclusao-de-conta/index.astro
    api/signup.ts                 (POST → test_signups)   prerender=false
    api/feedback.ts               (POST → feedback)        prerender=false
  components/
    Nav.astro
    Hero.tsx            (island — entrada + celular flutuante)
    Features.astro      (+ Reveal wrapper)
    HowItWorks.astro
    Gallery.tsx         (island — carrossel/parallax das telas)
    TestCta.tsx         (island — form "Quero testar")
    FeedbackForm.tsx    (island — form de feedback)
    Footer.astro
    Reveal.tsx          (island util — reveal-on-scroll via Framer Motion)
    InviteRedirect.astro(overlay + <script is:inline> do deep link)
  lib/
    supabase.ts         (cria client server-side com anon key)
    validation.ts       (validação de e-mail/campos, honeypot)
  styles/tokens.css     (variáveis da paleta + escala de espaçamento)
```

## 4. Comportamento da raiz `/` (landing + convite)

`index.astro` renderiza a landing normalmente. `InviteRedirect.astro` injeta, no **início** do documento, um `<script is:inline>`:

```js
(function () {
  var t = new URLSearchParams(location.search).get('token');
  if (!t) return;                 // sem token → landing normal
  document.documentElement.dataset.invite = '1';  // CSS esconde a landing, mostra overlay
  var deep = 'mylittle://invite/' + t;
  location.href = deep;
  setTimeout(function () {
    var a = document.getElementById('invite-fallback');
    if (a) { a.href = deep; a.parentElement.style.display = 'block'; }
  }, 2500);
})();
```

CSS: `html[data-invite="1"] .landing { display:none } html[data-invite="1"] #invite-overlay { display:flex }`. O overlay replica a UI atual ("Abrindo o convite no aplicativo…" + spinner + botão de fallback), agora no tema teal. SEO não é afetado (o conteúdo real da landing continua no HTML).

## 5. Seções da landing

1. **Nav** — glifo + "Meu Cuidado" + botão "Participar do teste" (scroll até o CTA).
2. **Hero** — badge "Em teste fechado · Android", headline *"Nunca esqueça um remédio — o seu e o de quem você ama"* (com "quem você ama" em mint), subtítulo, CTAs "Quero testar →" / "Como funciona", mini-stats, celular flutuante com a tela Hoje. Motion: entrada em stagger, float do celular, glow respirando. (Mockup aprovado.)
3. **Features** — 4 cards com screenshots reais: *Lembretes na hora certa · Cuide da família · Tudo organizado · Claro & escuro*. Reveal-on-scroll.
4. **Como funciona** — 3 passos: cadastra o remédio → recebe o lembrete → marca como tomado.
5. **Galeria** — telas do app em carrossel/rolagem com parallax sutil.
6. **CTA de teste** — bloco forte com o **formulário "Quero testar"** (nome + e-mail) e um resumo de como funciona o teste fechado.
7. **Feedback** — **formulário de feedback** (nome + tipo [bug/ideia/elogio] + mensagem).
8. **Footer** — links: Política de Privacidade · Exclusão de conta · Contato (mailto) · © Meu Cuidado.

## 6. Formulários e backend

### Tabelas (Supabase, projeto `yuhcttcjidsrsdgzxdqv`)
```sql
create table public.test_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  source text default 'site',
  created_at timestamptz default now()
);
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  kind text not null check (kind in ('bug','ideia','elogio','outro')),
  message text not null,
  created_at timestamptz default now()
);
alter table public.test_signups enable row level security;
alter table public.feedback enable row level security;
create policy "anon insert signups" on public.test_signups for insert to anon with check (true);
create policy "anon insert feedback" on public.feedback for insert to anon with check (true);
-- sem policies de select/update/delete → leitura só via dashboard/service role
```

### Endpoints (`prerender = false`)
- `POST /api/signup` — body `{ name, email, website? }`. `website` é **honeypot** (se preenchido → 200 silencioso, ignora). Valida e-mail (regex), nome não vazio, tamanho máx. Insere em `test_signups`. Retorna `{ ok: true }`.
- `POST /api/feedback` — body `{ name?, kind, message, website? }`. Mesma proteção. Insere em `feedback`.
- Ambos: usam `src/lib/supabase.ts` (anon key via `import.meta.env.SUPABASE_URL` / `SUPABASE_ANON_KEY`). Rate-limit simples por IP em memória (best-effort) + honeypot. Sem CAPTCHA (YAGNI).

### Env vars (Vercel)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` (server-side; não `PUBLIC_`).

## 7. Motion (diretrizes)

- Entrada do hero: stagger (badge → h1 → sub → CTAs → celular), `translateY(22px)→0` + fade, 0.7s.
- Celular: float contínuo (6s) + tilt 3°; glow radial mint "respirando".
- Seções: `<Reveal>` (Framer Motion `whileInView`, `once`) com fade-up + leve stagger nos filhos.
- Galeria: parallax sutil no scroll.
- Hover: cards levantam (`translateY(-4px)` + sombra), botões com transição.
- **`prefers-reduced-motion`**: todas as animações não essenciais viram fade simples/instantâneo.

## 8. SEO

- `<title>` + `<meta description>` pt-BR; canonical `https://mylittle.vercel.app/`.
- Open Graph + Twitter card com `og.png` (1200×630, reaproveita o gráfico de destaque teal).
- JSON-LD `SoftwareApplication` (nome, categoria "MedicalApplication/HealthApp", sistema Android, preço 0).
- `@astrojs/sitemap` + `robots.txt`.
- HTML semântico, headings hierárquicos, `alt` nas imagens, imagens em `webp` com `width/height` (evita CLS).

## 9. Deploy / migração do repo

- Repo passa de "HTML estático" para "projeto Astro" (mantém `.git`).
- Vercel detecta Astro automaticamente (framework preset). Adapter Vercel gera estáticos + funções.
- Build gera `/politica-de-privacidade/index.html` e `/exclusao-de-conta/index.html` nas MESMAS URLs.
- `vercel.json` só se preciso (ex.: headers de cache/segurança). Redirects não são necessários (rotas casam 1:1).
- Conteúdo legal: **migrar o texto atual** das páginas (privacidade/exclusão) para os `.astro`, apenas re-tematizando (teal) — o texto jurídico é mantido íntegro.

## 10. Fora de escopo (YAGNI)

- i18n (só pt-BR), blog, autenticação/login no site, painel admin (usa-se o dashboard do Supabase para ler signups/feedback), analytics avançado, notificação por e-mail de novo signup (possível fase 2), A/B testing, CAPTCHA.

## 11. Verificação

- `?token=abc` → redireciona pro app + fallback; sem token → landing (testável localmente).
- `/politica-de-privacidade/` e `/exclusao-de-conta/` retornam o conteúdo (texto preservado).
- `POST /api/signup` e `/api/feedback` inserem nas tabelas; honeypot bloqueia bot; e-mail inválido rejeitado.
- Lighthouse: Performance/SEO/Best-Practices altos; sem CLS perceptível.
- `prefers-reduced-motion` desliga o motion.
- Build da Vercel verde; URLs preservadas em produção.
