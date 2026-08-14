/**
 * Cena 9: teal (mesma família do Hero/Como funciona). Rodapé estático,
 * sem estado — fica fora do <main> da landing (é comum às páginas do
 * site, não conteúdo principal).
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__brand">Meu Cuidado</p>

        <nav className="footer__links" aria-label="Links do rodapé">
          <a href="/politica-de-privacidade/">Política de Privacidade</a>
          <a href="/exclusao-de-conta/">Exclusão de conta</a>
          <a href="mailto:contato@abisay.tech">Contato</a>
        </nav>

        <p className="footer__copy">
          © {new Date().getFullYear()} Meu Cuidado
        </p>
        <p className="footer__credit">
          Um app da{" "}
          <a
            href="https://abisay.tech"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abisay.tech
          </a>
        </p>
      </div>
    </footer>
  );
}
