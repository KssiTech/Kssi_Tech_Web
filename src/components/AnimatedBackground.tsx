import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Hero background — minimal motion: static base + slow conic drift + soft light pulse.
 * Uses transform/opacity only for smoother compositing than animated background strings.
 */
const AnimatedBackground = () => {
  const { isDark } = useTheme();
  const reduceMotion = useReducedMotion();

  const base = isDark
    ? "radial-gradient(ellipse 120% 100% at 50% 0%, rgba(198, 166, 103, 0.14) 0%, rgba(16, 16, 22, 1) 42%, rgba(8, 8, 12, 1) 100%)"
    : "radial-gradient(ellipse 120% 100% at 50% 0%, rgba(198, 166, 103, 0.2) 0%, rgba(250, 248, 242, 1) 48%, rgba(244, 241, 234, 1) 100%)";

  if (reduceMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0" style={{ background: base }} />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 70% 55% at 70% 15%, rgba(198, 166, 103, 0.12), transparent)"
              : "radial-gradient(ellipse 70% 55% at 75% 12%, rgba(198, 166, 103, 0.1), transparent)",
          }}
        />
      </div>
    );
  }

  const conic = isDark
    ? "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(198, 166, 103, 0.22) 55deg, rgba(90, 82, 120, 0.18) 130deg, transparent 200deg, rgba(139, 115, 85, 0.15) 280deg, transparent 360deg)"
    : "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255, 252, 245, 0.9) 40deg, rgba(198, 166, 103, 0.2) 100deg, transparent 170deg, rgba(212, 188, 126, 0.18) 250deg, transparent 360deg)";

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Static foundation — no keyframed background swaps */}
      <div className="absolute inset-0" style={{ background: base }} />

      {/* Slow conic field — single transform layer */}
      <div className="pointer-events-none absolute left-1/2 top-[42%] h-[min(220vw,2400px)] w-[min(220vw,2400px)] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="h-full w-full will-change-transform"
          style={{
            background: conic,
            opacity: isDark ? 0.45 : 0.35,
          }}
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Soft gold wash — opacity pulse only */}
      <motion.div
        className="pointer-events-none absolute -left-[25%] top-[8%] h-[55vmin] w-[55vmin] rounded-full blur-[100px] sm:h-[60vmin] sm:w-[60vmin] sm:blur-[120px]"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(212, 188, 126, 0.35) 0%, transparent 68%)"
            : "radial-gradient(circle, rgba(255, 250, 235, 0.85) 0%, rgba(198, 166, 103, 0.25) 45%, transparent 70%)",
        }}
        initial={{ opacity: 0.35 }}
        animate={{ opacity: [0.28, 0.42, 0.28] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary wash — asymmetric gradient so motion reads; slow drift */}
      <motion.div
        className="pointer-events-none absolute right-[-22%] bottom-[-8%] h-[min(95vw,540px)] w-[min(95vw,540px)] rounded-full blur-[90px] will-change-transform sm:blur-[110px]"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 65% 50% at 35% 40%, rgba(90, 82, 120, 0.45), rgba(198, 166, 103, 0.1) 52%, transparent 70%)"
            : "radial-gradient(ellipse 60% 48% at 30% 42%, rgba(255, 252, 245, 0.95), rgba(198, 166, 103, 0.15) 55%, transparent 72%)",
        }}
        animate={{
          opacity: [0.38, 0.55, 0.38],
          x: [0, -18, 8, 0],
          y: [0, -12, 6, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Edge vignette — static */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 88% 78% at 50% 48%, transparent 32%, rgba(0, 0, 0, 0.5) 100%)"
            : "radial-gradient(ellipse 92% 82% at 50% 50%, transparent 40%, rgba(234, 229, 218, 0.55) 100%)",
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
