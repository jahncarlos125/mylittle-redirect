# Contraste WCAG 2.2 AA — pares texto/fundo

Task 10 (auditoria de acessibilidade). Ratios calculados pela fórmula de
luminância relativa do WCAG (`(L1+0.05)/(L2+0.05)`) a partir dos tokens de
`app/globals.css`. Onde o fundo é um `radial-gradient`/`linear-gradient`, o
ratio é calculado no ponto mais claro do gradiente (pior caso) — o ponto
mais escuro sempre passa com folga maior. Todos os pares abaixo foram
validados também pelo axe-core (`tests/a11y.spec.js`), que mede a cor
realmente renderizada; nenhum ficou com violação `color-contrast` de
impact `critical`/`serious` no estado final.

Critério AA: **texto normal ≥ 4.5:1**; **texto grande (≥24px, ou ≥19px
bold) ≥ 3:1**; **componentes não-textuais/UI (bordas, ícones com
significado) ≥ 3:1**.

| Elemento | Texto | Fundo | Tamanho/peso | Classe | Ratio | Status |
|---|---|---|---|---|---|---|
| `.hero__title`, `.testcta__title`, `.faq__title` etc. (headings) | `#fff` | gradiente teal (`--teal` `#0f5c52` → `#1a7d6b`) | `clamp(2.4rem,6vw,4.4rem)` / 800 | grande | 7.86:1 (pior caso) | OK |
| `.badge` (hero/how) | `#fff` (era `--mint` `#6fd6c0`) | gradiente teal, ponto mais claro `#1a7d6b` | 13px / 700 | normal | 5.01:1 (pior caso) | **Corrigido** — mint dava ~3.9:1 |
| `.hero__sub`, `.how__sub`, `.step__text`, `.hero__stats span` | `--mint-l2` `#eef9f5` (era `--mint-l` `#c6e1d8`) | gradiente teal, ponto mais claro `#1a7d6b` | 13–20px / 400–500 | normal | 4.66:1 (pior caso; 7.10–10.9:1 no resto do gradiente) | **Corrigido** — mint-l dava ~3.6:1 no ponto mais claro |
| `.gallery__sub` | `--mint-l` `#c6e1d8` | gradiente escuro (`--deep` → `#082722`, sem ponto claro) | `--fs-lead` / 400 | normal | 8.51:1 | OK (sem alteração) |
| `.footer__links a` | `--mint-l` `#c6e1d8` | `--teal` `#0f5c52` sólido | .85–1rem / 400 | normal | 5.67:1 | OK |
| `.footer__copy` | `#fff` a 72% opacidade | `--teal` sólido | .85rem / 400 | normal | 4.92:1 | OK |
| `.footer`, `.skip-link` | `#fff` | `--teal` sólido | — | — | 7.86:1 | OK |
| `.nav__cta` | `--deep` `#0a3f38` | `--mint` `#6fd6c0` (pill) | .9rem / 700 | normal | 6.77:1 | OK |
| body/`.legal-card p,li` | `--ink` `#12211f` | `--cream` `#f6f3ee` | 1rem / 400 | normal | 15.02:1 | OK |
| `.legal-card p,li` (opacidade .82) | `--ink` a 82% sobre branco (≈`#3d4947`) | `#fff` | 1rem / 400 | normal | 9.36:1 | OK |
| `.legal-card .legal-meta` (opacidade .65) | `--ink` a 65% sobre branco (≈`#656f6d`) | `#fff` | .9rem / 400 | normal | 5.19:1 | OK |
| `.legal-card a`, links em geral | `--teal` `#0f5c52` | `#fff` / `--cream` | 1rem / 400 | normal | 7.86:1 / 7.10:1 | OK |
| `.feature-card__text` (opacidade .78) | `--ink` a 78% sobre branco (≈`#38423f`) | `#fff` | .94rem / 400 | normal | 8.13:1 | OK |
| `.testcta__sub` (opacidade .82) | `--ink` a 82% sobre `--cream` | gradiente `--mint-l`→`--cream` | `--fs-lead` / 400 | normal | 8.74:1 (pior caso, lado creme) | OK |
| `.field__label` | `--ink` | `#fff` (input) / `--cream` (label) | .9rem / 700 | normal | 15.02–16.63:1 | OK |
| `.field__optional` "(opcional)" | `#3d4947` (era `--ink` a 65% opacidade) | `--cream` | .9rem / 500 | normal | 8.46:1 teórico (axe mediu 3.6–4.2:1 com a opacidade antiga) | **Corrigido** — opacity comprimida por composição ficava abaixo de 4.5:1 no axe; trocado por cor sólida |
| `.form__status` (mensagem de erro/sucesso) | `--deep` `#0a3f38` (era `--teal`) | `--cream` | .9rem / 700 | normal | 10.65:1 teórico (axe mediu 4.49:1 com `--teal`, na borda do AA) | **Corrigido** — troca por `--deep` dá margem confortável |
| `.faq__trigger` | `--ink` | `#fff` (card) | 1rem / 700 | normal | 16.63:1 | OK |
| `.faq__panel-inner p` (opacidade .82) | `--ink` a 82% sobre branco | `#fff` | 1rem / 400 | normal | 9.36:1 | OK |
| `.btn--primary` | `#06231f` | `--mint` | .97rem / 800 | normal | ~9:1 | OK |
| `.btn--dark` | `#fff` | `--teal` | .97rem / 800 | normal | 7.86:1 | OK |

## Notas

- **Gradientes**: `.hero`, `.how` e `.testcta` usam `radial-gradient`; o
  ponto mais claro (perto do centro do radial) é o pior caso pra texto
  claro sobre fundo escuro. Os valores acima usam esse pior caso — em
  qualquer outro ponto do gradiente o contraste só melhora.
- **Opacity vs. cor sólida**: dois casos (`.field__optional`,
  `.form__status`) usavam `opacity` para uma cor "apagada"; o axe mediu a
  cor renderizada abaixo do que o cálculo teórico simples de composição
  alfa sugeria (possivelmente por causa da forma como o Chromium compõe
  cores/antialiasing de fonte nesse tamanho/peso). Para eliminar a
  ambiguidade, os dois casos foram trocados por uma cor sólida calculada
  para dar margem confortável acima de 4.5:1 — validado pelo axe depois
  da troca.
- **Texto grande vs. normal**: nenhum texto do site chega a 19px bold ou
  24px normal além dos headings (`h1`/`h2`/`.hero__title` etc.), que já
  são brancos/alto-contraste por padrão. Badges, subtítulos e stats são
  todos tratados como texto normal (regra dos 4.5:1) mesmo quando bold,
  por ficarem abaixo do limiar de "texto grande".
- **Elementos não-textuais** (bordas `--mint-l` em cards/inputs, ícone
  `+`/`×` do FAQ em `--teal` sobre `--mint-l`) não carregam texto e função
  é reforçada por outros indicadores (`aria-expanded`, foco visível), não
  dependem só do contraste da borda.
