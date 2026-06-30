import * as XLSX from 'xlsx';
import { detectSchema, extractRawRecords, extractRawSheetData, DEFAULT_SCHEMA } from '@/lib/schemaDetector';
import type { SchemaDetectionResult, RawRecord } from '@/lib/schemaDetector';
import { profileDataset } from '@/lib/universalProfiler';
import type { UniversalDatasetProfile } from '@/lib/universalProfiler';
import { STATUS_RULES, UNREACHABLE_PATTERNS } from '@/config/statusKeywords';
import { profileData, computeCapabilities } from '@/lib/dataProfiler';
import type {
  CanonicalRecord, ProcessedRecord, Status,
  KPIData, TeamStats, Alert, Insight, Filters, DataCapabilities, DataProfile,
} from '@/types/dashboard';
import { STATUS_META } from '@/types/dashboard';

export type { SchemaDetectionResult, RawRecord };

// ─── Pure string helpers ──────────────────────────────────────────────────────

export function parseDate(s: string): Date | null {
  if (!s) return null;
  const str = String(s).trim();
  // DD/MM/YYYY or D/M/YY
  const m1 = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/.exec(str);
  if (m1) {
    let y = +m1[3]; if (y < 100) y += 2000;
    const d = new Date(y, +m1[2] - 1, +m1[1]);
    return isNaN(d.getTime()) ? null : d;
  }
  // YYYY-MM-DD
  const m2 = /^(\d{4})[\/\-](\d{2})[\/\-](\d{2})/.exec(str);
  if (m2) {
    const d = new Date(+m2[1], +m2[2] - 1, +m2[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  // Excel serial (rare when raw:false but guard it)
  const num = parseFloat(str);
  if (!isNaN(num) && num > 40000 && num < 60000) {
    const d = new Date((num - 25569) * 86400 * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function fmtDate(s: string): string {
  const d = parseDate(s); if (!d) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function fmtDateLong(s: string): string {
  const d = parseDate(s); if (!d) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Extract a clean team display name from raw team field values
// Handles "EQUIPE hamza KSSITECH", "Hamza", "Team Hamza OGIF", etc.
export function extractTeamName(raw: string): string {
  if (!raw) return '—';
  let s = raw
    .replace(/equipe\s*/gi, '')
    .replace(/kssi\s*tech/gi, '')
    .replace(/\bogif\b/gi, '')
    .replace(/\bteam\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) s = raw.trim();
  // Take only the first word if it looks like a name
  const firstWord = s.split(/\s+/)[0];
  if (firstWord && firstWord.length >= 2) {
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  }
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// Extract numeric debit from various formats: "20 Méga Fibre", "50M", "100 Mbps", "100"
export function extractDebitNum(raw: string): number | null {
  if (!raw) return null;
  const m = /(\d+)\s*(?:m[ée]ga|mbps|mb\/s|\bm\b)/i.exec(raw)
    || /^(\d{2,3})$/.exec(raw.trim()); // bare number 20/50/100
  return m ? +m[1] : null;
}

export function debitShort(raw: string): string {
  const n = extractDebitNum(raw); return n ? `${n} M` : (raw || '—');
}

export function initials(name: string): string {
  const p = String(name || '').trim().split(/\s+/);
  return ((p[0] || '?')[0] + ((p[1] || '')[0] || '')).toUpperCase();
}

export function colorFor(name: string): string {
  const c = ['#16c79a', '#5b8def', '#9b7ce6', '#e0876b', '#d9a93e', '#3fb6c4', '#c46fa8'];
  let h = 0; for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return c[h % c.length];
}

export function nowTs(): string {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function getISOWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function median(arr: number[]): number | null {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ─── Status classification (uses statusKeywords config) ───────────────────────

export function classifyStatus(r: CanonicalRecord): Status {
  const comment   = String(r.comment   || '').toLowerCase();
  const rawStatus = String(r.raw_status || '').toLowerCase();
  const installDate = parseDate(r.installation_date || '');
  const planifDate  = parseDate(r.planned_date      || '');

  for (const rule of STATUS_RULES) {
    if (rule.commentPatterns.some(p => p.test(comment)))   return rule.status;
    if (rule.statusPatterns .some(p => p.test(rawStatus))) return rule.status;
    if (rule.status === 'installe' && installDate)          return 'installe';
    if (rule.status === 'planifie' && planifDate)           return 'planifie';
    if (rule.status === 'attente')                          return 'attente';
  }
  return 'attente';
}

const WEEKDAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

// ─── Convert RawRecord → CanonicalRecord ──────────────────────────────────────

export function rawToCanonical(raw: RawRecord): CanonicalRecord {
  return {
    client:            raw['_cf_client']            || raw['nom'] || undefined,
    team:              raw['_cf_team']              || raw['equipe'] || undefined,
    raw_status:        raw['_cf_status']            || raw['etat'] || undefined,
    planned_date:      raw['_cf_planned_date']      || raw['planif'] || undefined,
    installation_date: raw['_cf_installation_date'] || raw['date_installation'] || undefined,
    offer:             raw['_cf_offer']             || raw['debit'] || undefined,
    sip:               raw['_cf_sip']               || undefined,
    router:            raw['_cf_router']            || raw['routeur'] || undefined,
    comment:           raw['_cf_comment']           || raw['comm'] || undefined,
    planner:           raw['_cf_planner']           || undefined,
    sub_type:          raw['_cf_sub_type']          || undefined,
    week_number:       raw['_cf_week_number']       || undefined,
    _raw: raw,
  };
}

// ─── Deduplicate ──────────────────────────────────────────────────────────────

function deduplicate(records: CanonicalRecord[]): CanonicalRecord[] {
  const seen = new Set<string>();
  return records.filter(r => {
    const key = `${(r.sip || '')}|${(r.client || '')}`.toLowerCase().replace(/\s+/g, '');
    if (!key || key === '|') return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Process CanonicalRecord[] → ProcessedRecord[] ───────────────────────────

export function processRecords(canonical: CanonicalRecord[]): ProcessedRecord[] {
  const deduped = deduplicate(canonical);

  return deduped.map(r => {
    const installDate = parseDate(r.installation_date || '');
    const planifDate  = parseDate(r.planned_date      || '');
    const status      = classifyStatus(r);

    const delayDays = (installDate && planifDate)
      ? Math.round((installDate.getTime() - planifDate.getTime()) / 86400000)
      : null;

    const refDate  = installDate || planifDate;
    const teamName = extractTeamName(r.team || '');

    // Normalize SIP field
    let sip = r.sip || '';
    if (sip && !sip.toLowerCase().startsWith('sip')) sip = 'SIP ' + sip;

    return {
      ...r,
      sip,
      _status:      status,
      _teamName:    teamName,
      _debitNum:    extractDebitNum(r.offer || ''),
      _installDate: installDate,
      _planifDate:  planifDate,
      _delayDays:   delayDays,
      _week:    refDate ? getISOWeek(refDate)        : null,
      _month:   refDate ? refDate.getMonth() + 1     : null,
      _quarter: refDate ? Math.ceil((refDate.getMonth() + 1) / 3) : null,
      _year:    refDate ? refDate.getFullYear()       : null,
      _weekday: refDate ? WEEKDAYS[refDate.getDay()]  : null,
    };
  });
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export function applyFilters(records: ProcessedRecord[], f: Filters): ProcessedRecord[] {
  return records.filter(r => {
    if (f.team   && f.team   !== 'all' && r._teamName.toLowerCase() !== f.team.toLowerCase()) return false;
    if (f.status && f.status !== 'all' && r._status  !== f.status)   return false;
    if (f.debit  && f.debit  !== 'all' && String(r._debitNum) !== f.debit) return false;
    if (f.week   && f.week   !== 'all' && String(r._week)  !== f.week)     return false;
    if (f.month  && f.month  !== 'all' && String(r._month) !== f.month)    return false;
    if (f.sousType  && f.sousType  !== 'all' && r.sub_type !== f.sousType) return false;
    if (f.planneur  && f.planneur  !== 'all' && r.planner  !== f.planneur) return false;

    const refDate = r._installDate || r._planifDate;
    if (f.dateFrom && refDate) {
      const from = parseDate(f.dateFrom.split('-').reverse().join('/'));
      if (from && refDate < from) return false;
    }
    if (f.dateTo && refDate) {
      const to = parseDate(f.dateTo.split('-').reverse().join('/'));
      if (to && refDate > to) return false;
    }
    if (f.searchText) {
      const q = f.searchText.toLowerCase();
      const inClient = (r.client || '').toLowerCase().includes(q);
      const inTeam   = r._teamName.toLowerCase().includes(q);
      const inSIP    = (r.sip || '').toLowerCase().includes(q);
      const inComm   = (r.comment || '').toLowerCase().includes(q);
      if (!inClient && !inTeam && !inSIP && !inComm) return false;
    }
    return true;
  });
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export function computeKPIs(records: ProcessedRecord[]): KPIData {
  const total    = records.length;
  const installe = records.filter(r => r._status === 'installe').length;
  const planifie = records.filter(r => r._status === 'planifie').length;
  const bloque   = records.filter(r => r._status === 'bloque').length;
  const annule   = records.filter(r => r._status === 'annule').length;
  const attente  = records.filter(r => r._status === 'attente').length;

  const delays = records.filter(r => r._delayDays !== null).map(r => r._delayDays as number);
  const avgDelay    = delays.length ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : null;
  const medianDelay = median(delays);

  const withBoth  = records.filter(r => r._status === 'installe' && r._planifDate);
  const onTime    = withBoth.filter(r => (r._delayDays ?? 0) <= 3).length;
  const slaCompliance = withBoth.length ? Math.round((onTime / withBoth.length) * 100) : 0;

  const activeTeams   = new Set(records.map(r => r._teamName).filter(n => n && n !== '—')).size;
  const uniqueClients = new Set(records.map(r => (r.client || '').toLowerCase().trim())).size;
  const injoignables  = records.filter(r => UNREACHABLE_PATTERNS.some(p => p.test(r.comment || ''))).length;

  return {
    total, installe, planifie, bloque, annule, attente,
    taux: total ? Math.round((installe / total) * 100) : 0,
    avgDelay, medianDelay, slaCompliance,
    activeTeams, uniqueClients, injoignables,
  };
}

// ─── Team stats ───────────────────────────────────────────────────────────────

export function computeTeamStats(records: ProcessedRecord[]): TeamStats[] {
  const names = [...new Set(records.map(r => r._teamName))].filter(n => n && n !== '—');
  return names.map(name => {
    const sub     = records.filter(r => r._teamName === name);
    const installe = sub.filter(r => r._status === 'installe').length;
    const delays   = sub.filter(r => r._delayDays !== null).map(r => r._delayDays as number);
    return {
      name, color: colorFor(name),
      total:    sub.length,
      installe,
      bloque:   sub.filter(r => r._status === 'bloque').length,
      annule:   sub.filter(r => r._status === 'annule').length,
      planifie: sub.filter(r => r._status === 'planifie').length,
      attente:  sub.filter(r => r._status === 'attente').length,
      taux:     sub.length ? Math.round((installe / sub.length) * 100) : 0,
      avgDelay: delays.length ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : null,
    };
  }).sort((a, b) => b.taux - a.taux);
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export function generateAlerts(
  records: ProcessedRecord[],
  kpis: KPIData,
  teams: TeamStats[],
  caps: DataCapabilities,
): Alert[] {
  const alerts: Alert[] = [];

  if (caps.hasTeam) {
    const lowTeams = teams.filter(t => t.total >= 3 && t.taux < 70);
    if (lowTeams.length) alerts.push({
      type: 'warning', title: 'Équipes sous-performantes',
      message: `${lowTeams.length} équipe(s) en dessous de 70% de taux d'installation`,
      count: lowTeams.length,
      items: lowTeams.map(t => `${t.name} — ${t.taux}%`),
    });
  }

  if (caps.hasDelayAnalysis) {
    const longDelays = records.filter(r => r._delayDays !== null && r._delayDays > 7);
    if (longDelays.length) alerts.push({
      type: 'error', title: 'Retards importants (> 7 jours)',
      message: `${longDelays.length} installation(s) avec plus de 7 jours de retard`,
      count: longDelays.length,
      items: longDelays.slice(0, 3).map(r => `${r.client || '—'} — ${r._delayDays}j`),
    });
  }

  if (kpis.total > 0 && (kpis.annule / kpis.total) > 0.1) {
    alerts.push({
      type: 'warning', title: 'Taux d\'annulation élevé',
      message: `${Math.round((kpis.annule / kpis.total) * 100)}% des demandes sont annulées`,
      count: kpis.annule, items: [],
    });
  }

  if (caps.hasPlannedDate) {
    const missingPlanif = records.filter(r => !r.planned_date && r._status !== 'installe');
    if (missingPlanif.length) alerts.push({
      type: 'info', title: 'Dates de planification manquantes',
      message: `${missingPlanif.length} demande(s) sans date de planification`,
      count: missingPlanif.length,
      items: missingPlanif.slice(0, 3).map(r => r.client || '—'),
    });
  }

  if (kpis.bloque > 0) alerts.push({
    type: 'error', title: 'Installations bloquées',
    message: `${kpis.bloque} installation(s) bloquée(s) nécessitent une intervention`,
    count: kpis.bloque,
    items: records.filter(r => r._status === 'bloque').slice(0, 3).map(r => `${r.client || '—'} — ${r.raw_status || ''}`),
  });

  if (caps.hasComment && kpis.injoignables > 0) alerts.push({
    type: 'info', title: 'Clients injoignables',
    message: `${kpis.injoignables} client(s) à recontacter pour débloquer les installations`,
    count: kpis.injoignables, items: [],
  });

  return alerts;
}

// ─── Insights ─────────────────────────────────────────────────────────────────

export function generateInsights(
  records: ProcessedRecord[],
  kpis: KPIData,
  teams: TeamStats[],
  caps: DataCapabilities,
): Insight[] {
  const insights: Insight[] = [];

  if (caps.hasTeam && teams.length > 0) {
    const best = teams[0];
    insights.push({
      type: 'success', icon: '🏆', title: 'Meilleure équipe',
      body: `L'équipe ${best.name} domine avec ${best.taux}% de taux de réalisation (${best.installe}/${best.total} installations).`,
      value: `${best.taux}%`,
    });
    const worst = [...teams].sort((a, b) => a.taux - b.taux)[0];
    if (worst && worst.name !== best.name) {
      insights.push({
        type: worst.taux < 50 ? 'error' : 'warning', icon: '⚠️', title: 'Équipe à renforcer',
        body: `L'équipe ${worst.name} affiche seulement ${worst.taux}% de réalisation. Un rééquilibrage de charge est recommandé.`,
        value: `${worst.taux}%`,
      });
    }
  }

  if (caps.hasTimeSeriesData) {
    const dayCount: Record<string, number> = {};
    records.filter(r => r._installDate).forEach(r => { const k = fmtDate(r.installation_date || ''); dayCount[k] = (dayCount[k] || 0) + 1; });
    const peak = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
    if (peak) insights.push({
      type: 'info', icon: '📈', title: 'Journée record',
      body: `Le ${peak[0]} est la journée la plus productive avec ${peak[1]} installations réalisées.`,
      value: `${peak[1]} inst.`,
    });
  }

  const needed = Math.max(0, Math.ceil(kpis.total * 0.9) - kpis.installe);
  if (needed > 0) {
    insights.push({
      type: 'warning', icon: '🎯', title: 'Objectif 90%',
      body: `Il manque ${needed} installation(s) pour atteindre 90%. Relancez les ${kpis.injoignables} client(s) injoignables et levez les ${kpis.bloque} blocage(s).`,
      value: `${kpis.taux}%`,
    });
  } else if (kpis.taux >= 90) {
    insights.push({ type: 'success', icon: '✅', title: 'Objectif atteint', body: `Excellent ! Le taux de ${kpis.taux}% dépasse l'objectif de 90%.`, value: `${kpis.taux}%` });
  }

  if (caps.hasDelayAnalysis && kpis.avgDelay !== null) {
    const good = kpis.avgDelay <= 2;
    insights.push({
      type: good ? 'success' : 'warning', icon: '⏱️', title: 'Délai moyen',
      body: good
        ? `Les installations sont réalisées en moyenne ${kpis.avgDelay} jour(s) après la date planifiée — performance satisfaisante.`
        : `Délai moyen de ${kpis.avgDelay} jours. Optimiser la planification pourrait le réduire.`,
      value: `${kpis.avgDelay}j`,
    });
  }

  if (caps.hasOffer) {
    const debitCounts: Record<number, number> = {};
    records.forEach(r => { if (r._debitNum) debitCounts[r._debitNum] = (debitCounts[r._debitNum] || 0) + 1; });
    const dom = Object.entries(debitCounts).sort((a, b) => +b[1] - +a[1])[0];
    if (dom) insights.push({
      type: 'info', icon: '📡', title: 'Offre dominante',
      body: `Le forfait ${dom[0]} Méga est le plus demandé (${dom[1]} clients, ${kpis.total ? Math.round(+dom[1] / kpis.total * 100) : 0}% du portefeuille).`,
      value: `${dom[0]}M`,
    });
  }

  return insights;
}

// ─── Forecasting ──────────────────────────────────────────────────────────────

export interface Forecast {
  completionProbability: number;
  nextWeekVolume:        number;
  predictedRate:         number;
  teamWorkload: { name: string; pending: number; capacity: number }[];
}

export function computeForecast(records: ProcessedRecord[], kpis: KPIData, teams: TeamStats[]): Forecast {
  const byDay: Record<string, number> = {};
  records.filter(r => r._installDate).forEach(r => {
    const k = r._installDate!.toISOString().slice(0, 10);
    byDay[k] = (byDay[k] || 0) + 1;
  });
  const vals = Object.values(byDay);
  const avgDaily = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1;
  const nextWeekVolume = Math.round(avgDaily * 5);
  const pending = kpis.planifie + kpis.attente;
  const completionProbability = pending > 0 ? Math.min(100, Math.round((nextWeekVolume / pending) * 100)) : 100;
  const predictedRate = kpis.total > 0 ? Math.min(100, Math.round(((kpis.installe + Math.min(nextWeekVolume, pending)) / kpis.total) * 100)) : 0;
  const teamWorkload = teams.map(t => ({
    name: t.name,
    pending: t.planifie + t.attente,
    capacity: Math.max(1, Math.round(nextWeekVolume * (t.total / Math.max(kpis.total, 1)))),
  }));
  return { completionProbability, nextWeekVolume, predictedRate, teamWorkload };
}

// ─── Chart data builders (schema-aware) ───────────────────────────────────────

export interface DayBar   { date: string; installe: number; planifie: number; cumul: number; }
export interface WeekBar  { week: string; installe: number; planifie: number; }
export interface MonthBar { month: string; installe: number; planifie: number; }

const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

export function buildDailyBars(records: ProcessedRecord[]): DayBar[] {
  const map: Record<string, { i: number; p: number }> = {};
  records.forEach(r => {
    const d = r._installDate ? r._installDate.toISOString().slice(0, 10)
      : r._planifDate ? r._planifDate.toISOString().slice(0, 10) : null;
    if (!d) return;
    if (!map[d]) map[d] = { i: 0, p: 0 };
    if (r._status === 'installe') map[d].i++;
    if (r._status === 'planifie') map[d].p++;
  });
  let cum = 0;
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([iso, v]) => {
    cum += v.i;
    const [y, m, d] = iso.split('-');
    return { date: `${d}/${m}`, installe: v.i, planifie: v.p, cumul: cum };
  });
}

export function buildWeeklyBars(records: ProcessedRecord[]): WeekBar[] {
  const map: Record<string, { i: number; p: number }> = {};
  records.forEach(r => {
    if (!r._week) return;
    const k = `S${r._week}`;
    if (!map[k]) map[k] = { i: 0, p: 0 };
    if (r._status === 'installe') map[k].i++;
    if (r._status === 'planifie') map[k].p++;
  });
  return Object.entries(map)
    .sort(([a], [b]) => +a.slice(1) - +b.slice(1))
    .map(([week, v]) => ({ week, installe: v.i, planifie: v.p }));
}

export function buildMonthlyBars(records: ProcessedRecord[]): MonthBar[] {
  const map: Record<number, { i: number; p: number }> = {};
  records.forEach(r => {
    if (!r._month) return;
    if (!map[r._month]) map[r._month] = { i: 0, p: 0 };
    if (r._status === 'installe') map[r._month].i++;
    if (r._status === 'planifie') map[r._month].p++;
  });
  return Object.entries(map).sort(([a], [b]) => +a - +b).map(([m, v]) => ({
    month: MONTH_NAMES[+m - 1], installe: v.i, planifie: v.p,
  }));
}

export function buildSparkline(records: ProcessedRecord[], status: Status, days = 10): { v: number }[] {
  const now = Date.now();
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(now - (days - 1 - i) * 86400000);
    const count = records.filter(r => {
      const d = r._installDate || r._planifDate;
      return d
        && d.getFullYear() === day.getFullYear()
        && d.getMonth() === day.getMonth()
        && d.getDate() === day.getDate()
        && r._status === status;
    }).length;
    return { v: count };
  });
}

export function buildStatusDonut(records: ProcessedRecord[]) {
  return (['installe', 'planifie', 'bloque', 'annule', 'attente'] as Status[])
    .map(s => ({ name: STATUS_META[s].label, value: records.filter(r => r._status === s).length, color: STATUS_META[s].color, status: s }))
    .filter(d => d.value > 0);
}

export function buildDelayHistogram(records: ProcessedRecord[]) {
  const buckets: Record<string, number> = { '< 0j': 0, '0j': 0, '1-2j': 0, '3-5j': 0, '6-10j': 0, '> 10j': 0 };
  records.filter(r => r._delayDays !== null).forEach(r => {
    const d = r._delayDays as number;
    if (d < 0) buckets['< 0j']++;
    else if (d === 0) buckets['0j']++;
    else if (d <= 2) buckets['1-2j']++;
    else if (d <= 5) buckets['3-5j']++;
    else if (d <= 10) buckets['6-10j']++;
    else buckets['> 10j']++;
  });
  return Object.entries(buckets).map(([label, count]) => ({ label, count }));
}

export function buildWeekdayHeatmap(records: ProcessedRecord[]) {
  const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  return days.map(day => ({
    day, count: records.filter(r => r._weekday === day && r._status === 'installe').length,
  }));
}

// ─── Excel file ingestion ─────────────────────────────────────────────────────

export interface ParseResult {
  canonical:       CanonicalRecord[];
  schema:          SchemaDetectionResult;
  profile:         DataProfile;
  caps:            DataCapabilities;
  universalProfile: UniversalDatasetProfile;
}

export type { UniversalDatasetProfile };

export function parseExcelBuffer(
  buffer:   ArrayBuffer,
  fileName: string,
): ParseResult {
  // 1. Detect schema
  const schema = detectSchema(buffer);

  // 2. Extract raw records using detected schema
  const rawRecords = extractRawRecords(buffer, schema);

  // 3. Convert to canonical
  const canonical = rawRecords
    .map(rawToCanonical)
    .filter(r => r.client?.trim()); // must have a client/nom value

  // 4. Profile & capabilities
  const caps    = computeCapabilities(schema);
  const profile = profileData(canonical, schema, fileName);

  // 5. Universal profiling (works with any column structure)
  const { headers, rows } = extractRawSheetData(buffer);
  const universalProfile = profileDataset(headers, rows);

  return { canonical, schema, profile, caps, universalProfile };
}

// ─── AI assistant (schema-aware) ──────────────────────────────────────────────

export function aiResponse(
  q:       string,
  records: ProcessedRecord[],
  kpis:    KPIData,
  teams:   TeamStats[],
  caps:    DataCapabilities,
): string {
  const ql = q.toLowerCase();

  if (/taux|install/i.test(ql) && !/replan|relancer/i.test(ql)) {
    return `Taux d'installation actuel : ${kpis.taux}% (${kpis.installe}/${kpis.total} demandes).\n${kpis.bloque} bloquée(s), ${kpis.annule} annulée(s). Pour atteindre 90%, il faut ${Math.max(0, Math.ceil(kpis.total * 0.9) - kpis.installe)} installations supplémentaires.`;
  }

  if (/bloqu|blocage/i.test(ql)) {
    const list = records.filter(r => r._status === 'bloque');
    return `${list.length} demande(s) bloquée(s) :\n${list.map(r => `• ${r.client || '—'}${r.sip ? ' (' + r.sip + ')' : ''} — ${r.raw_status || ''}`).join('\n')}\n\nAction recommandée : vérifier les documents et replanifier sous 48h.`;
  }

  if (caps.hasComment && /injoign|indispon|relancer/i.test(ql)) {
    const list = records.filter(r => UNREACHABLE_PATTERNS.some(p => p.test(r.comment || '')));
    if (!list.length) return 'Aucun client injoignable ou indisponible détecté dans les commentaires.';
    return `${list.length} client(s) à relancer :\n${list.map(r => `• ${r.client || '—'} — ${r.comment || ''}`).join('\n')}\n\nAppel recommandé entre 10h et 17h.`;
  }

  if (caps.hasPlannedDate && /replan|retard|planif/i.test(ql)) {
    const list = records.filter(r => r._status === 'planifie').sort((a, b) => (a._planifDate?.getTime() ?? 0) - (b._planifDate?.getTime() ?? 0));
    if (!list.length) return 'Aucune installation planifiée en attente.';
    return `${list.length} installation(s) planifiée(s) :\n${list.slice(0, 5).map(r => `• ${r.client || '—'} — ${fmtDateLong(r.planned_date || '')}`).join('\n')}${list.length > 5 ? `\n… et ${list.length - 5} autres.` : ''}`;
  }

  if (caps.hasPlannedDate && /optimis|planning|organis/i.test(ql)) {
    const byDay: Record<string, number> = {};
    records.filter(r => r._status === 'planifie').forEach(r => { if (r.planned_date) byDay[r.planned_date] = (byDay[r.planned_date] || 0) + 1; });
    const sorted = Object.entries(byDay).sort((a, b) => a[1] - b[1]);
    return `Répartition du planning :\n${sorted.map(([d, n]) => `• ${fmtDateLong(d)} : ${n} installation(s)`).join('\n')}\n\nSuggestion : regrouper par zone géographique.`;
  }

  if (/rapport|résumé|resume|hebdo/i.test(ql)) {
    return `📊 Rapport FTTH — Synthèse\n\n• Total : ${kpis.total}\n• Installées : ${kpis.installe} (${kpis.taux}%)\n• Planifiées : ${kpis.planifie}\n• Bloquées : ${kpis.bloque}\n• Annulées : ${kpis.annule}\n• En attente : ${kpis.attente}${caps.hasDelayAnalysis ? `\n• SLA compliance : ${kpis.slaCompliance}%\n• Délai moyen : ${kpis.avgDelay ?? '—'}j` : ''}\n\nObjectif 90% : ${Math.max(0, Math.ceil(kpis.total * 0.9) - kpis.installe)} installations requises.`;
  }

  if (caps.hasOffer && /débit|debit|méga|offre/i.test(ql)) {
    const counts: Record<number, number> = {};
    records.forEach(r => { if (r._debitNum) counts[r._debitNum] = (counts[r._debitNum] || 0) + 1; });
    return `Répartition par débit :\n${Object.entries(counts).sort((a, b) => +a[0] - +b[0]).map(([d, n]) => `• ${d} Méga : ${n} clients (${kpis.total ? Math.round(+n / kpis.total * 100) : 0}%)`).join('\n')}`;
  }

  if (caps.hasTeam && /équipe|equipe/i.test(ql)) {
    return teams.map(t => `• ${t.name} : ${t.installe}/${t.total} (${t.taux}%)${caps.hasDelayAnalysis && t.avgDelay !== null ? ` · délai moy. ${t.avgDelay}j` : ''}`).join('\n');
  }

  if (caps.hasDelayAnalysis && /délai|retard|sla/i.test(ql)) {
    return `Délai moyen : ${kpis.avgDelay ?? '—'} jours\nDélai médian : ${kpis.medianDelay ?? '—'} jours\nSLA compliance (≤ 3j) : ${kpis.slaCompliance}%\nRetards > 7j : ${records.filter(r => (r._delayDays ?? 0) > 7).length}`;
  }

  if (caps.hasTeam && /compar|vs|versus/i.test(ql)) {
    return teams.map(t => `${t.name} : ${t.taux}% (${t.installe}/${t.total}) | Bloquées: ${t.bloque} | Annulées: ${t.annule}`).join('\n');
  }

  if (/annul/i.test(ql)) {
    const list = records.filter(r => r._status === 'annule');
    return `${list.length} demande(s) annulée(s) :\n${list.slice(0, 5).map(r => `• ${r.client || '—'} — ${r.comment || ''}`).join('\n')}${list.length > 5 ? `\n… et ${list.length - 5} autres.` : ''}`;
  }

  if (/prévisio|forecast|prochain/i.test(ql)) {
    const byDay: Record<string, number> = {};
    records.filter(r => r._installDate).forEach(r => {
      const k = r._installDate!.toISOString().slice(0, 10);
      byDay[k] = (byDay[k] || 0) + 1;
    });
    const vals = Object.values(byDay);
    const avgDaily = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1;
    const nextWeek = Math.round(avgDaily * 5);
    const pending = kpis.planifie + kpis.attente;
    const completionProb = pending > 0 ? Math.min(100, Math.round((nextWeek / pending) * 100)) : 100;
    const predictedRate = kpis.total > 0 ? Math.min(100, Math.round(((kpis.installe + Math.min(nextWeek, pending)) / kpis.total) * 100)) : 0;
    return `Rythme moyen : ${avgDaily.toFixed(1)} installation(s)/jour\nVolume estimé semaine prochaine : ${nextWeek} installations\nProbabilité de complétion : ${completionProb}%\nTaux prévu fin de période : ${predictedRate}%`;
  }

  // Schema-aware help text listing only available features
  const capabilities: string[] = [
    "• Taux d'installation & objectif 90%",
    caps.hasComment ? "• Clients injoignables à relancer" : null,
    "• Demandes bloquées ou annulées",
    caps.hasPlannedDate ? "• Planning & optimisation" : null,
    "• Rapport synthèse",
    caps.hasOffer ? "• Répartition par débit/offre" : null,
    caps.hasTeam  ? "• Performance par équipe" : null,
    caps.hasDelayAnalysis ? "• Délais & SLA" : null,
    "• Prévisions",
  ].filter(Boolean) as string[];

  return `Je peux vous aider sur :\n${capabilities.join('\n')}\n\nQuelle analyse souhaitez-vous ?`;
}

// ─── Real Claude API call ─────────────────────────────────────────────────────

function buildFtthContext(
  records: ProcessedRecord[],
  kpis: KPIData,
  teams: TeamStats[],
  caps: DataCapabilities,
): string {
  const teamLines = teams.map(t =>
    `• ${t.name}: ${t.installe}/${t.total} installées (${t.taux}%)${caps.hasDelayAnalysis && t.avgDelay !== null ? `, délai moy. ${t.avgDelay}j` : ''}`
  ).join('\n');

  return `Tu es l'assistant IA du tableau de bord KSSI TECH, spécialisé dans le suivi des installations fibre optique FTTH au Maroc.

DONNÉES ACTUELLES (${records.length} enregistrements) :
- Total demandes : ${kpis.total}
- Installées : ${kpis.installe} (${kpis.taux}%)
- Planifiées : ${kpis.planifie}
- Bloquées : ${kpis.bloque}
- Annulées : ${kpis.annule}
- En attente : ${kpis.attente}
${caps.hasDelayAnalysis ? `- Délai moyen : ${kpis.avgDelay ?? '—'} jours\n- SLA compliance (≤3j) : ${kpis.slaCompliance}%` : ''}
${caps.hasComment ? `- Clients injoignables : ${kpis.injoignables}` : ''}

ÉQUIPES :
${teamLines || '(non disponible)'}

Réponds en français, de façon concise et opérationnelle. Si une question dépasse les données disponibles, dis-le clairement.`;
}

export async function aiResponseAsync(
  q:       string,
  records: ProcessedRecord[],
  kpis:    KPIData,
  teams:   TeamStats[],
  caps:    DataCapabilities,
  model:   'kssi' | 'gpt' | 'deepseek',
): Promise<string> {
  if (model === 'kssi') {
    return aiResponse(q, records, kpis, teams, caps);
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) {
    return `⚠️ Clé API Anthropic non configurée.\n\nAjoutez VITE_ANTHROPIC_API_KEY dans votre fichier .env pour activer ${model === 'gpt' ? 'Claude Pro' : 'Claude Fast'}.\n\nEn attendant, voici la réponse KSSI AI :\n\n${aiResponse(q, records, kpis, teams, caps)}`;
  }

  const claudeModel = model === 'gpt' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001';
  const systemPrompt = buildFtthContext(records, kpis, teams, caps);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: claudeModel,
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: 'user', content: q }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json() as { content: { type: string; text: string }[] };
    const text = data.content.find(b => b.type === 'text')?.text || '';
    return text || 'Réponse vide reçue.';
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur inconnue';
    return `❌ Erreur API Claude : ${msg}\n\nRéponse KSSI AI (local) :\n\n${aiResponse(q, records, kpis, teams, caps)}`;
  }
}
