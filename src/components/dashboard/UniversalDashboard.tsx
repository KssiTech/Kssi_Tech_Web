import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar,
} from 'recharts';
import type { UniversalDatasetProfile, UniversalColumn, RecommendedChart } from '@/lib/universalProfiler';

// ─── Palette ──────────────────────────────────────────────────────────────────

const PALETTE = ['#6c5ce6','#00b894','#fdcb6e','#e17055','#0984e3','#fd79a8','#55efc4','#a29bfe','#fab1a0','#81ecec'];
const ACCENT  = '#6c5ce6';
const COL_TYPE_COLOR: Record<string, string> = {
  numeric: '#0984e3', currency: '#00b894', percentage: '#fdcb6e',
  date: '#a29bfe', categorical: '#6c5ce6', status: '#fd79a8',
  boolean: '#55efc4', identifier: '#b2bec3', text: '#dfe6e9',
};
const COL_TYPE_LABEL: Record<string, string> = {
  numeric: 'Numérique', currency: 'Devise', percentage: 'Pourcentage',
  date: 'Date', categorical: 'Catégorie', status: 'Statut',
  boolean: 'Booléen', identifier: 'Identifiant', text: 'Texte',
};
const CONCEPT_EMOJI: Record<string, string> = {
  agency: '🏢', client: '👤', employee: '👷', status: '📊',
  amount: '💰', quantity: '🔢', date: '📅', product: '📦',
  category: '🏷️', identifier: '🔑', unknown: '❓',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | undefined): string {
  if (n === undefined || isNaN(n)) return '—';
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(n) >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

function fmtPct(r: number): string { return `${(r * 100).toFixed(1)}%`; }

function parseNum(v: string): number {
  return parseFloat(String(v).replace(/[^0-9.,\-]/g, '').replace(',', '.')) || 0;
}

// ─── Data builders ────────────────────────────────────────────────────────────

function buildBarData(
  data: Record<string, string>[],
  xCol: string,
  yCol: string,
  limit = 12,
): { name: string; value: number }[] {
  const g: Record<string, number> = {};
  for (const row of data) {
    const x = (row[xCol] || '(vide)').trim().slice(0, 30);
    const y = parseNum(row[yCol] || '0');
    g[x] = (g[x] || 0) + y;
  }
  return Object.entries(g)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
}

function buildPieData(
  data: Record<string, string>[],
  col: string,
  limit = 8,
): { name: string; value: number }[] {
  const c: Record<string, number> = {};
  for (const row of data) { const k = (row[col] || '(vide)').trim(); c[k] = (c[k] || 0) + 1; }
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, value]) => ({ name, value }));
}

function buildLineData(
  data: Record<string, string>[],
  xCol: string,
  yCol: string,
): { date: string; value: number; count: number }[] {
  const g: Record<string, number[]> = {};
  for (const row of data) {
    const x = (row[xCol] || '').trim();
    if (!x) continue;
    const key = x.split(' ')[0]; // strip time
    const y = parseNum(row[yCol] || '0');
    if (!g[key]) g[key] = [];
    g[key].push(y);
  }
  return Object.entries(g)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-60) // last 60 points max
    .map(([date, vals]) => ({
      date,
      value: Math.round(vals.reduce((a, b) => a + b, 0) * 100) / 100,
      count: vals.length,
    }));
}

function buildHistogramData(
  data: Record<string, string>[],
  col: string,
  bins = 10,
): { range: string; count: number }[] {
  const nums = data.map(r => parseNum(r[col] || '0')).filter(n => !isNaN(n));
  if (!nums.length) return [];
  const mn = Math.min(...nums);
  const mx = Math.max(...nums);
  const step = (mx - mn) / bins || 1;
  const counts = Array(bins).fill(0);
  nums.forEach(n => {
    const i = Math.min(Math.floor((n - mn) / step), bins - 1);
    counts[i]++;
  });
  return counts.map((count, i) => ({
    range: `${fmt(mn + i * step)}–${fmt(mn + (i + 1) * step)}`,
    count,
  }));
}

function buildScatterData(
  data: Record<string, string>[],
  xCol: string,
  yCol: string,
): { x: number; y: number }[] {
  return data
    .map(r => ({ x: parseNum(r[xCol] || '0'), y: parseNum(r[yCol] || '0') }))
    .filter(p => !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y))
    .slice(0, 300);
}

// ─── Chart renderer ───────────────────────────────────────────────────────────

interface ChartProps {
  chart: RecommendedChart;
  data: Record<string, string>[];
  crossFilter: Record<string, string>;
  onFilter: (col: string, val: string) => void;
  isDark?: boolean;
}

const TICK_STYLE = { fontSize: 10, fill: '#9398a8' };
const TT_STYLE   = { fontSize: 12, background: '#fff', border: '1px solid #eef0f4', borderRadius: 8, padding: '6px 10px' };

function UniversalChart({ chart, data, crossFilter, onFilter, isDark }: ChartProps) {
  const bg = isDark ? '#1e1f2a' : '#fff';

  const wrapStyle: React.CSSProperties = {
    background: bg, borderRadius: 16, padding: '16px 14px',
    border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : '#f0f1f5'}`,
    boxShadow: '0 2px 12px rgba(30,35,60,.06)',
  };

  if (chart.type === 'line' && chart.yColumn) {
    const chartData = buildLineData(data, chart.xColumn, chart.yColumn!);
    if (!chartData.length) return <div style={wrapStyle}><EmptyChart /></div>;
    return (
      <div style={wrapStyle}>
        <ChartTitle chart={chart} crossFilter={crossFilter} onFilter={onFilter} />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 24, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,.06)' : '#f0f1f5'} />
            <XAxis dataKey="date" tick={{ ...TICK_STYLE, fontSize: 9 }} angle={-35} textAnchor="end" interval="preserveStartEnd" />
            <YAxis tick={TICK_STYLE} width={45} tickFormatter={v => fmt(v)} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v: number) => [fmt(v), chart.yColumn]} />
            <Line type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart.type === 'bar' && chart.yColumn) {
    const chartData = buildBarData(data, chart.xColumn, chart.yColumn!);
    if (!chartData.length) return <div style={wrapStyle}><EmptyChart /></div>;
    const active = crossFilter[chart.xColumn];
    return (
      <div style={wrapStyle}>
        <ChartTitle chart={chart} crossFilter={crossFilter} onFilter={onFilter} />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 28, left: 0 }}
            onClick={e => e?.activeLabel && onFilter(chart.xColumn, e.activeLabel)}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,.06)' : '#f0f1f5'} />
            <XAxis dataKey="name" tick={{ ...TICK_STYLE, fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={TICK_STYLE} width={45} tickFormatter={v => fmt(v)} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v: number) => [fmt(v), chart.yColumn]} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} cursor="pointer">
              {chartData.map((entry, i) => (
                <Cell key={i} fill={active === entry.name ? '#e17055' : PALETTE[i % PALETTE.length]} opacity={active && active !== entry.name ? 0.4 : 1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart.type === 'pie') {
    const chartData = buildPieData(data, chart.xColumn);
    if (!chartData.length) return <div style={wrapStyle}><EmptyChart /></div>;
    const active = crossFilter[chart.xColumn];
    return (
      <div style={wrapStyle}>
        <ChartTitle chart={chart} crossFilter={crossFilter} onFilter={onFilter} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                dataKey="value" onClick={e => e?.name && onFilter(chart.xColumn, e.name)}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} opacity={active && active !== entry.name ? 0.35 : 1} cursor="pointer" />
                ))}
              </Pie>
              <Tooltip contentStyle={TT_STYLE} formatter={(v: number, _: string, p: { payload: { name: string } }) => [v, p.payload.name]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {chartData.slice(0, 8).map((d, i) => (
              <div key={i} onClick={() => onFilter(chart.xColumn, d.name)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', opacity: active && active !== d.name ? 0.4 : 1 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#1d2030', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                <span style={{ fontSize: 10, color: '#9398a8', fontWeight: 500 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (chart.type === 'histogram') {
    const chartData = buildHistogramData(data, chart.xColumn);
    if (!chartData.length) return <div style={wrapStyle}><EmptyChart /></div>;
    return (
      <div style={wrapStyle}>
        <ChartTitle chart={chart} crossFilter={crossFilter} onFilter={onFilter} />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 30, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,.06)' : '#f0f1f5'} />
            <XAxis dataKey="range" tick={{ ...TICK_STYLE, fontSize: 8 }} angle={-25} textAnchor="end" />
            <YAxis tick={TICK_STYLE} width={35} />
            <Tooltip contentStyle={TT_STYLE} />
            <Bar dataKey="count" fill={PALETTE[2]} radius={[3, 3, 0, 0]} name="Fréquence" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart.type === 'scatter' && chart.yColumn) {
    const chartData = buildScatterData(data, chart.xColumn, chart.yColumn!);
    if (!chartData.length) return <div style={wrapStyle}><EmptyChart /></div>;
    return (
      <div style={wrapStyle}>
        <ChartTitle chart={chart} crossFilter={crossFilter} onFilter={onFilter} />
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart margin={{ top: 4, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,.06)' : '#f0f1f5'} />
            <XAxis dataKey="x" type="number" tick={TICK_STYLE} name={chart.xColumn} tickFormatter={v => fmt(v)} />
            <YAxis dataKey="y" type="number" tick={TICK_STYLE} width={45} name={chart.yColumn} tickFormatter={v => fmt(v)} />
            <Tooltip contentStyle={TT_STYLE} cursor={{ strokeDasharray: '3 3' }}
              formatter={(v: number, n: string) => [fmt(v), n]} />
            <Scatter data={chartData} fill={ACCENT} fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}

function ChartTitle({ chart, crossFilter, onFilter }: { chart: RecommendedChart; crossFilter: Record<string, string>; onFilter: (col: string, val: string) => void }) {
  const active = crossFilter[chart.xColumn];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#1d2030' }}>{chart.title}</div>
      {active && (
        <div onClick={() => onFilter(chart.xColumn, active)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fdecec', color: '#e0564f', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
          × {active}
        </div>
      )}
    </div>
  );
}

function EmptyChart() {
  return <div style={{ textAlign: 'center', padding: '28px 0', color: '#b6bac6', fontSize: 12 }}>Données insuffisantes pour ce graphique</div>;
}

// ─── Column Quality Bar ───────────────────────────────────────────────────────

function FillBar({ rate, color }: { rate: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 4, background: '#eef0f4', overflow: 'hidden' }}>
        <div style={{ width: `${rate * 100}%`, height: '100%', background: color, borderRadius: 4, transition: 'width .4s' }} />
      </div>
      <span style={{ fontSize: 9.5, color: '#9398a8', fontWeight: 600, minWidth: 28 }}>{(rate * 100).toFixed(0)}%</span>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, color = ACCENT, icon }: { label: string; value: string; sub?: string; color?: string; icon: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f1f5', padding: '14px 16px', boxShadow: '0 2px 8px rgba(30,35,60,.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase' as const, letterSpacing: 1 }}>{label}</div>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1d2030', letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 10.5, color: '#9398a8', marginTop: 3, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

// ─── Radial quality gauge ─────────────────────────────────────────────────────

function QualityGauge({ score }: { score: number }) {
  const color = score >= 80 ? '#16a06f' : score >= 60 ? '#fdcb6e' : '#e17055';
  const data = [{ name: 'Score', value: score, fill: color }, { name: 'Reste', value: 100 - score, fill: '#eef0f4' }];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <ResponsiveContainer width={80} height={80}>
          <RadialBarChart cx={40} cy={40} innerRadius={28} outerRadius={38} startAngle={90} endAngle={-270} data={data}>
            <RadialBar dataKey="value" cornerRadius={4} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color }}>
          {score}
        </div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase' as const, letterSpacing: 1 }}>Qualité</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  profile: UniversalDatasetProfile;
  fileName: string;
  isDark?: boolean;
}

type UTab = 'report' | 'kpis' | 'charts' | 'data';

export function UniversalDashboard({ profile, fileName, isDark }: Props) {
  const [tab, setTab]           = useState<UTab>('report');
  const [crossFilter, setCF]    = useState<Record<string, string>>({});
  const [dataPage, setDataPage] = useState(1);
  const [sortCol, setSortCol]   = useState<string | null>(null);
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc');
  const DATA_PAGE_SIZE          = 20;

  const toggleFilter = useCallback((col: string, val: string) => {
    setCF(prev => {
      if (prev[col] === val) { const { [col]: _, ...rest } = prev; return rest; }
      return { ...prev, [col]: val };
    });
    setDataPage(1);
  }, []);

  const filteredData = useMemo(() => {
    if (!Object.keys(crossFilter).length) return profile.rawData;
    return profile.rawData.filter(row =>
      Object.entries(crossFilter).every(([col, val]) => (row[col] || '').trim().slice(0, 30) === val)
    );
  }, [profile.rawData, crossFilter]);

  const activeFilterCount = Object.keys(crossFilter).length;
  const bg  = isDark ? '#15171f' : '#f8f9fc';
  const card = isDark ? { background: '#1e1f2a', border: '1px solid rgba(255,255,255,.08)' } : { background: '#fff', border: '1px solid #f0f1f5' };

  // ── Tab bar ──
  const tabDefs: { key: UTab; label: string; icon: string }[] = [
    { key: 'report', label: 'Analyse IA', icon: '🔬' },
    { key: 'kpis',   label: `KPIs`,       icon: '📊' },
    { key: 'charts', label: `Graphiques${activeFilterCount > 0 ? ` (${activeFilterCount}🔎)` : ''}`, icon: '📈' },
    { key: 'data',   label: `Données (${filteredData.length})`, icon: '📋' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: bg, minHeight: '100%' }}>

      {/* Header strip */}
      <div style={{ ...card, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, color: '#9398a8', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 2 }}>
            Analyse universelle
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: isDark ? '#fff' : '#1d2030', letterSpacing: -0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fileName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, background: ACCENT + '15', color: ACCENT, borderRadius: 8, padding: '2px 8px' }}>
              {profile.datasetType}
            </span>
            <span style={{ fontSize: 11, color: '#9398a8' }}>{profile.rows.toLocaleString('fr-FR')} lignes · {profile.columns} colonnes</span>
          </div>
        </div>
        <QualityGauge score={profile.quality.score} />
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 3, background: isDark ? 'rgba(255,255,255,.06)' : '#fff', padding: 4, borderRadius: 14, border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : '#f0f1f5'}` }}>
        {tabDefs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 11, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: tab === t.key ? 700 : 500,
              background: tab === t.key ? (isDark ? 'rgba(108,92,230,.25)' : ACCENT + '14') : 'transparent',
              color: tab === t.key ? ACCENT : (isDark ? 'rgba(255,255,255,.5)' : '#9398a8'),
              transition: 'all .15s', whiteSpace: 'nowrap' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── RAPPORT ──────────────────────────────────────────────────────── */}
      {tab === 'report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Quality metrics row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
            {[
              { label: 'Lignes', value: profile.rows.toLocaleString('fr-FR'), icon: '📝', color: '#0984e3' },
              { label: 'Colonnes', value: String(profile.columns), icon: '📊', color: ACCENT },
              { label: 'Complétude', value: `${profile.quality.completeness}%`, icon: '✅', color: '#16a06f' },
              { label: 'Doublons', value: String(profile.quality.duplicateRows), icon: '🔁', color: profile.quality.duplicateRows > 0 ? '#e17055' : '#16a06f' },
              { label: 'Dates', value: String(profile.dates.length), icon: '📅', color: '#a29bfe' },
              { label: 'Mesures', value: String(profile.measures.length), icon: '💯', color: '#00b894' },
              { label: 'Dimensions', value: String(profile.dimensions.length), icon: '🏷️', color: '#fdcb6e' },
              { label: 'Statuts', value: String(profile.statuses.length), icon: '🚦', color: '#fd79a8' },
            ].map(m => (
              <KPICard key={m.label} {...m} />
            ))}
          </div>

          {/* Column breakdown */}
          <div style={{ ...card, borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#fff' : '#1d2030', marginBottom: 12 }}>
              🗂️ Colonnes détectées
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {profile.allColumns.map(col => (
                <div key={col.index} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: COL_TYPE_COLOR[col.universalType] || '#b2bec3', flexShrink: 0 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#e0e0e0' : '#1d2030', minWidth: 130, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {col.rawName}
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: COL_TYPE_COLOR[col.universalType], background: COL_TYPE_COLOR[col.universalType] + '18', borderRadius: 6, padding: '1px 6px', flexShrink: 0 }}>
                    {COL_TYPE_LABEL[col.universalType] || col.universalType}
                  </span>
                  <span style={{ fontSize: 10, color: '#9398a8', flexShrink: 0 }}>
                    {CONCEPT_EMOJI[col.businessConcept]} {col.cardinality} val.
                  </span>
                  <FillBar rate={col.fillRate} color={COL_TYPE_COLOR[col.universalType] || ACCENT} />
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies */}
          {profile.quality.anomalies.length > 0 && (
            <div style={{ ...card, borderRadius: 16, padding: 16, borderLeft: '3px solid #fdcb6e' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#fff' : '#1d2030', marginBottom: 10 }}>
                ⚠️ Anomalies détectées
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {profile.quality.anomalies.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: isDark ? '#e0e0e0' : '#4a4f63' }}>
                    <span style={{ color: '#fdcb6e', flexShrink: 0 }}>•</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended charts preview */}
          <div style={{ ...card, borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#fff' : '#1d2030', marginBottom: 10 }}>
              📈 Graphiques recommandés
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {profile.recommendedCharts.slice(0, 6).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14 }}>
                    {c.type === 'line' ? '📉' : c.type === 'bar' ? '📊' : c.type === 'pie' ? '🥧' : c.type === 'scatter' ? '⚪' : c.type === 'histogram' ? '📶' : '📋'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#e0e0e0' : '#1d2030' }}>{c.title}</div>
                    <div style={{ fontSize: 10.5, color: '#9398a8' }}>{c.reason}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setTab('charts')}
              style={{ marginTop: 12, width: '100%', padding: '9px', borderRadius: 12, background: ACCENT + '15', color: ACCENT, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
              Voir tous les graphiques →
            </button>
          </div>
        </div>
      )}

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      {tab === 'kpis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Numeric KPIs */}
          {profile.measures.map(col => (
            <div key={col.rawName} style={{ ...card, borderRadius: 16, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9398a8', marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: 1 }}>
                💯 {col.rawName}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {[
                  { k: 'Total',   v: fmt(col.sum),    icon: '∑',  c: '#0984e3' },
                  { k: 'Moyenne', v: fmt(col.mean),   icon: 'μ',  c: ACCENT },
                  { k: 'Maximum', v: fmt(col.max),    icon: '▲',  c: '#16a06f' },
                  { k: 'Minimum', v: fmt(col.min),    icon: '▼',  c: '#e17055' },
                  { k: 'Médiane', v: fmt(col.median), icon: '⊕',  c: '#fdcb6e' },
                  { k: 'Rempli',  v: fmtPct(col.fillRate), icon: '●', c: '#a29bfe' },
                ].map(s => (
                  <div key={s.k} style={{ background: isDark ? 'rgba(255,255,255,.04)' : '#f8f9fc', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 9.5, color: '#9398a8', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: .5 }}>{s.k}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.c, marginTop: 2 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Status/categorical distribution KPIs */}
          {[...profile.statuses, ...profile.dimensions.filter(d => d.cardinality <= 15)].map(col => (
            col.topValues && col.topValues.length > 0 && (
              <div key={col.rawName} style={{ ...card, borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9398a8', marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: 1 }}>
                  🏷️ {col.rawName} — {col.cardinality} valeurs
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {col.topValues.slice(0, 8).map((tv, i) => {
                    const pct = profile.rawData.length > 0 ? tv.count / profile.rawData.length : 0;
                    const isFiltered = crossFilter[col.rawName] === tv.value;
                    return (
                      <div key={i} onClick={() => toggleFilter(col.rawName, tv.value)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', borderRadius: 8, padding: '4px 6px', background: isFiltered ? ACCENT + '12' : 'transparent', transition: 'background .12s' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: isDark ? '#e0e0e0' : '#1d2030', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tv.value}</span>
                        <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, height: 4, borderRadius: 4, background: '#eef0f4' }}>
                            <div style={{ width: `${pct * 100}%`, height: '100%', background: PALETTE[i % PALETTE.length], borderRadius: 4, transition: 'width .3s' }} />
                          </div>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#9398a8', minWidth: 30, textAlign: 'right' }}>{tv.count}</span>
                          <span style={{ fontSize: 10, color: '#b6bac6', minWidth: 34, textAlign: 'right' }}>{(pct * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}

          {profile.measures.length === 0 && profile.statuses.length === 0 && (
            <div style={{ ...card, borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#9398a8' }}>Aucune colonne numérique ou statut détectée</div>
              <div style={{ fontSize: 12, color: '#b6bac6', marginTop: 6 }}>Les KPIs automatiques nécessitent des colonnes numériques ou des colonnes de statut.</div>
            </div>
          )}
        </div>
      )}

      {/* ── GRAPHIQUES ───────────────────────────────────────────────────── */}
      {tab === 'charts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Active cross-filters */}
          {activeFilterCount > 0 && (
            <div style={{ ...card, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9398a8' }}>🔎 Filtres actifs :</span>
              {Object.entries(crossFilter).map(([col, val]) => (
                <div key={col} onClick={() => toggleFilter(col, val)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: ACCENT + '15', color: ACCENT, borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  {col} = {val} ×
                </div>
              ))}
              <button onClick={() => setCF({})}
                style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#e17055', background: '#fdecec', border: 'none', borderRadius: 8, padding: '3px 10px', cursor: 'pointer' }}>
                Tout effacer
              </button>
            </div>
          )}

          {/* Stats row for filtered data */}
          {activeFilterCount > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
              <KPICard label="Sélection" value={String(filteredData.length)} icon="🎯" color="#e17055" />
              <KPICard label="Total" value={String(profile.rawData.length)} icon="📝" color="#9398a8" />
              <KPICard label="Ratio" value={profile.rawData.length > 0 ? `${((filteredData.length / profile.rawData.length) * 100).toFixed(1)}%` : '—'} icon="📊" color={ACCENT} />
            </div>
          )}

          {/* Chart grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {profile.recommendedCharts
              .filter(c => c.type !== 'table')
              .map(chart => (
                <UniversalChart
                  key={chart.id}
                  chart={chart}
                  data={filteredData}
                  crossFilter={crossFilter}
                  onFilter={toggleFilter}
                  isDark={isDark}
                />
              ))}
          </div>

          {profile.recommendedCharts.filter(c => c.type !== 'table').length === 0 && (
            <div style={{ ...card, borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#9398a8' }}>Aucun graphique généré automatiquement</div>
              <div style={{ fontSize: 12, color: '#b6bac6', marginTop: 6 }}>Ajoutez des colonnes numériques ou de dates dans votre fichier pour activer les graphiques.</div>
            </div>
          )}
        </div>
      )}

      {/* ── DONNÉES ──────────────────────────────────────────────────────── */}
      {tab === 'data' && (() => {
        const sorted = sortCol
          ? [...filteredData].sort((a, b) => {
              const av = a[sortCol] || '', bv = b[sortCol] || '';
              // Only sort numerically when the entire string is a pure number
              const an = /^\s*-?\d+(\.\d+)?\s*$/.test(av) ? parseFloat(av) : NaN;
              const bn = /^\s*-?\d+(\.\d+)?\s*$/.test(bv) ? parseFloat(bv) : NaN;
              const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : av.localeCompare(bv);
              return sortDir === 'asc' ? cmp : -cmp;
            })
          : filteredData;

        const totalPages = Math.ceil(sorted.length / DATA_PAGE_SIZE);
        const pageData   = sorted.slice((dataPage - 1) * DATA_PAGE_SIZE, dataPage * DATA_PAGE_SIZE);
        const cols       = profile.allColumns;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#fff' : '#1d2030' }}>
                {sorted.length.toLocaleString('fr-FR')} enregistrements
                {activeFilterCount > 0 && <span style={{ color: ACCENT }}> (filtrés)</span>}
              </div>
              <button
                onClick={() => {
                  const header = profile.allColumns.map(c => c.rawName).join(',');
                  const body   = filteredData.map(row => profile.allColumns.map(c => `"${(row[c.rawName] || '').replace(/"/g, '""')}"`).join(',')).join('\n');
                  const blob   = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
                  const url    = URL.createObjectURL(blob);
                  const a      = document.createElement('a');
                  a.href = url; a.download = `export_${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click(); URL.revokeObjectURL(url);
                }}
                style={{ padding: '7px 14px', borderRadius: 10, background: '#e4f7ef', color: '#16a06f', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                ↓ Exporter CSV
              </button>
            </div>

            <div style={{ ...card, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: isDark ? 'rgba(255,255,255,.04)' : '#f8f9fc' }}>
                      {cols.map(col => (
                        <th key={col.rawName}
                          onClick={() => { if (sortCol === col.rawName) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col.rawName); setSortDir('asc'); } }}
                          style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#9398a8', fontSize: 10.5, textTransform: 'uppercase' as const, letterSpacing: .5, cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                          {col.rawName}
                          {sortCol === col.rawName ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((row, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#f3f4f8'}` }}>
                        {cols.map(col => (
                          <td key={col.rawName} style={{ padding: '9px 12px', color: isDark ? '#e0e0e0' : '#1d2030', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row[col.rawName] || <span style={{ color: '#b6bac6' }}>—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ padding: '10px 14px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,.06)' : '#f0f1f5'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#9398a8' }}>Page {dataPage} / {totalPages}</span>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[
                      { label: '«', action: () => setDataPage(1), disabled: dataPage === 1 },
                      { label: '‹', action: () => setDataPage(p => Math.max(1, p - 1)), disabled: dataPage === 1 },
                      { label: '›', action: () => setDataPage(p => Math.min(totalPages, p + 1)), disabled: dataPage === totalPages },
                      { label: '»', action: () => setDataPage(totalPages), disabled: dataPage === totalPages },
                    ].map(btn => (
                      <button key={btn.label} onClick={btn.action} disabled={btn.disabled}
                        style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: btn.disabled ? 'default' : 'pointer', fontSize: 12, fontWeight: 700, background: btn.disabled ? '#f4f5f8' : ACCENT + '15', color: btn.disabled ? '#b6bac6' : ACCENT }}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
