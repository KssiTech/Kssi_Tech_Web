import type { CanonicalField } from '@/config/fieldMappings';

// ─── Canonical record ─────────────────────────────────────────────────────────
// Internal representation after schema detection + mapping.
// Every field is optional because any column may be absent in a given file.

export interface CanonicalRecord {
  client?:            string;
  team?:              string;
  raw_status?:        string;   // raw value from the status/etat column
  planned_date?:      string;
  installation_date?: string;
  offer?:             string;
  sip?:               string;
  router?:            string;
  comment?:           string;
  planner?:           string;
  sub_type?:          string;
  week_number?:       string;
  // All original column values keyed by normalized name
  _raw: Record<string, string>;
}

// ─── ProcessedRecord (CanonicalRecord + computed fields) ──────────────────────

export interface ProcessedRecord extends CanonicalRecord {
  _status:    Status;
  _teamName:  string;
  _debitNum:  number | null;
  _installDate: Date | null;
  _planifDate:  Date | null;
  _delayDays:   number | null;
  _week:    number | null;
  _month:   number | null;
  _quarter: number | null;
  _year:    number | null;
  _weekday: string | null;
}

// ─── Status ───────────────────────────────────────────────────────────────────

export type Status  = 'installe' | 'planifie' | 'bloque' | 'annule' | 'attente';
export type TabKey  = 'all' | Status;
export type Metric  = 'install' | 'planif';
export type DashView = 'overview' | 'clients' | 'installations' | 'equipes' | 'rapports';
export type AIModel  = 'kssi' | 'gpt' | 'deepseek';

export interface ChatMsg { role: 'user' | 'ai'; text: string; ts: string; }

// ─── Data profile (produced by dataProfiler) ──────────────────────────────────

export interface DataProfile {
  fileName:          string;
  totalRows:         number;
  validRows:         number;
  duplicateRows:     number;
  sheetCount:        number;
  detectedColumns:   number;
  mappedColumns:     number;
  unmappedColumns:   number;
  missingValues:     Partial<Record<CanonicalField, number>>;
  fillRates:         Partial<Record<CanonicalField, number>>;
  warnings:          string[];
  qualityScore:      number;  // 0-100
}

// ─── Data capabilities ────────────────────────────────────────────────────────
// Controls which charts / sections are rendered.

export interface DataCapabilities {
  hasClient:         boolean;
  hasTeam:           boolean;
  hasStatus:         boolean;
  hasPlannedDate:    boolean;
  hasInstallDate:    boolean;
  hasOffer:          boolean;
  hasSIP:            boolean;
  hasComment:        boolean;
  hasPlanner:        boolean;
  hasSubType:        boolean;
  hasRouter:         boolean;
  hasDateData:       boolean;      // hasPlannedDate || hasInstallDate
  hasTimeSeriesData: boolean;      // hasInstallDate specifically
  hasDelayAnalysis:  boolean;      // both date fields present
  hasTeamAnalysis:   boolean;      // hasTeam
}

// ─── KPI / Analytics ─────────────────────────────────────────────────────────

export interface KPIData {
  total:          number;
  installe:       number;
  planifie:       number;
  bloque:         number;
  annule:         number;
  attente:        number;
  taux:           number;
  avgDelay:       number | null;
  medianDelay:    number | null;
  slaCompliance:  number;
  activeTeams:    number;
  uniqueClients:  number;
  injoignables:   number;
}

export interface TeamStats {
  name:      string;
  color:     string;
  total:     number;
  installe:  number;
  bloque:    number;
  annule:    number;
  planifie:  number;
  attente:   number;
  taux:      number;
  avgDelay:  number | null;
}

export interface Alert {
  type:    'warning' | 'error' | 'info';
  title:   string;
  message: string;
  count:   number;
  items:   string[];
}

export interface Insight {
  type:   'success' | 'warning' | 'error' | 'info';
  title:  string;
  body:   string;
  value?: string;
  icon:   string;
}

export interface Filters {
  dateFrom:   string;
  dateTo:     string;
  team:       string;
  status:     string;
  debit:      string;
  sousType:   string;
  planneur:   string;
  searchText: string;
  week:       string;
  month:      string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const STATUS_META: Record<Status, { label: string; bg: string; color: string }> = {
  installe: { label: 'Installé',    bg: '#e4f7ef', color: '#16a06f' },
  planifie: { label: 'Planifié',    bg: '#eceafe', color: '#6c5ce6' },
  bloque:   { label: 'Bloqué',      bg: '#fdecec', color: '#e0564f' },
  annule:   { label: 'Annulé',      bg: '#f1f2f6', color: '#8a90a3' },
  attente:  { label: 'En attente',  bg: '#fdf3e3', color: '#d99a2b' },
};

export const ACCENT = '#6c5ce6';
export const STATUS_ORDER: Status[] = ['installe', 'planifie', 'bloque', 'annule', 'attente'];

export const DEFAULT_CAPABILITIES: DataCapabilities = {
  hasClient:         true,
  hasTeam:           true,
  hasStatus:         true,
  hasPlannedDate:    true,
  hasInstallDate:    true,
  hasOffer:          true,
  hasSIP:            true,
  hasComment:        true,
  hasPlanner:        false,
  hasSubType:        false,
  hasRouter:         false,
  hasDateData:       true,
  hasTimeSeriesData: true,
  hasDelayAnalysis:  true,
  hasTeamAnalysis:   true,
};
