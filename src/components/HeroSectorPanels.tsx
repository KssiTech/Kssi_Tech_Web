import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { panelGroups } from "@/data/sectors";

interface HeroSectorPanelsProps {
  isDark: boolean;
}

const AUTO_CYCLE_MS = 4000;

const HeroSectorPanels: React.FC<HeroSectorPanelsProps> = ({ isDark }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const advance = useCallback(() => {
    setActiveIndex((i) => (i + 1) % panelGroups.length);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    const timer = setInterval(advance, AUTO_CYCLE_MS);
    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion, advance]);

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: [0.4, 0, 0.2, 1] as const };

  const contentTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3, delay: 0.18 };

  return (
    <div
      className="flex gap-2 w-full rounded-2xl overflow-hidden"
      style={{ height: "clamp(380px, 48vw, 520px)" }}
      role="region"
      aria-label="Secteurs d'activité KSSI TECH"
    >
      {panelGroups.map((group, i) => {
        const isActive = activeIndex === i;
        const { GroupIcon } = group;

        return (
          <motion.div
            key={group.id}
            layout
            animate={{ flex: isActive ? 5 : 1 }}
            transition={transition}
            className="relative overflow-hidden rounded-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-khwarizmia-gold/60"
            onMouseEnter={() => {
              setActiveIndex(i);
              setIsPaused(true);
            }}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => {
              setActiveIndex(i);
              setIsPaused(true);
            }}
            onBlur={() => setIsPaused(false)}
            tabIndex={0}
            role="button"
            aria-expanded={isActive}
            aria-label={`Voir ${group.groupTitle}`}
          >
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
              style={{
                backgroundImage: `url(${group.imageUrl})`,
                transform: isActive ? "scale(1.04)" : "scale(1)",
              }}
            />

            {/* Gradient overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t ${group.overlayGradient} transition-opacity duration-500`}
              style={{ opacity: isActive ? 0.92 : 0.75 }}
            />

            {/* Dark vignette at bottom always */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />

            {/* ── COLLAPSED CONTENT ── */}
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 px-2">
                  <GroupIcon className="w-5 h-5 text-white/80 shrink-0" />
                  <span
                    className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap select-none"
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      transform: "rotate(180deg)",
                    }}
                  >
                    {group.groupTitle}
                  </span>
                </div>
              </div>
            )}

            {/* ── ACTIVE CONTENT ── */}
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.div
                  key={group.id + "-content"}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={contentTransition}
                  className="absolute bottom-0 left-0 right-0 p-6"
                >
                  {/* Group icon */}
                  <div className="mb-3 flex items-center gap-2">
                    <GroupIcon className="w-5 h-5 text-khwarizmia-gold" />
                    <span className="text-khwarizmia-gold text-[10px] font-bold uppercase tracking-[0.22em]">
                      KSSI TECH
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-bold text-xl lg:text-2xl mb-3 leading-tight">
                    {group.groupTitle}
                  </h3>

                  {/* Sub-sector tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {group.subsectors.map((s) => (
                      <span
                        key={s.slug}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white/90 uppercase tracking-wider backdrop-blur-sm border border-white/20"
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/secteurs/${group.slug}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-khwarizmia-gold/90 hover:bg-khwarizmia-gold text-khwarizmia-navy text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition-all duration-200 hover:gap-3 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Découvrir <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar (active panel only) */}
            {isActive && !prefersReducedMotion && !isPaused && (
              <motion.div
                key={`progress-${group.id}-${activeIndex}`}
                className="absolute top-0 left-0 h-0.5 bg-khwarizmia-gold/70"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: AUTO_CYCLE_MS / 1000, ease: "linear" }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default HeroSectorPanels;
