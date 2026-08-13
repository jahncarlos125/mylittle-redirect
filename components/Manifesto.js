/**
 * Cena 2: intervalo creme entre o Hero (teal) e Como funciona (teal). Uma
 * única frase-manifesto, sem CTA — só espaço para respirar e fixar a ideia
 * central antes dos passos. O reveal por linha (data-animate="line") é
 * aplicado pelo useGSAP central em components/Landing.js; aqui só marcamos
 * o atributo e montamos as linhas em .line > .line__i, no mesmo padrão do
 * <h1> do Hero.
 */
export default function Manifesto() {
  return (
    <section className="manifesto">
      <div className="manifesto__inner">
        <h2 className="manifesto__text" data-animate="line">
          <span className="line">
            <span className="line__i">Cuidar de quem a gente ama</span>
          </span>
          <span className="line">
            <span className="line__i">começa por não deixar nada passar.</span>
          </span>
        </h2>
      </div>
    </section>
  );
}
