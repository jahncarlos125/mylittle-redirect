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
 * data-animate="up"|"line", data-magnetic, data-tilt — o mecanismo aqui é
 * genérico, não conhece o conteúdo de nenhuma seção específica.
 *
 * Reduced-motion: Lenis nem chega a instalar (early return no useEffect) e o
 * useGSAP também sai cedo, deixando tudo visível via clearProps — nenhuma
 * timeline roda.
 */
export default function Landing({ children }) {
  const root = useRef(null);

  /* ---- Nav auto-hide no mobile (≤767px) ----
     Independente do Lenis/reduced-motion: roda sempre, porque aqui é
     usabilidade (nav sticky cobrindo conteúdo), não decoração. Compara o
     scrollY atual com o anterior num listener nativo de "scroll" — funciona
     tanto com Lenis quanto sem, já que o Lenis (no modo padrão, sem virtual
     scroll) move o scroll real do documento, então o evento nativo dispara
     do mesmo jeito. Só alterna a classe .nav--hidden; o efeito visual (a
     transform) fica 100% no CSS, dentro de @media (max-width:767px), então
     no desktop a classe pode até ser adicionada sem nenhum efeito visível. */
  useEffect(() => {
    const nav = document.querySelector("[data-nav]");
    if (!nav) return;

    const mq = matchMedia("(max-width: 767px)");
    let lastY = window.scrollY;

    const show = () => nav.classList.remove("nav--hidden");

    const onScroll = () => {
      const y = window.scrollY;
      if (!mq.matches || y < 80) {
        show();
      } else if (y > lastY + 4) {
        nav.classList.add("nav--hidden");
      } else if (y < lastY - 4) {
        show();
      }
      lastY = y;
    };

    // volta a aparecer se o foco entrar num link da nav (ex.: navegação por
    // teclado escondida atrás de um scroll pra baixo)
    nav.addEventListener("focusin", show);
    window.addEventListener("scroll", onScroll, { passive: true });

    const onMqChange = () => {
      lastY = window.scrollY;
      if (!mq.matches) show();
    };
    mq.addEventListener?.("change", onMqChange) ?? mq.addListener(onMqChange);

    return () => {
      nav.removeEventListener("focusin", show);
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener?.("change", onMqChange) ?? mq.removeListener(onMqChange);
    };
  }, []);

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
         html/body, então o scroll da página nunca é sequestrado.

         Só roda em ≥768px (ScrollTrigger.matchMedia cuida de criar/reverter
         os ScrollTriggers conforme o viewport). No mobile a galeria vira um
         carrossel horizontal nativo (ver Gallery.js/app/globals.css) — sem
         parallax vertical, que não faria sentido junto com scroll-snap
         horizontal. */
      ScrollTrigger.matchMedia({
        "(min-width: 768px)": () => {
          gsap.utils.toArray("[data-parallax]").forEach((el) => {
            const speed = parseFloat(el.dataset.parallaxSpeed) || 1;
            gsap.to(el, {
              yPercent: -9 * speed,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            });
          });
        },
      });

      /* ---- Como funciona: sem pin. A seção rolava travada (pin:true) com
         os passos deslizando lateralmente via parallax/scrub — no mobile
         isso lia como "a página travou, só os números andam pro lado".
         Removido: a entrada dos .step (fade + up) já é coberta pelo reveal
         genérico [data-animate="up"] acima, então a seção rola normalmente
         como qualquer outra. */

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
