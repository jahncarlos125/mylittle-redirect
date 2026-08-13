import Image from "next/image";
import ParticleField from "./ParticleField";

/**
 * Cena 1: hero teal. Único <h1> da página. O motion de entrada (fade+up,
 * line-mask) e o magnetismo dos CTAs são aplicados pelo useGSAP central em
 * components/Landing.js via atributos — aqui só marcamos data-animate/
 * data-magnetic. Float do celular e respiração do glow ficam em CSS puro,
 * já gated por prefers-reduced-motion em app/globals.css.
 */
export default function Hero() {
  return (
    <section className="hero" id="topo">
      <span className="hero__glow" aria-hidden="true" />
      <ParticleField />

      <div className="hero__inner">
        <div className="hero__left">
          <span className="badge" data-animate="up">
            <span className="badge__dot" aria-hidden="true" />
            Em teste fechado · Android
          </span>

          <h1 className="hero__title" data-animate="line">
            <span className="line">
              <span className="line__i">Nunca esqueça um remédio —</span>
            </span>
            <span className="line">
              <span className="line__i">
                o seu e o de <span className="hl">quem você ama</span>.
              </span>
            </span>
          </h1>

          <p className="hero__sub" data-animate="up">
            Lembretes na hora certa, agenda do dia e o cuidado da família inteira num só app.
          </p>

          <div className="hero__cta" data-animate="up">
            <a className="btn btn--primary" href="#testar" data-magnetic>
              Quero testar →
            </a>
            <a className="btn btn--ghost" href="#como-funciona">
              Como funciona
            </a>
          </div>

          <div className="hero__stats" data-animate="up">
            <div className="stat">
              <b>3 toques</b>
              <span>pra cadastrar</span>
            </div>
            <div className="stat">
              <b>Família</b>
              <span>num só lugar</span>
            </div>
            <div className="stat">
              <b>Claro/escuro</b>
              <span>do seu jeito</span>
            </div>
          </div>
        </div>

        <div className="hero__right" data-animate="up">
          <div className="hero__phone">
            <Image
              src="/screenshots/hoje-light.webp"
              alt="Tela “Hoje” do app Meu Cuidado, com a lista de lembretes de remédios do dia"
              width={272}
              height={605}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
