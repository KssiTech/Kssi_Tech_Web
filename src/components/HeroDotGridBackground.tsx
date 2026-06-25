import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const SPACING_DEFAULT = 28;
const SPACING_STITCH = 22;
/** Tighter grid on light backgrounds so dots read as a field, not sparse points */
const SPACING_LIGHT = 18;

type HeroDotGridBackgroundProps = {
  isDark: boolean;
  /** Cool white dots on black — matches stitch.withgoogle.com-style grids */
  variant?: "default" | "stitch";
};

/**
 * Canvas dot grid: slow breathing + soft cursor glow. Static when prefers-reduced-motion.
 */
export default function HeroDotGridBackground({
  isDark,
  variant = "default",
}: HeroDotGridBackgroundProps) {
  const stitch = variant === "stitch" && isDark;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const mouseRef = useRef({ x: Number.NaN, y: Number.NaN });
  const frameRef = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      ) {
        mouseRef.current = { x: Number.NaN, y: Number.NaN };
        return;
      }
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let cols = 0;
    let rows = 0;
    let cssW = 0;
    let cssH = 0;

    const spacing = stitch
      ? SPACING_STITCH
      : !isDark
        ? SPACING_LIGHT
        : SPACING_DEFAULT;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(cssW / spacing) + 1;
      rows = Math.ceil(cssH / spacing) + 1;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const rgb = stitch
      ? { r: 255, g: 255, b: 255 }
      : isDark
        ? { r: 198, g: 166, b: 103 }
        : { r: 88, g: 80, b: 68 };
    const baseAlpha = stitch ? 0.13 : isDark ? 0.2 : 0.22;
    const interactR = 150;

    const start = performance.now();
    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      frameRef.current = requestAnimationFrame(tick);

      if (document.visibilityState !== "visible" || cssW < 2 || cssH < 2) return;

      const t = now - start;
      ctx.clearRect(0, 0, cssW, cssH);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const hasMouse = !Number.isNaN(mx) && !Number.isNaN(my);

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const cx = i * spacing + spacing / 2;
          const cy = j * spacing + spacing / 2;
          const phase = i * 0.41 + j * 0.27;

          let breath = 1;
          let radiusMul = 1;
          if (!prefersReducedMotion) {
            if (!isDark) {
              const wave = Math.sin(t * 0.00095 + phase);
              breath = 0.48 + 0.52 * wave;
              radiusMul = 0.82 + 0.18 * Math.sin(t * 0.00115 + phase * 1.25);
            } else {
              breath = 0.62 + 0.38 * Math.sin(t * 0.00075 + phase);
              radiusMul = 0.86 + 0.14 * Math.sin(t * 0.001 + phase * 1.25);
            }
          }

          let glow = 0;
          if (!prefersReducedMotion && hasMouse) {
            const dx = mx - cx;
            const dy = my - cy;
            const dist = Math.hypot(dx, dy);
            if (dist < interactR) {
              glow = (1 - dist / interactR) ** 2;
            }
          }

          const glowMul = stitch ? 0.42 : isDark ? 0.48 : 0.52;
          const alpha = Math.min(1, baseAlpha * breath + glow * glowMul);
          const radius =
            (stitch ? 0.85 : isDark ? 1.2 : 1.12) * radiusMul;

          ctx.beginPath();
          ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, [isDark, prefersReducedMotion, stitch]);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}
