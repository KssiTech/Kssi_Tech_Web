import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  PlayCircle,
  Settings2,
  Terminal,
  Wifi,
  WifiOff,
  ArrowRight,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useTheme } from "@/contexts/ThemeContext";

type ProductKey =
  | "random" | "serialization" | "vectorization" | "util"
  | "math"   | "pde"           | "exp"           | "date";

type ProductConfig = {
  slug:        ProductKey;
  name:        string;
  short:       string;
  description: string;
  status:      "active" | "planned";
};

const PRODUCTS: ProductConfig[] = [
  { slug: "random",        name: "Random",        short: "Controlled stochastic generation.",          description: "Generate reproducible random datasets for Monte Carlo and simulation experiments with instant summary metrics.", status: "active"  },
  { slug: "serialization", name: "Serialization",  short: "Data marshaling and storage pipelines.",    description: "Encode and decode data formats safely for compute pipelines and service interfaces.",                         status: "planned" },
  { slug: "vectorization", name: "Vectorization",  short: "SIMD acceleration for numeric workloads.",  description: "Optimize throughput for compute-heavy loops with vectorized execution paths.",                                status: "planned" },
  { slug: "util",          name: "Util",           short: "Core utility primitives.",                  description: "Shared utility functions used across services for reliability and consistency.",                             status: "planned" },
  { slug: "math",          name: "Math",           short: "Numerical methods and core math kernels.",  description: "Foundational mathematics services for analytics, pricing, and transformations.",                            status: "planned" },
  { slug: "pde",           name: "PDE",            short: "Partial differential equation solvers.",    description: "PDE-focused compute engines for advanced quantitative models.",                                              status: "planned" },
  { slug: "exp",           name: "exp",            short: "Experimental service lane.",                description: "Fast iteration area for new algorithms and prototype compute pipelines.",                                    status: "planned" },
  { slug: "date",          name: "Date",           short: "Date and calendar service primitives.",     description: "Day-count, schedules, and calendar utilities for quant workflows.",                                         status: "planned" },
];

type PluginInput = {
  name: string; type: "number" | "boolean" | "select" | string;
  label?: string; help?: string; default?: unknown;
  min?: number; max?: number; options?: string[];
};
type PluginMeta  = { id: string; title: string; description: string; execution: "server" | "client" | "both"; inputs?: PluginInput[] };
type StageLog    = { stage: string; code: number; stdout?: string; stderr?: string };

const GOLD    = "#C6A667";
const GOLD_T  = "rgba(198,166,103,0.12)";
const SUCCESS = "#10B981";
const DANGER  = "#EF4444";
const BLUE    = "#4e73df";
const BLUE_T  = "rgba(78,115,223,0.10)";

const ProductPage: React.FC = () => {
  const { slug }   = useParams<{ slug: string }>();
  const { isDark } = useTheme();
  const product    = useMemo(() => PRODUCTS.find((p) => p.slug === slug), [slug]);

  const [plugin,        setPlugin]        = useState<PluginMeta | null>(null);
  const [input,         setInput]         = useState<Record<string, unknown>>({});
  const [stageLogs,     setStageLogs]     = useState<StageLog[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>("Configure inputs and run the analysis.");
  const [source,        setSource]        = useState<"server" | "local" | null>(null);
  const [running,       setRunning]       = useState(false);
  const [runnerUp,      setRunnerUp]      = useState(false);
  const [activeStep,    setActiveStep]    = useState<string>("overview");

  const refs = {
    overview: useRef<HTMLDivElement>(null),
    config:   useRef<HTMLDivElement>(null),
    run:      useRef<HTMLDivElement>(null),
    output:   useRef<HTMLDivElement>(null),
    results:  useRef<HTMLDivElement>(null),
  };

  const pluginId = product?.slug === "random" ? "bprofin-random" : null;

  useEffect(() => {
    if (!pluginId) return;
    (async () => {
      try {
        const r    = await fetch("/api/plugins");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const found = (data.plugins ?? []).find((p: PluginMeta) => p.id === pluginId) ?? null;
        setPlugin(found);
        if (found) {
          const defaults: Record<string, unknown> = {};
          for (const f of found.inputs ?? []) defaults[f.name] = f.default;
          setInput(defaults);
        }
      } catch (e) {
        setStatusMessage(`Cannot load plugin metadata: ${String(e)}`);
      }
    })();
  }, [pluginId]);

  useEffect(() => {
    const ping = async () => {
      try { const r = await fetch("/local-runner/api/health"); setRunnerUp(r.ok); }
      catch { setRunnerUp(false); }
    };
    ping();
    const t = setInterval(ping, 8000);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (key: string) => {
    setActiveStep(key);
    refs[key as keyof typeof refs]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 pt-36 text-center">
          <h1 className="text-3xl font-bold mb-4">Product not found</h1>
          <p className="text-muted-foreground">Use a valid route like `/products/random`.</p>
        </div>
      </div>
    );
  }

  const runAnalysis = async () => {
    if (running) return;
    if (product.slug !== "random" || !pluginId) {
      setStageLogs([]);
      setStatusMessage(`${product.name} is planned. Switch to Random for a live run.`);
      scrollTo("output");
      return;
    }
    setRunning(true);
    setStatusMessage("Running on dashboard-api…");
    scrollTo("output");
    try {
      const sr   = await fetch("/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pluginId, args: input }) });
      const sd   = await sr.json().catch(() => ({}));
      const sl: StageLog[] = Array.isArray(sd.logs) ? sd.logs : [];
      if (sr.ok) {
        setSource("server"); setStageLogs(sl);
        setStatusMessage(sd.pass ? "Server run completed — PASS." : "Server run completed — FAIL.");
        setRunning(false); return;
      }
      if (!runnerUp) {
        setSource("server"); setStageLogs(sl);
        setStatusMessage(`Server failed, local-runner offline: ${sd.error ?? `HTTP ${sr.status}`}`);
        setRunning(false); return;
      }
      setStatusMessage("Server failed — trying local-runner…");
      const lr  = await fetch("/local-runner/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pluginId, args: input }) });
      const ld  = await lr.json().catch(() => ({}));
      const ll: StageLog[] = Array.isArray(ld.logs) ? ld.logs : [];
      setSource("local"); setStageLogs(ll);
      setStatusMessage(lr.ok ? "Local run completed." : `Local failed: ${ld.error ?? `HTTP ${lr.status}`}`);
      if (lr.ok) {
        await fetch("/api/runs/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pluginId, args: input, pass: Boolean(ld.pass), ok: ld.ok !== false, logs: ll, message: ld.message }) });
      }
    } catch (e) { setStatusMessage(`Network error: ${String(e)}`); setStageLogs([]); }
    finally     { setRunning(false); }
  };

  const extractNumbers = (logs: StageLog[]) => {
    const py  = logs.find((s) => s.stage === "python-run");
    const txt = String(py?.stdout ?? "");
    const s   = txt.indexOf("["), e = txt.lastIndexOf("]");
    if (s === -1 || e === -1 || e <= s) return [];
    return txt.slice(s + 1, e).replace(/\r?\n/g, " ").split(/\s+/).map((t) => Number(t.trim())).filter((n) => Number.isFinite(n));
  };

  const numbers  = extractNumbers(stageLogs);
  const mean     = numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : null;
  const variance = numbers.length && mean !== null ? numbers.reduce((acc, n) => acc + (n - mean) ** 2, 0) / numbers.length : null;
  const stdDev   = variance !== null ? Math.sqrt(variance) : null;
  const sorted   = [...numbers].sort((a, b) => a - b);
  const p95      = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : null;

  // ── Theme ────────────────────────────────────────────────────────────────────
  const T = isDark ? {
    page:    "#0a0a12",
    sidebar: "#0f0f1a",
    sidebarBr: "#1e1e2e",
    card:    "#131320",
    cardBr:  "#1e1e2e",
    input:   "#1a1a2e",
    textPri: "#F9FAFB",
    textSec: "#9CA3AF",
    textMut: "#6B7280",
    div:     "#1e1e2e",
    shadow:  "0 1px 4px rgba(0,0,0,0.5)",
  } : {
    page:    "#f4f6f9",
    sidebar: "#FFFFFF",
    sidebarBr: "#e3e6f0",
    card:    "#FFFFFF",
    cardBr:  "#e3e6f0",
    input:   "#f8f9fc",
    textPri: "#1a202c",
    textSec: "#6b7280",
    textMut: "#9ca3af",
    div:     "#e3e6f0",
    shadow:  "0 1px 3px rgba(58,59,69,0.12), 0 1px 2px rgba(58,59,69,0.08)",
  };

  const steps = [
    { key: "overview", label: "Overview",        icon: <Activity    size={14} /> },
    { key: "config",   label: "Configuration",   icon: <Settings2   size={14} /> },
    { key: "run",      label: "Run Analysis",     icon: <PlayCircle  size={14} /> },
    { key: "output",   label: "Output & Logs",   icon: <Terminal    size={14} /> },
    ...(numbers.length > 0 ? [{ key: "results", label: "Results", icon: <BarChart3 size={14} /> }] : []),
  ];

  const SectionHead = ({ step, icon, title, subtitle }: { step: number; icon: React.ReactNode; title: string; subtitle: string }) => (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
        style={{ background: `linear-gradient(135deg, ${GOLD}, #a07840)` }}>
        {step}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span style={{ color: GOLD }}>{icon}</span>
          <h3 className="text-base font-bold" style={{ color: T.textPri }}>{title}</h3>
        </div>
        <p className="text-[13px]" style={{ color: T.textSec }}>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{product.name} | KSSI TECH</title>
        <meta name="description" content={`${product.name} — ${product.short}`} />
      </Helmet>

      <Navigation />

      <div className="min-h-screen" style={{ background: T.page }}>

        {/* ── Breadcrumb bar ────────────────────────────────────────────────── */}
        <div className="border-b" style={{ background: T.card, borderColor: T.cardBr }}>
          <div className="max-w-screen-xl mx-auto px-6 py-3">
            <nav className="flex items-center gap-1.5 text-[12px]" style={{ color: T.textMut }}>
              <Link to="/" className="hover:underline" style={{ color: T.textSec }}>Home</Link>
              <ChevronRight size={12} />
              <Link to="/products/random" className="hover:underline" style={{ color: T.textSec }}>Products</Link>
              <ChevronRight size={12} />
              <span style={{ color: GOLD, fontWeight: 600 }}>{product.name}</span>
            </nav>
          </div>
        </div>

        {/* ── Body: sidebar + content ───────────────────────────────────────── */}
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="flex gap-7">

            {/* ════ LEFT SIDEBAR ════════════════════════════════════════════════ */}
            <aside className="w-56 flex-shrink-0">

              {/* Products list */}
              <div className="rounded-2xl border mb-5 overflow-hidden"
                style={{ background: T.sidebar, borderColor: T.sidebarBr, boxShadow: T.shadow }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: T.div }}>
                  <p className="text-[11px] font-bold tracking-[0.1em]" style={{ color: T.textMut }}>PRODUCTS</p>
                </div>
                <nav className="py-1">
                  {PRODUCTS.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/products/${p.slug}`}
                      className="flex items-center justify-between px-4 py-2.5 text-[13px] font-medium transition-colors"
                      style={p.slug === product.slug
                        ? { background: GOLD_T, color: GOLD, borderLeft: `3px solid ${GOLD}` }
                        : { color: T.textSec,   borderLeft: "3px solid transparent" }}
                    >
                      <span>{p.name}</span>
                      {p.status === "planned" && (
                        <span className="text-[10px] rounded px-1.5 py-0.5 font-semibold"
                          style={{ background: BLUE_T, color: BLUE }}>soon</span>
                      )}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Steps / TOC */}
              <div className="rounded-2xl border overflow-hidden sticky top-24"
                style={{ background: T.sidebar, borderColor: T.sidebarBr, boxShadow: T.shadow }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: T.div }}>
                  <p className="text-[11px] font-bold tracking-[0.1em]" style={{ color: T.textMut }}>ON THIS PAGE</p>
                </div>
                <nav className="py-1">
                  {steps.map((s, i) => (
                    <button
                      key={s.key}
                      onClick={() => scrollTo(s.key)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-left transition-colors"
                      style={activeStep === s.key
                        ? { background: GOLD_T, color: GOLD, borderLeft: `3px solid ${GOLD}` }
                        : { color: T.textSec,   borderLeft: "3px solid transparent" }}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={activeStep === s.key
                          ? { background: GOLD, color: "#fff" }
                          : { background: T.input, color: T.textMut }}>
                        {i + 1}
                      </span>
                      {s.label}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* ════ MAIN CONTENT ════════════════════════════════════════════════ */}
            <main className="flex-1 min-w-0 space-y-6">

              {/* ── STEP 1: Overview ─────────────────────────────────────────── */}
              <div ref={refs.overview} className="rounded-2xl border p-6"
                style={{ background: T.card, borderColor: T.cardBr, boxShadow: T.shadow }}>
                <SectionHead step={1} icon={<Activity size={16} />} title="Overview"
                  subtitle={`About the ${product.name} service and its capabilities.`} />

                {/* Product identity */}
                <div className="flex items-start gap-4 mb-6 pb-6 border-b"
                  style={{ borderColor: T.div }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: GOLD_T, border: `1px solid ${GOLD}40` }}>
                    <FlaskConical size={26} style={{ color: GOLD }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h2 className="text-xl font-bold" style={{ color: T.textPri }}>{product.name}</h2>
                      {/* Service status */}
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                        style={product.status === "active"
                          ? { background: `${SUCCESS}18`, color: SUCCESS }
                          : { background: BLUE_T,         color: BLUE    }}>
                        <span className="w-1.5 h-1.5 rounded-full"
                          style={{ background: product.status === "active" ? SUCCESS : BLUE }} />
                        {product.status === "active" ? "Active" : "Planned"}
                      </span>
                      {/* Runner status */}
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                        style={runnerUp
                          ? { background: `${SUCCESS}14`, color: SUCCESS }
                          : { background: `${DANGER}14`,  color: DANGER  }}>
                        {runnerUp ? <Wifi size={10} /> : <WifiOff size={10} />}
                        Local runner {runnerUp ? "online" : "offline"}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: T.textSec }}>
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Info cards */}
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Service Status", value: product.status === "active" ? "Active" : "Planned", color: product.status === "active" ? SUCCESS : BLUE },
                    { label: "Execution Mode", value: "Server + Local",                                    color: GOLD      },
                    { label: "Category",       value: "Solutions Industrielles",                              color: "#8B5CF6" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl p-4 border"
                      style={{ background: T.input, borderColor: T.cardBr }}>
                      <p className="text-[11px] font-semibold tracking-wide mb-1.5" style={{ color: T.textMut }}>
                        {item.label.toUpperCase()}
                      </p>
                      <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {product.status !== "active" && (
                  <div className="flex items-start gap-3 rounded-xl p-4 border"
                    style={{ background: BLUE_T, borderColor: `${BLUE}30` }}>
                    <CheckCircle2 size={16} style={{ color: BLUE, marginTop: 1, flexShrink: 0 }} />
                    <p className="text-[13px]" style={{ color: BLUE }}>
                      This product is in development. Switch to{" "}
                      <Link to="/products/random" className="font-bold underline">Random</Link>{" "}
                      to try a live run now.
                    </p>
                  </div>
                )}
              </div>

              {/* ── STEP 2: Configuration ────────────────────────────────────── */}
              <div ref={refs.config} className="rounded-2xl border p-6"
                style={{ background: T.card, borderColor: T.cardBr, boxShadow: T.shadow }}>
                <SectionHead step={2} icon={<Settings2 size={16} />} title="Configuration"
                  subtitle="Set input parameters before running the analysis." />

                {product.slug === "random" && plugin ? (
                  <div className="grid sm:grid-cols-2 gap-5">
                    {(plugin.inputs ?? []).map((field) => (
                      <label key={field.name} className="block">
                        <span className="text-[13px] font-semibold block mb-1" style={{ color: T.textPri }}>
                          {field.label ?? field.name}
                        </span>
                        {field.help && (
                          <span className="text-[12px] block mb-1.5" style={{ color: T.textMut }}>{field.help}</span>
                        )}
                        {field.type === "boolean" ? (
                          <div className="flex items-center gap-2">
                            <input type="checkbox"
                              checked={Boolean(input[field.name])}
                              onChange={(e) => setInput((prev) => ({ ...prev, [field.name]: e.target.checked }))}
                              className="w-4 h-4 rounded" style={{ accentColor: GOLD }} />
                            <span className="text-sm" style={{ color: T.textSec }}>Enabled</span>
                          </div>
                        ) : field.type === "select" ? (
                          <select
                            value={String(input[field.name] ?? "")}
                            onChange={(e) => setInput((prev) => ({ ...prev, [field.name]: e.target.value }))}
                            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                            style={{ background: T.input, color: T.textPri, borderColor: T.cardBr }}>
                            {(field.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input type="number"
                            min={field.min} max={field.max}
                            value={Number(input[field.name] ?? "")}
                            onChange={(e) => setInput((prev) => ({ ...prev, [field.name]: Number(e.target.value) }))}
                            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                            style={{ background: T.input, color: T.textPri, borderColor: T.cardBr }} />
                        )}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl p-5 text-sm border"
                    style={{ background: T.input, borderColor: T.cardBr, color: T.textMut }}>
                    {product.slug === "random"
                      ? "Loading plugin schema from dashboard-api…"
                      : "Input schema will appear once this product is active."}
                  </div>
                )}
              </div>

              {/* ── STEP 3: Run ──────────────────────────────────────────────── */}
              <div ref={refs.run} className="rounded-2xl border p-6"
                style={{ background: T.card, borderColor: T.cardBr, boxShadow: T.shadow }}>
                <SectionHead step={3} icon={<PlayCircle size={16} />} title="Run Analysis"
                  subtitle="Execute the configured analysis pipeline." />

                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    type="button"
                    onClick={runAnalysis}
                    disabled={running}
                    className="inline-flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all"
                    style={{
                      background: running ? T.textMut : `linear-gradient(135deg, ${GOLD}, #a07840)`,
                      cursor:     running ? "not-allowed" : "pointer",
                      boxShadow:  running ? "none" : `0 4px 14px ${GOLD}50`,
                    }}>
                    {running ? (
                      <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Running…</>
                    ) : (
                      <>Run Analysis <ArrowRight size={15} /></>
                    )}
                  </button>

                  {source && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px]" style={{ color: T.textMut }}>Last source:</span>
                      <span className="text-[12px] font-bold rounded-full px-3 py-1"
                        style={{ background: GOLD_T, color: GOLD }}>{source}</span>
                    </div>
                  )}
                </div>

                {product.status !== "active" && (
                  <p className="mt-4 text-[13px]" style={{ color: T.textMut }}>
                    This service is planned. Running will show a placeholder response.
                  </p>
                )}
              </div>

              {/* ── STEP 4: Output ───────────────────────────────────────────── */}
              <div ref={refs.output} className="rounded-2xl border p-6"
                style={{ background: T.card, borderColor: T.cardBr, boxShadow: T.shadow }}>
                <SectionHead step={4} icon={<Terminal size={16} />} title="Output & Logs"
                  subtitle="Stage-by-stage execution logs and status." />

                {/* Status bar */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 border"
                  style={{ background: T.input, borderColor: T.cardBr }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: running ? GOLD : stageLogs.length > 0 ? SUCCESS : T.textMut }} />
                  <p className="text-sm" style={{ color: T.textSec }}>{statusMessage}</p>
                </div>

                {stageLogs.length > 0 ? (
                  <div className="space-y-2">
                    {stageLogs.map((s, i) => (
                      <details
                        key={i}
                        open={s.code !== 0}
                        className="rounded-xl border overflow-hidden text-[13px]"
                        style={{ borderColor: s.code === 0 ? `${SUCCESS}40` : `${DANGER}40` }}>
                        <summary
                          className="cursor-pointer px-4 py-3 font-mono font-semibold flex items-center gap-2.5 select-none"
                          style={{
                            background: s.code === 0 ? `${SUCCESS}0c` : `${DANGER}0c`,
                            color:      s.code === 0 ? SUCCESS          : DANGER,
                          }}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: s.code === 0 ? SUCCESS : DANGER }} />
                          [{s.code === 0 ? "PASS" : `FAIL ${s.code}`}] {s.stage}
                        </summary>
                        {(s.stdout || s.stderr) && (
                          <div className="px-4 pb-4 pt-3" style={{ background: T.input }}>
                            {s.stdout && <pre className="whitespace-pre-wrap break-all text-[12px]" style={{ color: T.textSec }}>{s.stdout}</pre>}
                            {s.stderr && <pre className="whitespace-pre-wrap break-all text-[12px] mt-2" style={{ color: DANGER }}>{s.stderr}</pre>}
                          </div>
                        )}
                      </details>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl p-8 text-center border"
                    style={{ background: T.input, borderColor: T.cardBr }}>
                    <Terminal size={32} className="mx-auto mb-3" style={{ color: T.textMut }} />
                    <p className="text-sm font-medium" style={{ color: T.textSec }}>No output yet</p>
                    <p className="text-[12px] mt-1" style={{ color: T.textMut }}>Run the analysis to see execution logs here.</p>
                  </div>
                )}
              </div>

              {/* ── STEP 5: Results (post-run) ────────────────────────────────── */}
              {numbers.length > 0 && (
                <div ref={refs.results} className="rounded-2xl border p-6"
                  style={{ background: T.card, borderColor: T.cardBr, boxShadow: T.shadow }}>
                  <SectionHead step={5} icon={<BarChart3 size={16} />} title="Statistical Results"
                    subtitle={`${numbers.length} values generated — summary statistics below.`} />

                  {/* Stat grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    {[
                      { label: "Mean",    value: mean?.toFixed(6)                      ?? "—", color: GOLD    },
                      { label: "Std Dev", value: stdDev?.toFixed(6)                    ?? "—", color: "#8B5CF6" },
                      { label: "Min",     value: (sorted[0] ?? 0).toFixed(6),                  color: SUCCESS },
                      { label: "Max",     value: (sorted[sorted.length - 1] ?? 0).toFixed(6),  color: DANGER  },
                      { label: "P95",     value: p95?.toFixed(6)                       ?? "—", color: "#06B6D4" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-xl border p-4"
                        style={{ background: T.input, borderColor: T.cardBr }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                          <span className="text-[11px] font-bold tracking-wide" style={{ color: T.textMut }}>{m.label.toUpperCase()}</span>
                        </div>
                        <p className="text-sm font-bold font-mono" style={{ color: T.textPri }}>{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Raw preview */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[12px] font-semibold" style={{ color: T.textMut }}>RAW PREVIEW</p>
                      <p className="text-[12px]" style={{ color: T.textMut }}>First 12 of {numbers.length} values</p>
                    </div>
                    <pre className="rounded-xl px-5 py-4 text-[12px] font-mono overflow-x-auto border"
                      style={{ background: T.input, borderColor: T.cardBr, color: T.textSec }}>
                      {JSON.stringify(numbers.slice(0, 12), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

            </main>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductPage;
