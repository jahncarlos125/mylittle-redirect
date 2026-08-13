"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const EASE = "power3.out";

/**
 * Orquestrador de motion da landing: smooth scroll (Lenis) + timelines GSAP
 * centrais. As seções (Hero, Features, etc.) só precisam usar os atributos
 * data-animate="up"|"line", data-magnetic, data-tilt, data-pin — o mecanismo
 * aqui é genérico, não conhece o conteúdo de nenhuma seção específica.
 *
 * Reduced-motion: Lenis nem chega a instalar (early return no useEffect) e o
 * useGSAP também sai cedo, deixando tudo visível via clearProps — nenhuma
 * timeline roda.
 */
export default function Landing({ children }) {
  const root = useRef(null);

  /* ---- Smooth scroll (Lenis) + magnetismo + tilt ---- */
  useEffect(() => {
    if (document.documentElement.classList.contains("reduced")) return;

    let lenis;
    let raf;
    const cleanupFns = [];
    let mounted = true;

    import("lenis").then(({ default: Lenis }) => {
      if (!mounted) return;
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const loop = (t) => {
        lenis.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      // âncoras internas rolam suave, com offset pro nav fixo
      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        const onClick = (e) => {
          const id = a.getAttribute("href");
          if (id.length < 2) return;
          const el = document.querySelector(id);
          if (!el) return;
          e.preventDefault();
          lenis.scrollTo(el, { offset: -70 });
        };
        a.addEventListener("click", onClick);
        cleanupFns.push(() => a.removeEventListener("click", onClick));
      });

      ScrollTrigger.refresh();
    });

    // magnetismo e tilt só fazem sentido com ponteiro fino (mouse)
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll("[data-magnetic]").forEach((el) => {
        const move = (e) => {
          const r = el.getBoundingClientRect();
          gsap.to(el, {
            x: (e.clientX - (r.left + r.width / 2)) * 0.35,
            y: (e.clientY - (r.top + r.height / 2)) * 0.35,
            duration: 0.4,
            ease: "power3.out",
          });
        };
        const reset = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", reset);
        cleanupFns.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", reset);
        });
      });

      document.querySelectorAll("[data-tilt]").forEach((wrap) => {
        const el = wrap.querySelector(".device") || wrap;
        const move = (e) => {
          const r = wrap.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(el, {
            rotateY: px * 18,
            rotateX: -py * 16,
            scale: 1.02,
            duration: 0.5,
            ease: "power2.out",
            transformPerspective: 1100,
            transformOrigin: "center",
          });
        };
        const reset = () => gsap.to(el, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.9, ease: "power3.out" });
        wrap.addEventListener("pointermove", move);
        wrap.addEventListener("pointerleave", reset);
        cleanupFns.push(() => {
          wrap.removeEventListener("pointermove", move);
          wrap.removeEventListener("pointerleave", reset);
        });
      });
    }

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      lenis && lenis.destroy();
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  useGSAP(
    () => {
      const reduced = document.documentElement.classList.contains("reduced");

      // nav solidifica ao rolar
      ScrollTrigger.create({
        start: "top -40",
        end: 99999,
        toggleClass: { targets: "[data-nav]", className: "nav--solid" },
      });

      // barra de progresso de leitura
      gsap.to("[data-progress]", {
        scaleX: 1,
        ease: "none",
        transformOrigin: "left",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });

      if (reduced) {
        gsap.set("[data-animate]", { clearProps: "all" });
        return;
      }

      /* ---- Reveals genéricos ---- */
      gsap.utils.toArray("[data-animate='up']").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 34, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: EASE, scrollTrigger: { trigger: el, start: "top 88%" } }
        );
      });

      /* ---- Line-mask (texto sobe mascarado por overflow:hidden) ---- */
      gsap.utils.toArray("[data-animate='line']").forEach((el) => {
        gsap.fromTo(
          el.children,
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.09, ease: EASE, scrollTrigger: { trigger: el, start: "top 84%" } }
        );
      });

      /* ---- Parallax genérico (ex.: colunas da galeria de telas). Cada
         elemento marcado com data-parallax anda em yPercent conforme o
         próprio scroll (scrub), com velocidade dada por
         data-parallax-speed. Usa gsap.to (não fromTo) com start "top
         bottom": antes do elemento entrar na viewport o progress do
         ScrollTrigger é 0, então ele nasce na posição natural (sem pulo);
         só desloca em Y — nunca X — então não cria overflow horizontal, e
         não há listener de wheel/preventDefault nem toque em overflow do
         html/body, então o scroll da página nunca é sequestrado. */
      gsap.utils.toArray("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallaxSpeed) || 1;
        gsap.to(el, {
          yPercent: -9 * speed,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      /* ---- Como funciona: pin curto + barra de progresso + parallax dos
         ícones. O pin dura só 60% da altura da viewport (não o suficiente
         pra travar o scroll) e usa scrub, então acompanha o dedo/roda em
         vez de tocar animação por conta própria. A entrada dos .step (fade
         + up) continua por conta do [data-animate="up"] genérico acima;
         aqui só animamos propriedades que não conflitam com ela (a barra
         de progresso, a cor/escala do número decorativo e o yPercent do
         ícone), pra não competir por x/y/opacity do mesmo elemento. */
      const pinSection = document.querySelector("[data-pin]");
      if (pinSection) {
        const pinRange = { trigger: pinSection, start: "top top", end: "+=60%" };

        ScrollTrigger.create({ ...pinRange, pin: true, pinSpacing: true, scrub: 1 });

        gsap.fromTo(
          "[data-progress-fill]",
          { scaleX: 0 },
          { scaleX: 1, ease: "none", transformOrigin: "left", scrollTrigger: { ...pinRange, scrub: 1 } }
        );

        gsap.timeline({ scrollTrigger: { ...pinRange, scrub: 1 } }).to(".step__num", {
          color: "#6fd6c0" /* --mint */,
          scale: 1.12,
          stagger: 0.5,
          ease: "none",
        });

        gsap.utils.toArray("[data-pin] .step__icon").forEach((icon) => {
          gsap.to(icon, {
            yPercent: -10,
            ease: "none",
            scrollTrigger: { trigger: icon, start: "top bottom", end: "bottom top", scrub: true },
          });
        });
      }

      ScrollTrigger.refresh();
    },
    { scope: root }
  );

  return (
    // "landing" (não a estrutura interna) é o que `html[data-invite="1"]
    // .landing{display:none}` (app/globals.css) esconde durante o fluxo de
    // convite — precisa envolver Nav+main+Footer juntos, senão nav/footer
    // (fora do <main>) ficam visíveis por cima do overlay de convite.
    <div ref={root} className="landing">
      <span className="progress" data-progress aria-hidden="true" />
      {children}
    </div>
  );
}
