# Meu Cuidado — guia do projeto (ler isto primeiro)

> Este arquivo é o "cérebro" do projeto. O Claude Code o lê automaticamente ao
> abrir esta pasta. Em uma **máquina nova (Mac)**, diga ao Claude:
> _"leia o CLAUDE.md e faça o setup inicial"_ — ele instala o necessário e
> deixa tudo pronto. Fale em **português**.

---

## 1. O que é o projeto

**Meu Cuidado** — app de **lembretes de remédios** para você e para quem você
cuida (dependentes/família), com convite de cuidadores. **Android, em produção
na Google Play.**

- **App na Play:** https://play.google.com/store/apps/details?id=com.my.little
- **Site de produção:** https://cuidado.abisay.tech (deploy na **Vercel**)
- **Pacote Android:** `com.my.little` · **scheme:** `mylittle`

O projeto são **dois repositórios irmãos** (mantenha-os lado a lado, ex.
`~/www/mylittle-redirect` e `~/www/my-little`):

| Repo | Pasta | O que é | Remote |
|---|---|---|---|
| **Site** (este) | `mylittle-redirect` | Landing institucional + fluxo de convite | `git@github.com:jahncarlos125/mylittle-redirect.git` |
| **App** | `my-little` | App mobile Expo/React Native | `git@github.com:jahncarlos125/my-little.git` |

Os dois se conectam por **Android App Links** de convite (ver §7).

---

## 2. Setup inicial (Mac novo) — passo a passo

### 2.1 Essencial (só pra rodar/editar o SITE)
```bash
# Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node 22 (o site fixa node 22.x) + git
brew install node@22 git
# clonar os dois repos lado a lado
mkdir -p ~/www && cd ~/www
git clone git@github.com:jahncarlos125/mylittle-redirect.git
git clone git@github.com:jahncarlos125/my-little.git

# instalar deps do site e rodar
cd ~/www/mylittle-redirect && npm install && npm run dev   # http://localhost:3000
```

### 2.2 Workflow de prints/mockups (captura no device + geração de imagens)
Necessário só se for **regerar os screenshots** do site/Play (ver §6).
```bash
brew install --cask android-platform-tools           # adb
brew install maestro                                  # automação do app (ou: curl -Ls https://get.maestro.mobile.dev | bash)
brew install scrcpy                                   # espelhar/ver o device (opcional)
brew install python@3.12 && pip3 install Pillow       # processamento de imagem (mockups/Play)
```
- Conecte o(s) device(s) Android por **USB** (ou Wi-Fi: `adb tcpip 5555` + `adb connect <ip>`).
- **Xiaomi/MIUI:** ative **"Instalar via USB"** nas Opções do desenvolvedor, senão o Maestro não instala o driver.

### 2.3 Workflow do APP (buildar/publicar)
```bash
cd ~/www/my-little && npm install
npm i -g eas-cli                                      # builds/submits EAS (requer login Expo)
# iOS (se for mexer em iOS no futuro): brew install cocoapods watchman
```
> O app usa **Expo SDK 55** — SEMPRE leia os docs versionados antes de codar:
> https://docs.expo.dev/versions/v55.0.0/ (ver `my-little/AGENTS.md`).

---

## 3. Skills do Claude usadas neste projeto

Ative via `/plugin` (marketplaces) no Claude Code. Usadas de fato aqui:

- **frontend-design** — direção visual da landing/mockups.
- **ui-ux-pro-max** — responsividade, acessibilidade, não-distorção, checklist.
- **superpowers** — `brainstorming`, `systematic-debugging`, etc. (processo).
- **expo** / **eas-*** — workflow do app (build, update, stores).

> Skills/plugins e connectors são config do **Claude Code/conta**, não ficam no
> repo. Peça ao Claude: _"liste e ative os plugins/skills acima via /plugin"_.

---

## 4. MCPs / Connectors usados

Ative em **claude.ai → Connectors** (OAuth) ou via `/mcp`:

- **Vercel** — deploy/observabilidade do site.
- **Supabase** — backend do app (`@supabase/supabase-js`): auth, dados de
  remédios/dependentes, RPC de convites.
- **GitHub** — PRs/issues. _(Nesta sessão falhou por auth — reconecte em /mcp se precisar.)_
- **Playwright** (plugin) — testar o site em várias larguras com prints.

---

## 5. Stack & estrutura do SITE (este repo)

- **Next.js 14.2.35** (App Router) · **React 18.3** · **Node 22.x** · deploy **Vercel**.
- Motion: **GSAP + ScrollTrigger + Lenis** (orquestrado em `components/Landing.js`).
- Sem Tailwind — **CSS puro** em `app/globals.css` (tokens em `:root`).

```
app/
  page.js         # composição da home (Hero, Manifesto, HowItWorks, Features, Devices, Faq)
  layout.js       # <head>, SEO/JSON-LD, script inline do CONVITE (lê ?token= e /invite/<token>)
  globals.css     # todo o estilo + tokens de marca (teal/cream, Manrope)
  sitemap.js / robots.js
components/        # Hero, Features (cenas), Devices (combo celular+tablet), Faq, Footer, Nav, InviteOverlay…
lib/site.js       # SITE_URL, PLAY_URL, títulos/descrição (SEO)
public/screenshots/*.webp          # mockups (device = imagem ÚNICA, bezel embutido)
public/.well-known/assetlinks.json # Digital Asset Links (App Links)
```

### Marca (tokens em `app/globals.css`)
`--teal #0f5c52` · `--deep #0a3f38` · `--mint #6fd6c0` · `--cream #f6f3ee` ·
`--ink #12211f`. Tipografia **Manrope**.

### Regras de UI aprendidas (não repetir erros)
- **Device = uma imagem só**: o bezel (moldura) está **embutido no PNG/WebP**,
  com cantos transparentes + **aro claro** (senão o bezel some no tema escuro).
  Nada de moldura em CSS, nada de `data-tilt` (hover que mexe o device).
- **Nunca distorcer:** `<img width:100%; height:auto>`; sombra via
  `filter: drop-shadow(...)` (segue o formato).
- **Testar de 280px (Fold fechado) a 768px+ (Fold aberto)** — sem scroll
  horizontal. Use Playwright (ver §6).

---

## 6. Pipeline de prints → site → Play (como regerar)

Fonte das imagens: **app rodando em device real** (conta de teste), capturado
com **Maestro**, processado com **Pillow**.

1. **Capturar** (no `my-little`): flows em `.maestro/store/*.yaml` logam na
   **conta de teste** e tiram os screenshots. Rode com o device alvo:
   ```bash
   cd ~/www/my-little
   DEVICE=<serial-adb> npm run e2e -- .maestro/store/phone-light.yaml
   ```
   - Credenciais da conta de teste: `my-little/.env.e2e` (NÃO é conta real).
   - Prints saem em `~/.maestro/tests/<timestamp>/...`.
2. **Processar** (Pillow): recorta barras do sistema, **embute status bar fake
   (9:41, em Manrope) + barra de gestos**, depois **embute a moldura/bezel**
   (cantos transparentes + aro). Scripts de referência ficaram no scratchpad da
   sessão; a lógica: `raw → clean (crop) → mock (status bar+gesto) → frame (bezel)`.
3. **Exportar**: WebP (com alpha) para `mylittle-redirect/public/screenshots/`
   (celular 640px, tablet 1100px de largura).
4. **Assets da Play**: mockup sobre fundo teal + título curto. **Specs:**
   celular `1080×1920`, tablet 7"/10" **deitado 16:9** `2560×1440`,
   feature graphic `1024×500`. Proporção de tela ≤ **2:1**.

> `.store-shots/` (no app) é **gitignored** (artefatos). Peça ao Claude pra
> recriar os scripts de processamento se precisar — a sessão que fez isso
> documentou o passo a passo acima.

---

## 7. App Links de convite (deep link verificado)

Convite abre **o app se instalado**, senão **cai no site** (com "Baixar na Play").

- **Formato novo (App Link):** `https://cuidado.abisay.tech/invite/<token>`
  (path — App Links **não** casam querystring). O site também aceita o
  **legado** `?token=<token>` (links antigos seguem funcionando).
- **Site:** `public/.well-known/assetlinks.json` (SHA-256 da chave do **Play App
  Signing**) + `next.config.mjs` faz rewrite `/invite/:token` → home + o script
  inline em `app/layout.js` lê o token do path **ou** da query.
- **App (`my-little`):** `app.config.js` tem intent-filter `autoVerify:true` para
  `https://cuidado.abisay.tech/invite/*`; `src/services/inviteService.ts` gera a
  URL nova. **Só vale a partir de um novo build de produção.**
- Deep link interno continua `mylittle://invite/<token>` (fallback).

---

## 8. Deploy & git

- **Site:** push na **`main`** → Vercel publica em `cuidado.abisay.tech`.
  Branches viram preview. (Trabalhe em branch e abra PR, ou peça "subir pra main".)
- **App:** build/submit via **EAS** (`eas build` / `eas submit`), perfis em
  `my-little/eas.json`.
- **Autoria dos commits** (este projeto): `Jahn Carlos <jahn.santana@gmail.com>`
  (site) / `Jahn Santana <jahn.santana@gmail.com>` (app). Terminar mensagem com:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Não commitar** `.claude/worktrees/` (worktree antigo de outra máquina).

---

## 9. Fatos & armadilhas (importante)

- **Confirme antes de subir** para produção; só faça push quando o usuário pedir.
- **Conta de teste do Maestro** (`.env.e2e`) tem dados ricos (remédios +
  dependentes Ana/Caio/Jahn C.) — é dela que saem os prints bonitos. Após
  `clearState`, o device fica logado nela; relogar a conta real depois.
- **MIUI/Xiaomi** bloqueia Maestro sem "Instalar via USB".
- **Tablet (Samsung One UI)** ignora o demo mode do status bar — por isso a
  status bar dos prints é **sintetizada** (não a real).
- Print da Play: celular em tela cheia ~2.1:1 **estoura** o limite 2:1 do
  Google → por isso os assets de loja são **mockup + fundo + título**.
- Sempre que mexer em imagem/CSS do site, **teste responsivo com prints**
  (Playwright) antes de subir.

---

## 10. Comandos rápidos

```bash
# Site (este repo)
npm install && npm run dev          # dev em :3000
npm run build                       # build de produção

# App (my-little)
npm install
npm run android                     # roda no device/emulador (dev build)
DEVICE=<serial> npm run e2e -- <flow.yaml>   # Maestro

# adb
adb devices -l                      # lista devices
```
