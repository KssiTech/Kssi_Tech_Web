import { motion, useReducedMotion } from "framer-motion";

/**
 * Soft purple / blue / cyan glow behind the dot grid — inspired by stitch.withgoogle.com layering.
 */
export default function StitchAuroraLayer() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-[25%] bottom-[-20%] h-[min(75vh,560px)] w-[min(95vw,920px)] rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse 58% 58% at 42% 48%, rgba(139, 92, 246, 0.5) 0%, rgba(59, 130, 246, 0.28) 38%, transparent 72%)",
          filter: "blur(72px)",
        }}
        initial={false}
        animate={
          prefersReducedMotion
            ? { opacity: 0.62 }
            : {
                x: [0, 36, -24, 12, 0],
                y: [0, -28, 16, -8, 0],
                opacity: [0.52, 0.72, 0.58, 0.68, 0.52],
              }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 20, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className="absolute -right-[18%] bottom-[-35%] h-[min(68vh,500px)] w-[min(90vw,820px)] rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse 52% 52% at 48% 52%, rgba(34, 211, 238, 0.42) 0%, rgba(99, 102, 241, 0.22) 42%, transparent 70%)",
          filter: "blur(88px)",
        }}
        initial={false}
        animate={
          prefersReducedMotion
            ? { opacity: 0.48 }
            : {
                x: [0, -32, 22, -14, 0],
                y: [0, 22, -14, 8, 0],
                opacity: [0.4, 0.58, 0.45, 0.55, 0.4],
              }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 24, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
        }
      />
      <motion.div
        className="absolute left-[15%] bottom-[-10%] h-[min(45vh,380px)] w-[min(70vw,600px)] rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(167, 139, 250, 0.28) 0%, rgba(56, 189, 248, 0.12) 55%, transparent 75%)",
          filter: "blur(64px)",
        }}
        initial={false}
        animate={
          prefersReducedMotion
            ? { opacity: 0.35 }
            : {
                x: [0, 20, -18, 0],
                y: [0, -12, 10, 0],
                opacity: [0.28, 0.42, 0.32, 0.28],
              }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }
        }
      />
    </div>
  );
}
