"use client";

import { useEffect, useRef } from "react";

/**
 * Glifo "montado" por partículas: amostra o canal alfa de
 * /brand/glifo-teal.png (silhueta nítida, contrasta bem com a cena mint) pra
 * descobrir onde cada partícula deve pousar, e voam do caos até o desenho
 * quando a seção entra na tela (IntersectionObserver). Decorativo — a11y
 * fica por conta do texto/form ao lado, então aria-hidden aqui.
 *
 * Reduced-motion: sem requestAnimationFrame — desenha direto o glifo já
 * montado (pontos estáticos nas posições-alvo).
 */
const GLYPH_SRC = "/brand/glifo-teal.png";
const COLORS = ["#0f5c52", "#17786b", "#6fd6c0", "#8fe0cf"];

export default function ParticleGlyph() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, targets = [], parts = [], raf = 0, t0 = 0;
    let started = false, imgReady = false, cancelled = false;

    function buildTargets() {
      if (!imgReady || !W || !H) { targets = []; return; }
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const o = off.getContext("2d");
      const size = Math.min(W, H) * 0.82;
      const ox = (W - size) / 2, oy = (H - size) / 2;
      o.drawImage(img, ox, oy, size, size);
      const data = o.getImageData(0, 0, W, H).data;
      const step = Math.max(3, Math.round(size / 46));
      targets = [];
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (data[(y * W + x) * 4 + 3] > 130) targets.push({ x, y });
        }
      }
    }

    function initParticles(scatter) {
      parts = targets.map((tp) => ({
        x: scatter ? W / 2 + (Math.random() - 0.5) * W * 1.6 : tp.x,
        y: scatter ? H / 2 + (Math.random() - 0.5) * H * 1.6 : tp.y,
        tx: tp.x, ty: tp.y, vx: 0, vy: 0,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        r: Math.random() * 1.3 + 0.6,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.5 + 0.45,
      }));
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = Math.round(rect.width); H = Math.round(rect.height);
      if (!W || !H) return;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildTargets();
      if (parts.length !== targets.length) initParticles(!started);
      else parts.forEach((p, i) => { p.tx = targets[i].x; p.ty = targets[i].y; });
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 0.9;
      for (const tp of targets) {
        ctx.fillStyle = COLORS[0];
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function frame(now) {
      const time = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        const dx = p.tx + Math.sin(time * p.sp + p.ph) * 1.6 - p.x;
        const dy = p.ty + Math.cos(time * p.sp * 0.9 + p.ph) * 1.6 - p.y;
        p.vx = (p.vx + dx * 0.02) * 0.86;
        p.vy = (p.vy + dy * 0.02) * 0.86;
        p.x += p.vx; p.y += p.vy;
        ctx.globalAlpha = 0.5 + 0.4 * Math.sin(time * 2 + p.ph);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (started) return;
      started = true;
      if (reduced) { drawStatic(); return; }
      initParticles(true);
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    }

    let io;
    let rt;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      imgReady = true;
      resize();
      if (reduced) {
        drawStatic();
      } else if ("IntersectionObserver" in window) {
        io = new IntersectionObserver((entries) => {
          if (entries.some((e) => e.isIntersecting)) start();
        }, { threshold: 0.25 });
        io.observe(canvas);
      } else {
        start();
      }
    };
    img.src = GLYPH_SRC;

    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        resize();
        if (reduced) drawStatic();
      }, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      io && io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="testcta__glyph-canvas" aria-hidden="true" />;
}
