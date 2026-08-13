"use client";

import { useEffect, useRef } from "react";

/**
 * Campo de partículas mint suave, cobrindo o hero ao fundo (canvas
 * full-bleed, atrás do conteúdo). Movimento lento e senoidal, com leve
 * reação à posição do ponteiro. Decorativo: aria-hidden.
 *
 * Com prefers-reduced-motion, desenha um único frame estático (sem
 * requestAnimationFrame) e não escuta o ponteiro nem o resize.
 */
export default function ParticleField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COLORS = ["#6fd6c0", "#6fd6c0", "#8fe0cf", "#c6e1d8"];

    let W = 0, H = 0, parts = [], raf = 0, t0 = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    function initParticles() {
      const n = Math.min(90, Math.max(32, Math.round((W * H) / 16000)));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        r: Math.random() * 1.6 + 0.6,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        ph: Math.random() * Math.PI * 2,
      }));
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = Math.round(rect.width);
      H = Math.round(rect.height);
      if (!W || !H) return;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function frame(now) {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.vx += Math.sin(t * 0.3 + p.ph) * 0.003;
        p.vy += Math.cos(t * 0.25 + p.ph) * 0.003;
        if (mouse.active) {
          const mx = p.x - mouse.x, my = p.y - mouse.y, m2 = mx * mx + my * my;
          if (m2 < 8000) {
            const d = Math.sqrt(m2) || 1;
            const f = (8000 - m2) / 8000;
            p.vx += (mx / d) * f * 0.3;
            p.vy += (my / d) * f * 0.3;
          }
        }
        if (p.x < -5) p.x = W + 5; else if (p.x > W + 5) p.x = -5;
        if (p.y < -5) p.y = H + 5; else if (p.y > H + 5) p.y = -5;
        ctx.globalAlpha = 0.12 + 0.24 * (0.5 + 0.5 * Math.sin(t * 1.1 + p.ph));
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    resize();
    if (reduced) {
      drawStatic();
    } else {
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (x >= 0 && y >= 0 && x <= r.width && y <= r.height) {
        mouse.x = x; mouse.y = y; mouse.active = true;
      } else {
        mouse.active = false;
      }
    };
    const onLeave = () => { mouse.active = false; };

    let rt;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        resize();
        if (reduced) drawStatic();
      }, 200);
    };

    if (!reduced) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  return <canvas ref={ref} className="hero__fx" aria-hidden="true" />;
}
