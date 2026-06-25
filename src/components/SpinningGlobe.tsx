import React, { useEffect, useRef } from "react";
import { motion, useAnimationFrame } from "framer-motion";

// --- topojson decoder ---
function decodeArcs(topo: any): number[][][] {
  const [sx, sy] = topo.transform.scale;
  const [tx, ty] = topo.transform.translate;
  return topo.arcs.map((arc: number[][]) => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx; y += dy;
      return [x * sx + tx, y * sy + ty];
    });
  });
}

function extractRings(geo: any, arcs: number[][][]): number[][][] {
  const rings: number[][][] = [];
  const flattenArcGroup = (indices: number[]) => {
    const ring: number[][] = [];
    for (const i of indices) {
      const arc = i >= 0 ? arcs[i] : [...arcs[~i]].reverse();
      ring.push(...arc);
    }
    rings.push(ring);
  };
  if (geo.type === "Polygon") geo.arcs.forEach(flattenArcGroup);
  else if (geo.type === "MultiPolygon") geo.arcs.forEach((p: number[][]) => p.forEach(flattenArcGroup));
  return rings;
}

// --- orthographic projection ---
const TILT = 18 * (Math.PI / 180);
const cosTilt = Math.cos(TILT);
const sinTilt = Math.sin(TILT);

function project(
  lon: number, lat: number, rotLon: number,
  cx: number, cy: number, r: number
): [number, number] | null {
  const λ = (lon - rotLon) * (Math.PI / 180);
  const φ = lat * (Math.PI / 180);
  const cosφ = Math.cos(φ), sinφ = Math.sin(φ);
  const cosλ = Math.cos(λ);
  if (sinTilt * sinφ + cosTilt * cosφ * cosλ < 0) return null;
  return [
    cx + r * cosφ * Math.sin(λ),
    cy - r * (cosTilt * sinφ - sinTilt * cosφ * cosλ),
  ];
}

function strokeRings(
  rings: number[][][],
  ctx: CanvasRenderingContext2D,
  rotLon: number, cx: number, cy: number, r: number
) {
  ctx.beginPath();
  for (const ring of rings) {
    let prev = false;
    for (const [lon, lat] of ring) {
      const p = project(lon, lat, rotLon, cx, cy, r);
      if (!p) { prev = false; continue; }
      if (!prev) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
      prev = true;
    }
  }
  ctx.stroke();
}

function buildGraticule(): number[][][] {
  const rings: number[][][] = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    const ring: number[][] = [];
    for (let lon = -180; lon <= 181; lon += 3) ring.push([lon, lat]);
    rings.push(ring);
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const ring: number[][] = [];
    for (let lat = -90; lat <= 90; lat += 3) ring.push([lon, lat]);
    rings.push(ring);
  }
  return rings;
}
const GRATICULE = buildGraticule();

// --- 3D orbit configuration ---
// Radii are expressed as multiples of globeRadius so they scale with `size`
const DEG = Math.PI / 180;
const ORBIT_RINGS = [
  { radiusFactor: 1.72, incl: 34 * DEG, period: 15000 },
  { radiusFactor: 1.88, incl: -24 * DEG, period: 21000 },
  { radiusFactor: 1.56, incl: 66 * DEG, period:  9500 },
] as const;

type RingIdx = 0 | 1 | 2;
type TagOrbit = { label: string; ring: RingIdx; phase: number };

function distributeToRings(tags: string[]): TagOrbit[] {
  const counts = [4, 4, 3];
  const result: TagOrbit[] = [];
  let idx = 0;
  for (let r = 0; r < 3; r++) {
    for (let j = 0; j < counts[r] && idx < tags.length; j++, idx++) {
      result.push({
        label: tags[idx],
        ring: r as RingIdx,
        phase: (j / counts[r]) * 2 * Math.PI,
      });
    }
  }
  return result;
}

// --- component ---
export default function SpinningGlobe({
  size = 280,
  orbitTags = [],
  isDark = false,
}: {
  size?: number;
  orbitTags?: string[];
  isDark?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geoRingsRef = useRef<number[][][] | null>(null);
  const rotRef = useRef(0);
  const rafRef = useRef<number>(0);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);
  const orbitsRef = useRef<TagOrbit[]>(distributeToRings(orbitTags));

  const globeR = size / 2;

  // Globe canvas draw loop
  useEffect(() => {
    let alive = true;
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then((topo: any) => {
        if (!alive) return;
        const arcs = decodeArcs(topo);
        const all: number[][][] = [];
        for (const geo of topo.objects.countries.geometries) {
          all.push(...extractRings(geo, arcs));
        }
        geoRingsRef.current = all;
      });

    const canvas = canvasRef.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, r = size / 2 - 2;

    function draw() {
      ctx.clearRect(0, 0, size, size);

      // Sphere base
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "#f4f3f0";
      ctx.fill();

      // Graticule
      ctx.strokeStyle = "rgba(0,0,0,0.07)";
      ctx.lineWidth = 0.5;
      strokeRings(GRATICULE, ctx, rotRef.current, cx, cy, r);

      // Country outlines
      if (geoRingsRef.current) {
        ctx.strokeStyle = "rgba(0,0,0,0.50)";
        ctx.lineWidth = 0.8;
        strokeRings(geoRingsRef.current, ctx, rotRef.current, cx, cy, r);
      }

      // Specular sheen
      const shine = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.38, r * 0.02, cx, cy, r);
      shine.addColorStop(0, "rgba(255,255,255,0.22)");
      shine.addColorStop(0.45, "rgba(255,255,255,0)");
      shine.addColorStop(1, "rgba(0,0,0,0.14)");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = shine;
      ctx.fill();

      // Border
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,0,0,0.13)";
      ctx.lineWidth = 0.75;
      ctx.stroke();

      rotRef.current = (rotRef.current + 0.18) % 360;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { alive = false; cancelAnimationFrame(rafRef.current); };
  }, [size]);

  // 3D moon orbit — direct DOM mutation, zero React re-renders
  useAnimationFrame((t) => {
    if (!orbitsRef.current.length) return;
    const cx = size / 2, cy = size / 2;

    orbitsRef.current.forEach((tag, i) => {
      const el = tagRefs.current[i];
      if (!el) return;

      const ring = ORBIT_RINGS[tag.ring];
      const radius = ring.radiusFactor * globeR;
      const θ = tag.phase + (t / ring.period) * 2 * Math.PI;

      const x = radius * Math.cos(θ);
      const y = radius * Math.sin(ring.incl) * Math.sin(θ);
      const z = radius * Math.cos(ring.incl) * Math.sin(θ);

      const depth = z / radius;           // −1 (back) → +1 (front)
      const depthNorm = (depth + 1) / 2;  // 0..1

      // Occlude moons behind the globe
      const screenDist = Math.sqrt(x * x + y * y);
      const hidden = depth < -0.06 && screenDist < globeR * 0.9;

      const scale = 0.42 + depthNorm * 0.78;
      const opacity = hidden ? 0 : 0.10 + depthNorm * 0.90;

      el.style.transform = `translate(${(cx + x).toFixed(1)}px,${(cy - y).toFixed(1)}px) translate(-50%,-50%) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
      el.style.zIndex = hidden ? "-1" : String(Math.round(depthNorm * 20));
    });
  });

  const pad = 72;
  const total = size + pad * 2;
  const center = total / 2;

  // Moon sphere gradient — monochrome stone, mimics a lit celestial body
  const moonGrad = isDark
    ? "radial-gradient(circle at 36% 30%, rgba(255,255,255,0.38) 0%, #b0aea8 38%, #787470 72%, #4a4845 100%)"
    : "radial-gradient(circle at 36% 30%, rgba(255,255,255,0.48) 0%, #cbc8c2 38%, #9a9795 70%, #6e6c6a 100%)";
  const moonShadow = "0 3px 10px rgba(0,0,0,0.32), inset 0 -2px 4px rgba(0,0,0,0.18)";
  const labelColor = isDark ? "rgba(220,218,214,0.88)" : "rgba(30,28,26,0.72)";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: total, height: total, overflow: "visible" }}
      aria-hidden
    >
      {/* Whirl ring 1 — slow CW dashes */}
      <motion.svg className="absolute inset-0 pointer-events-none" width={total} height={total}
        animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ originX: "50%", originY: "50%" }}
      >
        <circle cx={center} cy={center} r={globeR + pad * 0.26}
          fill="none" stroke="rgba(0,0,0,0.13)" strokeWidth="1.2"
          strokeDasharray="50 32" strokeLinecap="round" />
      </motion.svg>

      {/* Whirl ring 2 — medium CCW */}
      <motion.svg className="absolute inset-0 pointer-events-none" width={total} height={total}
        animate={{ rotate: -360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        style={{ originX: "50%", originY: "50%" }}
      >
        <circle cx={center} cy={center} r={globeR + pad * 0.48}
          fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.9"
          strokeDasharray="30 56" strokeLinecap="round" />
      </motion.svg>

      {/* Whirl ring 3 — fast CW fine dots */}
      <motion.svg className="absolute inset-0 pointer-events-none" width={total} height={total}
        animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        style={{ originX: "50%", originY: "50%" }}
      >
        <circle cx={center} cy={center} r={globeR + pad * 0.68}
          fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.7"
          strokeDasharray="7 30" strokeLinecap="round" />
      </motion.svg>

      {/* Ambient glow */}
      <div className="absolute rounded-full pointer-events-none" style={{
        width: globeR * 2 + 50,
        height: globeR * 2 + 50,
        background: "radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 68%)",
        filter: "blur(10px)",
      }} />

      {/* Globe canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, borderRadius: "50%", position: "relative", zIndex: 1 }}
      />

      {/* Moon orbit layer */}
      {orbitsRef.current.length > 0 && (
        <div
          className="absolute pointer-events-none"
          style={{ left: pad, top: pad, width: 0, height: 0, overflow: "visible" }}
        >
          {orbitsRef.current.map((tag, i) => (
            <div
              key={tag.label}
              ref={el => { tagRefs.current[i] = el; }}
              style={{
                position: "absolute",
                top: 0, left: 0,
                willChange: "transform, opacity",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {/* Moon sphere */}
              <div style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: moonGrad,
                boxShadow: moonShadow,
                border: "1px solid rgba(0,0,0,0.18)",
                flexShrink: 0,
              }} />
              {/* Label */}
              <span style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: "0.60rem",
                fontWeight: 700,
                letterSpacing: "0.07em",
                whiteSpace: "nowrap",
                color: labelColor,
                lineHeight: 1,
              }}>
                {tag.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
