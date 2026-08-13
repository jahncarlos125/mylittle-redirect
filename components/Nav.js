import Image from "next/image";

/**
 * Header fixo. Fica translúcido no topo e solidifica (.nav--solid, via
 * ScrollTrigger em components/Landing.js) ao rolar a página.
 */
export default function Nav() {
  return (
    <header className="nav" data-nav>
      <div className="nav__inner">
        <a href="#topo" className="nav__brand" aria-label="Meu Cuidado — início">
          <Image src="/brand/glifo-branco.png" alt="Meu Cuidado" width={36} height={36} className="nav__glyph" priority />
          <span className="nav__wordmark">Meu Cuidado</span>
        </a>

        <nav className="nav__links" aria-label="Navegação principal">
          <a href="#testar" className="nav__cta" data-magnetic>
            Participar do teste
          </a>
        </nav>
      </div>
    </header>
  );
}
