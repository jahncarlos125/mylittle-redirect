import Image from "next/image";
import { PLAY_URL } from "@/lib/site";

/**
 * Cena 9 (teal, mesma família do Hero/Como funciona): footer rico
 * multi-coluna, inspirado no rodapé do whatsapp.com — coluna de marca +
 * 3 grupos de links, com uma linha inferior de copyright separada por
 * borda. Estático, sem estado — fica fora do <main> da landing (comum às
 * páginas do site, não conteúdo principal).
 *
 * Contraste: os links usam --mint-l (não --mint puro) sobre o teal do
 * footer. Como aqui o fundo é cor sólida (não o gradiente radial do
 * Hero/Como funciona), --mint-l mede ~5.66:1 — acima do AA 4.5:1 pra texto
 * normal (ver docs/reference/contraste-aa.md pro porquê --mint puro e
 * --mint-l sobre gradiente não seriam seguros). Textos de suporte (tagline,
 * copyright) usam --mint-l2, ainda mais claro, com folga bem maior.
 */
const APP_LINKS = [
  { href: "#recursos", label: "Recursos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#faq", label: "Perguntas frequentes" },
  { href: PLAY_URL, label: "Baixar na Play" },
];

const INSTITUTIONAL_LINKS = [
  { href: "/politica-de-privacidade/", label: "Política de Privacidade" },
  { href: "/exclusao-de-conta/", label: "Exclusão de conta" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__col footer__col--brand">
            <div className="footer__brand">
              <Image
                src="/brand/glifo-branco.png"
                alt="Meu Cuidado"
                width={36}
                height={36}
                className="footer__glyph"
              />
              <span className="footer__wordmark">Meu Cuidado</span>
            </div>
            <p className="footer__tagline">
              Lembretes de remédios para você e quem você ama.
            </p>
            <a
              href={PLAY_URL}
              target="_blank"
              rel="noopener"
              className="footer__cta"
            >
              Baixar na Play
            </a>
          </div>

          <nav className="footer__col" aria-label="O app">
            <h3 className="footer__group-title">O app</h3>
            <ul className="footer__list">
              {APP_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer__col" aria-label="Institucional">
            <h3 className="footer__group-title">Institucional</h3>
            <ul className="footer__list">
              {INSTITUTIONAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__col">
            <h3 className="footer__group-title">Contato</h3>
            <ul className="footer__list">
              <li>
                <a href="mailto:contato@abisay.tech">contato@abisay.tech</a>
              </li>
              <li className="footer__list-text">
                Um app da{" "}
                <a
                  href="https://abisay.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abisay.tech
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} Meu Cuidado
          </p>
        </div>
      </div>
    </footer>
  );
}
