import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area, Legend, ReferenceLine,
} from 'recharts';
import type { ProcessedRecord, TeamStats } from '@/types/dashboard';
import { STATUS_META } from '@/types/dashboard';
import {
  buildDailyBars, buildWeeklyBars, buildMonthlyBars,
  buildStatusDonut, buildDelayHistogram, buildWeekdayHeatmap,
  equipeShort, debitNum,
} from '@/hooks/useExcelData';

const ACCENT = '#6c5ce6';

// ─── Shared tooltip style ────────────────────────────────────────────────────
const tooltipStyle = {
  background: '#1d2030',
  border: 'none',
  borderRadius: 12,
  color: '#fff',
  fontSize: 12.5,
  fontWeight: 600,
  padding: '8px 14px',
  boxShadow: '0 8px 24px rgba(0,0,0,.18)',
};

const axisStyle = { fontSize: 11, fill: '#b6bac6', fontWeight: 600 };

// ─── Card wrapper ────────────────────────────────────────────────────────────
const ChartCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, subtitle, children, action }) => (
  <div style={{
    background: '#fff', borderRadius: 20,
    boxShadow: '0 6px 20px rgba(30,35,60,.05)', padding: '22px 24px',
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -.2, color: '#1d2030' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#9398a8', marginTop: 3, fontWeight: 500 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ─── 1. Installations per day (Bar + Line cumul) ─────────────────────────────
type DayMode = 'bar' | 'area' | 'cumul';

export const InstallationsOverTime: React.FC<{ records: ProcessedRecord[] }> = ({ records }) => {
  const [mode, setMode] = useState<DayMode>('bar');
  const daily  = buildDailyBars(records);
  const weekly = buildWeeklyBars(records);
  const monthly = buildMonthlyBars(records);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

  const data = granularity === 'day' ? daily
    : granularity === 'week' ? weekly
    : monthly;
  const xKey = granularity === 'day' ? 'date' : granularity === 'week' ? 'week' : 'month';

  const TabBtn: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <div onClick={onClick} style={{
      padding: '6px 13px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer',
      background: active ? ACCENT : '#f4f5f8',
      color: active ? '#fff' : '#6c7184',
      transition: 'all .15s', userSelect: 'none',
    }}>{label}</div>
  );

  return (
    <ChartCard
      title="Évolution des installations"
      subtitle={`${records.filter(r => r._status === 'installe').length} réalisées`}
      action={
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, background: '#f4f5f8', padding: 4, borderRadius: 11 }}>
            {(['day', 'week', 'month'] as const).map(g => (
              <TabBtn key={g} label={g === 'day' ? 'Jour' : g === 'week' ? 'Semaine' : 'Mois'}
                active={granularity === g} onClick={() => setGranularity(g)} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, background: '#f4f5f8', padding: 4, borderRadius: 11 }}>
            {(['bar', 'area', 'cumul'] as const).map(m => (
              <TabBtn key={m} label={m === 'bar' ? 'Barres' : m === 'area' ? 'Aire' : 'Cumulé'}
                active={mode === m} onClick={() => setMode(m)} />
            ))}
          </div>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={220}>
        {mode === 'cumul' ? (
          <AreaChart data={daily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACCENT} stopOpacity={0.25} />
                <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f8" vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="cumul" stroke={ACCENT} fill="url(#cumGrad)"
              strokeWidth={2.5} dot={false} name="Cumulé" />
          </AreaChart>
        ) : mode === 'area' ? (
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="instGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16c79a" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#16c79a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACCENT} stopOpacity={0.18} />
                <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f8" vertical={false} />
            <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="installe" stroke="#16c79a" fill="url(#instGrad)"
              strokeWidth={2} dot={false} name="Installées" />
            <Area type="monotone" dataKey="planifie" stroke={ACCENT} fill="url(#planGrad)"
              strokeWidth={2} dot={false} name="Planifiées" />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f8" vertical={false} />
            <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="installe" name="Installées" fill="#16c79a" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="planifie" name="Planifiées" fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={28} fillOpacity={0.55} />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </ChartCard>
  );
};

// ─── 2. Status donut ──────────────────────────────────────────────────────────
export const StatusDonut: React.FC<{
  records: ProcessedRecord[];
  onStatusClick?: (status: string) => void;
}> = ({ records, onStatusClick }) => {
  const data = buildStatusDonut(records);
  const total = data.reduce((a, d) => a + d.value, 0);

  const renderLabel = ({ cx, cy }: { cx: number; cy: number }) => (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-8" style={{ fontSize: 28, fontWeight: 800, fill: '#1d2030' }}>{total}</tspan>
      <tspan x={cx} dy="22" style={{ fontSize: 12, fontWeight: 600, fill: '#9398a8' }}>total</tspan>
    </text>
  );

  return (
    <ChartCard title="Répartition des statuts" subtitle="Cliquer pour filtrer">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data} cx="50%" cy="50%"
              innerRadius={50} outerRadius={72}
              dataKey="value" paddingAngle={2}
              labelLine={false}
              label={renderLabel}
              onClick={(d) => onStatusClick?.(d.status)}
              style={{ cursor: onStatusClick ? 'pointer' : 'default' }}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`${v} (${total ? Math.round(v / total * 100) : 0}%)`, name]} />
          </PieChart>
        </ResponsiveContainer>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {data.map((d, i) => (
            <div key={i}
              onClick={() => onStatusClick?.(d.status)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: onStatusClick ? 'pointer' : 'default',
                padding: '6px 10px', borderRadius: 10,
                transition: 'background .15s',
              }}
              onMouseEnter={e => onStatusClick && ((e.currentTarget as HTMLDivElement).style.background = '#f8f9fc')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#4a4f63' }}>{d.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1d2030' }}>{d.value}</span>
                <span style={{ fontSize: 11.5, color: '#9398a8', fontWeight: 600, minWidth: 32, textAlign: 'right' }}>
                  {total ? Math.round(d.value / total * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};

// ─── 3. Team leaderboard ─────────────────────────────────────────────────────
export const TeamLeaderboard: React.FC<{
  teams: TeamStats[];
  onTeamClick?: (name: string) => void;
}> = ({ teams, onTeamClick }) => {
  const [metric, setMetric] = useState<'taux' | 'installe' | 'avgDelay'>('taux');

  const data = [...teams].map(t => ({
    name: t.name,
    taux: t.taux,
    installe: t.installe,
    avgDelay: t.avgDelay ?? 0,
    color: t.color,
  }));

  const barColor = (val: number, key: string) => {
    if (key === 'avgDelay') return val > 5 ? '#e0564f' : val > 2 ? '#d99a2b' : '#16c79a';
    if (key === 'taux') return val >= 70 ? '#16c79a' : val >= 40 ? '#d99a2b' : '#e0564f';
    return ACCENT;
  };

  return (
    <ChartCard
      title="Performance équipes"
      subtitle="Classement par taux d'installation"
      action={
        <div style={{ display: 'flex', gap: 4, background: '#f4f5f8', padding: 4, borderRadius: 11 }}>
          {([['taux', 'Taux'], ['installe', 'Volume'], ['avgDelay', 'Délai']] as const).map(([k, l]) => (
            <div key={k} onClick={() => setMetric(k)}
              style={{
                padding: '5px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
                background: metric === k ? ACCENT : 'transparent',
                color: metric === k ? '#fff' : '#6c7184',
                cursor: 'pointer', userSelect: 'none', transition: 'all .15s',
              }}>{l}</div>
          ))}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {data.map((t, i) => {
          const val = t[metric];
          const max = Math.max(...data.map(d => d[metric]), 1);
          const pct = Math.round((val / max) * 100);
          const color = barColor(val, metric);
          return (
            <div key={i}
              onClick={() => onTeamClick?.(t.name)}
              style={{ cursor: onTeamClick ? 'pointer' : 'default' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: t.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1d2030' }}>{t.name}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color }}>
                  {metric === 'taux' ? `${val}%` : metric === 'avgDelay' ? `${val}j` : val}
                </span>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: '#f3f4f8', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width .6s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
};

// ─── 4. Delay histogram ───────────────────────────────────────────────────────
export const DelayHistogram: React.FC<{ records: ProcessedRecord[] }> = ({ records }) => {
  const data = buildDelayHistogram(records);
  const hasData = data.some(d => d.count > 0);

  return (
    <ChartCard title="Distribution des délais" subtitle="Jours entre planification et installation">
      {!hasData ? (
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b6bac6', fontSize: 13, fontWeight: 600 }}>
          Aucune donnée de délai disponible
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f8" vertical={false} />
            <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" name="Installations" radius={[5, 5, 0, 0]} maxBarSize={36}>
              {data.map((entry, i) => (
                <Cell key={i}
                  fill={entry.label === '< 0j' || entry.label === '0j' || entry.label === '1-2j'
                    ? '#16c79a' : entry.label === '3-5j' ? '#d99a2b' : '#e0564f'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};

// ─── 5. Weekday heatmap (bar) ─────────────────────────────────────────────────
export const WeekdayHeatmap: React.FC<{ records: ProcessedRecord[] }> = ({ records }) => {
  const data = buildWeekdayHeatmap(records);
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <ChartCard title="Activité par jour" subtitle="Installations réalisées par jour de semaine">
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 }}>
        {data.map((d, i) => {
          const pct = Math.round((d.count / max) * 100);
          const isTop = d.count === max && max > 0;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: isTop ? ACCENT : '#9398a8' }}>{d.count}</div>
              <div style={{
                width: '100%', maxWidth: 32,
                height: Math.max(8, pct * 1.2),
                borderRadius: 6,
                background: isTop ? ACCENT : `rgba(108,92,230,${0.15 + pct * 0.007})`,
                transition: 'height .5s ease',
              }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: isTop ? ACCENT : '#9398a8' }}>{d.day}</div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
};

// ─── 6. Debit distribution ────────────────────────────────────────────────────
export const DebitBreakdown: React.FC<{
  records: ProcessedRecord[];
  onDebitClick?: (debit: string) => void;
}> = ({ records, onDebitClick }) => {
  const debits = [20, 50, 100];
  const colors: Record<number, string> = { 20: '#16c79a', 50: '#5b8def', 100: ACCENT };
  const total = records.length || 1;

  const data = debits.map(d => {
    const sub = records.filter(r => r._debitNum === d);
    const installed = sub.filter(r => r._status === 'installe').length;
    return {
      label: `${d} Méga`,
      total: sub.length,
      installed,
      rate: sub.length ? Math.round((installed / sub.length) * 100) : 0,
      pct: Math.round((sub.length / total) * 100),
      color: colors[d],
      debit: String(d),
    };
  }).filter(d => d.total > 0);

  return (
    <ChartCard title="Répartition par débit" subtitle="Distribution et taux de succès">
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" tick={{ ...axisStyle, fontSize: 12.5 }} axisLine={false} tickLine={false} width={68} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [v, name === 'installed' ? 'Installées' : 'Total']} />
          <Bar dataKey="total" fill="#f3f4f8" radius={[0, 6, 6, 0]} maxBarSize={18} />
          <Bar dataKey="installed" radius={[0, 6, 6, 0]} maxBarSize={18}
            onClick={(d) => onDebitClick?.(d.debit)}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
        {data.map((d, i) => (
          <div key={i} style={{
            flex: '1 1 80px', background: '#f8f9fc', borderRadius: 10,
            padding: '8px 10px', cursor: onDebitClick ? 'pointer' : 'default',
            borderTop: `3px solid ${d.color}`,
          }}
            onClick={() => onDebitClick?.(d.debit)}
          >
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1d2030' }}>{d.total}</div>
            <div style={{ fontSize: 11, color: '#9398a8', fontWeight: 600 }}>{d.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: d.rate >= 70 ? '#16a06f' : '#d99a2b', marginTop: 2 }}>{d.rate}% inst.</div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
};

// ─── 7. Forecast panel ───────────────────────────────────────────────────────
import type { Forecast } from '@/hooks/useExcelData';

export const ForecastPanel: React.FC<{ forecast: Forecast }> = ({ forecast }) => {
  const items = [
    {
      label: 'Prob. complétion cette semaine',
      value: `${forecast.completionProbability}%`,
      color: forecast.completionProbability >= 70 ? '#16a06f' : forecast.completionProbability >= 40 ? '#d99a2b' : '#e0564f',
      bg: forecast.completionProbability >= 70 ? '#e4f7ef' : forecast.completionProbability >= 40 ? '#fdf3e3' : '#fdecec',
    },
    {
      label: 'Volume prévu semaine prochaine',
      value: `${forecast.nextWeekVolume}`,
      color: '#5b8def',
      bg: '#e8f0fd',
    },
    {
      label: 'Taux prédit fin de période',
      value: `${forecast.predictedRate}%`,
      color: forecast.predictedRate >= 90 ? '#16a06f' : '#d99a2b',
      bg: forecast.predictedRate >= 90 ? '#e4f7ef' : '#fdf3e3',
    },
  ];

  return (
    <ChartCard title="Prévisions" subtitle="Basé sur la tendance historique">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: item.bg, borderRadius: 12, padding: '12px 16px',
          }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#4a4f63' }}>{item.label}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</span>
          </div>
        ))}

        {forecast.teamWorkload.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .4, marginBottom: 10 }}>
              Charge équipe prévue
            </div>
            {forecast.teamWorkload.map((t, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
                  <span style={{ color: '#4a4f63' }}>{t.name}</span>
                  <span style={{ color: '#9398a8' }}>{t.pending} en attente · cap. {t.capacity}</span>
                </div>
                <div style={{ height: 6, background: '#f3f4f8', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((t.pending / Math.max(t.capacity, 1)) * 100))}%`,
                    background: t.pending > t.capacity ? '#e0564f' : '#16c79a',
                    borderRadius: 4,
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ChartCard>
  );
};
