import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

const logos = [
  "C++17",
  "CMake",
  "Bazel",
  "SIMD",
  "AVX2",
  "CUDA",
  "HIP",
  "Sanitizers",
  "Coverage",
  "Clang-Tidy",
  "Profiler",
];

const PressLogos = () => {
  const { isDark } = useTheme();
  const repeated = [...logos, ...logos];

  return (
    <section className="overflow-hidden py-2">
      <div className="mb-3 text-center">
        <p
            className={`text-[0.7rem] font-semibold uppercase tracking-[0.14em] ${
            isDark ? "text-stone-400" : "text-stone-500"
          }`}
        >
          Built for real workloads
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 z-[2] w-14 sm:w-20 ${
            isDark
              ? "bg-gradient-to-r from-[#0b0b0f] to-transparent"
              : "bg-gradient-to-r from-white to-transparent"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-[2] w-14 sm:w-20 ${
            isDark
              ? "bg-gradient-to-l from-[#0b0b0f] to-transparent"
              : "bg-gradient-to-l from-white to-transparent"
          }`}
        />

        <div className="flex w-max animate-marquee gap-10 will-change-transform">
          {repeated.map((logo, i) => (
            <span
              key={`${logo}-${i}`}
              className={`select-none whitespace-nowrap text-[0.95rem] font-extrabold tracking-[-0.02em] transition-colors ${
                isDark
                  ? "text-stone-500 hover:text-khwarizmia-gold"
                  : "text-slate-300 hover:text-khwarizmia-bronze"
              }`}
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PressLogos;
