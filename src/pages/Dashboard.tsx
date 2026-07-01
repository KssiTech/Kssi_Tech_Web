import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';
import { withBase } from '@/lib/utils';

import type {
  CanonicalRecord, ProcessedRecord, Status, TabKey, DashView, AIModel, ChatMsg,
  Filters, DataCapabilities, DataProfile, KPIData, TeamStats,
} from '@/types/dashboard';
import { STATUS_META, ACCENT, STATUS_ORDER, DEFAULT_CAPABILITIES } from '@/types/dashboard';

import {
  parseDate, fmtDate, fmtDateLong, extractTeamName, extractDebitNum, debitShort,
  initials, colorFor, nowTs, processRecords, applyFilters,
  computeKPIs, computeTeamStats, generateAlerts, generateInsights, computeForecast,
  buildSparkline, aiResponseAsync, parseExcelBuffer,
} from '@/hooks/useExcelData';

import type { SchemaDetectionResult } from '@/lib/schemaDetector';
import { DEFAULT_SCHEMA } from '@/lib/schemaDetector';
import { computeCapabilities } from '@/lib/dataProfiler';
import { FIELD_DEFINITIONS } from '@/config/fieldMappings';

import { KPICard } from '@/components/dashboard/KPICard';
import { FiltersBar } from '@/components/dashboard/FiltersBar';
import {
  InstallationsOverTime, StatusDonut, TeamLeaderboard,
  DelayHistogram, WeekdayHeatmap, DebitBreakdown, ForecastPanel,
} from '@/components/dashboard/DashboardCharts';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { InsightCards } from '@/components/dashboard/InsightCards';
import { SchemaPanel } from '@/components/dashboard/SchemaPanel';
import { UniversalDashboard } from '@/components/dashboard/UniversalDashboard';
import { UploadWizard } from '@/components/dashboard/UploadWizard';
import type { WizardResult } from '@/components/dashboard/UploadWizard';
import type { UniversalDatasetProfile } from '@/hooks/useExcelData';
import { listSavedFiles, downloadFromStorage, deleteFileMeta } from '@/lib/uploadService';
import type { SavedFile } from '@/lib/uploadService';

// ─── Demo dataset (as CanonicalRecord[]) ─────────────────────────────────────

const C = (
  client: string, team: string, offer: string, raw_status: string,
  planned_date: string, installation_date: string, comment: string, sip: string,
): CanonicalRecord => ({
  client, team, offer, raw_status, planned_date, installation_date, comment,
  sip: sip ? (sip.startsWith('SIP') ? sip : 'SIP ' + sip) : '',
  router: '', planner: '', sub_type: '', week_number: '',
  _raw: { nom: client, equipe: team, debit: offer, etat: raw_status, planif: planned_date, date_installation: installation_date, comm: comment, sip },
});

const DEFAULT_RECORDS: CanonicalRecord[] = [
  C('KHAZNAOUI NOUHAILA',    'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '11/04/2026', '11/04/2026', '',                      'SIP 525402661'),
  C('ABDERRAHIM JABIR',      'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '11/04/2026', '11/04/2026', 'client injoignable',     'SIP 525402489'),
  C('MOHAMED NABTI',         'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'Blocage client', '11/04/2026', '',           'Demande annulé',         'SIP 525402647'),
  C('CHAHMOUD ABDELGHANI',   'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '11/04/2026', '11/04/2026', 'Client indisponible',    'SIP 525402667'),
  C('ACHCHAQ RACHID',        'EQUIPE hamza KSSITECH', '50 Méga Fibre', 'ok',             '11/04/2026', '11/04/2026', 'client injoignable',     'SIP 525402668'),
  C('OUMELKHEIRE ITMINE',    'EQUIPE hamza KSSITECH', '50 Méga Fibre', 'ok',             '13/04/2026', '13/04/2026', 'Demande annulé',         'SIP 525402651'),
  C('HASNA AIT SIDI HSSAIN', 'EQUIPE hamza KSSITECH', '50 Méga Fibre', 'ok',             '10/04/2026', '09/04/2026', '',                      'SIP 525402664'),
  C('SARA ZAKI',             'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '10/04/2026', '09/04/2026', 'client injoignable',     'SIP 525402654'),
  C('MECHAOURI MOHAMED',     'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '11/04/2026', '11/04/2026', '',                      'SIP 525402659'),
  C('TORKMANI REDA',         'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '11/04/2026', '11/04/2026', 'client indisponible',    'SIP 525402649'),
  C('CHAFYQ MOHAMED',        'EQUIPE hamza KSSITECH', '100 Méga Fibre','ok',             '13/04/2026', '13/04/2026', '',                      'SIP 525402670'),
  C('ZOUYENE SOMAYA',        'EQUIPE hamza KSSITECH', '50 Méga Fibre', 'ok',             '13/04/2026', '13/04/2026', '',                      'SIP 525390794'),
  C('AMINE GHANNACHI',       'EQUIPE hamza KSSITECH', '50 Méga Fibre', 'ok',             '10/04/2026', '10/04/2026', '',                      'SIP 525402588'),
  C('JAMILA EL JAMAI',       'EQUIPE hamza KSSITECH', '50 Méga Fibre', 'ok',             '10/04/2026', '10/04/2026', '',                      'SIP 525402624'),
  C('ANASS LABRIRHLI',       'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '10/04/2026', '10/04/2026', '',                      'SIP 525402666'),
  C('KHIRSANI AYOUB',        'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '11/04/2026', '',           '',                      'SIP 525402604'),
  C('ATIKA OUAAZIZ',         'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '11/04/2026', '11/04/2026', '',                      'SIP 525402550'),
  C('MIROUCH RACHID',        'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '11/04/2026', '11/04/2026', '',                      'SIP 525402642'),
  C('TIZMLIL NASSIMA',       'EQUIPE hamza KSSITECH', '50 Méga Fibre', 'ok',             '10/04/2026', '10/04/2026', '',                      'SIP 525402641'),
  C('BEN BOURCH YOUSSEF',    'EQUIPE hamza KSSITECH', '50 Méga Fibre', 'ok',             '10/04/2026', '10/04/2026', '',                      'SIP 525402655'),
  C('HANANE ELGHARBI',       'EQUIPE hamza KSSITECH', '100 Méga Fibre','ok',             '14/04/2026', '14/04/2026', 'Client installé',        'SIP 525402953'),
  C('EL HAMAOUI NOUR EDDINE','EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '14/04/2026', '14/04/2026', 'Client installé',        'SIP 525403147'),
  C('FAICAL CHAKIR',         'EQUIPE hamza KSSITECH', '100 Méga Fibre','ok',             '',           '09/04/2026', '',                      'SIP 525403649'),
  C('YOUNES OUSAOUENE',      'EQUIPE hamza KSSITECH', '50 Méga Fibre', 'ok',             '09/04/2026', '',           '',                      'SIP 525402652'),
  C('ISRAE ELKHAIDAR',       'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '',           '16/04/2026', 'demande inbound Raccordement ONT et Box', 'SIP 525391512'),
  C('ESSAADIA',              'EQUIPE hamza KSSITECH', '',              'non installé',   '',           '',           'PB Voix & Internet',     'SIP 529715031'),
  C('ABDELHAQ ZIKI',         'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '',           '',           'problème accès banque',  'SIP 525379307'),
  C('HOUDALI RQIYA',         'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '',           '22/04/2026', '',                      'SIP 525379324'),
  C('BAAZI OTHMANE',         'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '',           '22/04/2026', '',                      'SIP 525402366'),
  C('HENNANE NOUR',          'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '',           '22/04/2026', '',                      'SIP 525406241'),
  C('SAAIDA HANBALI',        'EQUIPE hamza KSSITECH', '100 Méga Fibre','ok',             '',           '24/04/2026', '',                      'SIP 525404345'),
  C('OMAR JADOUANI',         'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'ok',             '',           '24/04/2026', '',                      'SIP 525404587'),
  C('EL OUAHMANI MOHAMED',   'EQUIPE hamza KSSITECH', '20 Méga Fibre', 'blocage CIN',   '',           '',           '',                      'SIP 525406697'),
  C('FOUAD JBOUHA',          'EQUIPE hamza KSSITECH', '100 Méga Fibre','ok',             '',           '',           '',                      'SIP 525406660'),
  C('LAZIZA ABOULEHENA',     'EQUIPE hamza KSSITECH', '',              'ok/chang.routeur','',          '27/04/2026', 'changement routeur',     ''),
  C('YOUSSEF OUADIH',        'EQUIPE hamza KSSITECH', '50 Méga Fibre', 'ok',             '28/04/2026', '',           '',                      'SIP 525406948'),
  C('ABDELKARIM',            'EQUIPE hamza KSSITECH', '',              'ok',             '29/04/2026', '',           '',                      ''),
  C('YASSINE BENNANI',       'EQUIPE omar KSSITECH',  '50 Méga Fibre', 'ok',             '09/04/2026', '09/04/2026', 'Client installé',        'SIP 525402701'),
  C('SALMA IDRISSI',         'EQUIPE omar KSSITECH',  '100 Méga Fibre','ok',             '10/04/2026', '10/04/2026', '',                      'SIP 525402702'),
  C('KARIM TAZI',            'EQUIPE omar KSSITECH',  '20 Méga Fibre', 'Blocage client', '11/04/2026', '',           'client injoignable',     'SIP 525402703'),
  C('NADIA FILALI',          'EQUIPE omar KSSITECH',  '50 Méga Fibre', 'ok',             '11/04/2026', '11/04/2026', '',                      'SIP 525402704'),
  C('OMAR ALAMI',            'EQUIPE omar KSSITECH',  '20 Méga Fibre', 'ok',             '13/04/2026', '',           '',                      'SIP 525402705'),
  C('ABDELLATIF ZAOUI',      'EQUIPE omar KSSITECH',  '50 Méga Fibre', 'ok',             '15/04/2026', '15/04/2026', '',                      'SIP 525402708'),
  C('FATIMA ESSALHI',        'EQUIPE omar KSSITECH',  '20 Méga Fibre', 'Blocage client', '16/04/2026', '',           'client injoignable',     'SIP 525402710'),
  C('REDA BENJELLOUN',       'EQUIPE mohammed KSSITECH','100 Méga Fibre','ok',            '10/04/2026', '10/04/2026', '',                      'SIP 525402801'),
  C('IMANE SAIDI',           'EQUIPE mohammed KSSITECH','50 Méga Fibre', 'ok',            '11/04/2026', '11/04/2026', 'Client installé',        'SIP 525402802'),
  C('HAMZA OURICH',          'EQUIPE mohammed KSSITECH','20 Méga Fibre', 'ok',            '12/04/2026', '',           'Demande annulé',         'SIP 525402803'),
  C('LATIFA NAJI',           'EQUIPE mohammed KSSITECH','50 Méga Fibre', 'ok',            '13/04/2026', '13/04/2026', '',                      'SIP 525402804'),
  C('KHALID AMRANI',         'EQUIPE mohammed KSSITECH','20 Méga Fibre', 'ok',            '14/04/2026', '14/04/2026', '',                      'SIP 525402806'),
  C('ZINEB BERRADA',         'EQUIPE mohammed KSSITECH','50 Méga Fibre', 'Blocage client','15/04/2026', '',           'client injoignable',     'SIP 525402809'),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 38 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: colorFor(name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * .33, fontWeight: 700, flexShrink: 0 }}>
    {initials(name)}
  </div>
);

const DEFAULT_FILTERS: Filters = {
  dateFrom: '', dateTo: '', team: 'all', status: 'all', debit: 'all',
  sousType: 'all', planneur: 'all', searchText: '', week: 'all', month: 'all',
};

// ─── Project record type ──────────────────────────────────────────────────────

interface ProjectRecord {
  id: string;
  fileName: string;
  uploadedAt: number;
  recordCount: number;
  qualityScore: number;
  taux: number;
  teamCount: number;
  records: CanonicalRecord[];
  schema: SchemaDetectionResult;
  caps: DataCapabilities;
  profile: DataProfile;
}

// ─── Main component ───────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  // ── Data state ──
  const [rawRecs,         setRawRecs]         = useState<CanonicalRecord[]>(DEFAULT_RECORDS);
  const [schema,          setSchema]          = useState<SchemaDetectionResult>(DEFAULT_SCHEMA);
  const [caps,            setCaps]            = useState<DataCapabilities>(DEFAULT_CAPABILITIES);
  const [profile,         setProfile]         = useState<DataProfile | null>(null);
  const [universalProfile, setUniversalProfile] = useState<UniversalDatasetProfile | null>(null);
  const [fileName,  setFileName]  = useState('');
  const [showSchema, setShowSchema] = useState(false);

  // ── UI state ──
  const [view,     setView]     = useState<DashView>('overview');
  const [filters,  setFilters]  = useState<Filters>(DEFAULT_FILTERS);
  const [dashSection, setDashSection] = useState<'kpis' | 'charts' | 'forecast' | 'table' | 'excel' | 'ai'>('excel');
  const [tab,      setTab]      = useState<TabKey>('all');
  const [sortCol,  setSortCol]  = useState<'client' | 'team' | 'offer' | 'planned_date' | 'installation_date' | '_status'>('planned_date');
  const [sortDir,  setSortDir]  = useState<'asc' | 'desc'>('asc');
  const [page,     setPage]     = useState(1);
  const PAGE_SIZE = 20;

  const [teamSortCol, setTeamSortCol] = useState<'name' | 'total' | 'installe' | 'taux' | 'status'>('name');
  const [teamSortDir, setTeamSortDir] = useState<'asc' | 'desc'>('asc');
  const toggleTeamSort = (col: typeof teamSortCol) => {
    if (teamSortCol === col) setTeamSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setTeamSortCol(col); setTeamSortDir('asc'); }
  };

  // Drill-down via chart clicks
  const [drillStatus, setDrillStatus] = useState<string | null>(null);
  const [drillTeam,   setDrillTeam]   = useState<string | null>(null);
  const [drillDebit,  setDrillDebit]  = useState<string | null>(null);

  // ── AI state ──
  const [aiModel,    setAiModel]    = useState<AIModel>('kssi');
  const [aiThinking, setAiThinking] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { role: 'ai', text: 'Bonjour ! Je suis l\'assistant KSSI AI. Importez un fichier Excel ou posez-moi une question sur les données actuelles.', ts: nowTs() },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [cloudFiles, setCloudFiles] = useState<SavedFile[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null);
  const [projectPanelTab, setProjectPanelTab] = useState<'overview' | 'columns' | 'warnings'>('overview');
  const [selectedTeam, setSelectedTeam] = useState<TeamStats | null>(null);
  const [teamPanelTab, setTeamPanelTab] = useState<'overview' | 'clients' | 'perf'>('overview');
  const [teamSearch, setTeamSearch] = useState('');
  const chatEndRef     = useRef<HTMLDivElement>(null);
  const chatScrollInit = useRef(false);

  useEffect(() => {
    if (!chatScrollInit.current) { chatScrollInit.current = true; return; }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMsgs]);

  const fetchCloudFiles = useCallback(() => {
    listSavedFiles(user?.id ?? null).then(setCloudFiles).catch(() => {});
  }, [user]);

  useEffect(() => { fetchCloudFiles(); }, [fetchCloudFiles]);

  // ── Process records ──
  const allProcessed = useMemo(() => processRecords(rawRecs), [rawRecs]);

  // ── Combined filters (UI + drill-down) ──
  const activeFilters = useMemo((): Filters => {
    const f = { ...filters };
    if (drillStatus && drillStatus !== 'all') f.status = drillStatus;
    if (drillTeam)  f.team  = drillTeam;
    if (drillDebit) f.debit = drillDebit;
    return f;
  }, [filters, drillStatus, drillTeam, drillDebit]);

  const records = useMemo(() => applyFilters(allProcessed, activeFilters), [allProcessed, activeFilters]);

  // ── Analytics ──
  const kpis     = useMemo(() => computeKPIs(records),             [records]);
  const teams    = useMemo(() => computeTeamStats(records),        [records]);
  const alerts   = useMemo(() => generateAlerts(records, kpis, teams, caps), [records, kpis, teams, caps]);
  const insights = useMemo(() => generateInsights(records, kpis, teams, caps), [records, kpis, teams, caps]);
  const forecast = useMemo(() => computeForecast(records, kpis, teams), [records, kpis, teams]);

  // Sparklines (from unfiltered set)
  const sparkInstalle = useMemo(() => buildSparkline(allProcessed, 'installe', 10), [allProcessed]);
  const sparkBloque   = useMemo(() => buildSparkline(allProcessed, 'bloque',   10), [allProcessed]);
  const sparkPlanifie = useMemo(() => buildSparkline(allProcessed, 'planifie', 10), [allProcessed]);

  const periodLabel = useMemo(() => {
    const dates = allProcessed.flatMap(r => [r._installDate, r._planifDate]).filter(Boolean) as Date[];
    if (!dates.length) return 'Données démo';
    const minD = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxD = new Date(Math.max(...dates.map(d => d.getTime())));
    return `${fmtDate(minD.toLocaleDateString('fr-FR'))} → ${fmtDate(maxD.toLocaleDateString('fr-FR'))}`;
  }, [allProcessed]);

  // ── Table ──
  const tabCounts = useMemo((): Record<TabKey, number> => ({
    all:     records.length,
    installe:  records.filter(r => r._status === 'installe').length,
    planifie:  records.filter(r => r._status === 'planifie').length,
    bloque:    records.filter(r => r._status === 'bloque').length,
    annule:    records.filter(r => r._status === 'annule').length,
    attente:   records.filter(r => r._status === 'attente').length,
  }), [records]);

  const tabFiltered = useMemo(() => tab === 'all' ? records : records.filter(r => r._status === tab), [records, tab]);

  const sorted = useMemo(() => [...tabFiltered].sort((a, b) => {
    const statusRank = (r: ProcessedRecord) => {
      const idx = STATUS_ORDER.indexOf(r._status);
      return idx === -1 ? STATUS_ORDER.length : idx;
    };

    if (sortCol === '_status') {
      const cmp = statusRank(a) - statusRank(b);
      return sortDir === 'asc' ? cmp : -cmp;
    }

    let av = '', bv = '';
    if (sortCol === 'client')            { av = a.client || '';               bv = b.client || ''; }
    if (sortCol === 'team')              { av = a._teamName;                   bv = b._teamName; }
    if (sortCol === 'offer')             { av = String(a._debitNum ?? 0);      bv = String(b._debitNum ?? 0); }
    if (sortCol === 'planned_date')      { av = a.planned_date || 'z';        bv = b.planned_date || 'z'; }
    if (sortCol === 'installation_date') { av = a.installation_date || 'z';   bv = b.installation_date || 'z'; }

    const primary = sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    if (primary !== 0) return primary;
    return statusRank(a) - statusRank(b);
  }), [tabFiltered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows   = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const priorityTasks = useMemo(() =>
    records.filter(r => r._status === 'planifie')
      .sort((a, b) => (a._planifDate?.getTime() ?? 0) - (b._planifDate?.getTime() ?? 0))
      .slice(0, 4),
    [records]);

  // ── Debit sidebar ──
  const debitColors: Record<number, string> = { 20: '#16c79a', 50: '#5b8def', 100: ACCENT };
  const maxDeb = Math.max(1, ...[20, 50, 100].map(d => records.filter(r => r._debitNum === d).length));
  const debitList = [20, 50, 100].map(d => {
    const c = records.filter(r => r._debitNum === d).length;
    return { label: `${d} Méga`, count: c, pct: records.length ? Math.round(c / records.length * 100) : 0, width: Math.round(c / maxDeb * 100) + '%', color: debitColors[d] };
  }).filter(d => d.count > 0);

  // ── Wizard completion handler ──
  const handleWizardComplete = useCallback((result: WizardResult) => {
    const { canonical, schema: s, caps: c, profile: p, universalProfile: up, fileName: fn } = result;
    setRawRecs(canonical);
    setSchema(s);
    setCaps(c);
    setProfile(p);
    setUniversalProfile(up);
    setFileName(fn);
    setFilters(DEFAULT_FILTERS);
    setTab('all');
    setPage(1);
    setDrillStatus(null); setDrillTeam(null); setDrillDebit(null);
    setShowSchema(false);
    const kpisCalc = computeKPIs(processRecords(canonical));
    const newProject: ProjectRecord = {
      id: Date.now().toString(),
      fileName: fn,
      uploadedAt: Date.now(),
      recordCount: canonical.length,
      qualityScore: p.qualityScore,
      taux: kpisCalc.taux,
      teamCount: new Set(canonical.filter(r => r.team).map(r => r.team)).size,
      records: canonical,
      schema: s,
      caps: c,
      profile: p,
    };
    setProjects(prev => [newProject, ...prev.filter(x => x.fileName !== fn)]);
    const warn    = s.warnings.length;
    const unmapped = s.unmappedColumns.length;
    setChatMsgs(prev => [...prev, {
      role: 'ai',
      text: `✓ "${fn}" importé — ${canonical.length} enregistrements depuis ${s.sheets.length} feuille(s).\nScore qualité : ${p.qualityScore}/100.${warn > 0 ? `\n⚠️ ${warn} avertissement(s).` : ''}${unmapped > 0 ? `\n❓ ${unmapped} colonne(s) non reconnue(s).` : ''}\nTous les graphiques ont été mis à jour.`,
      ts: nowTs(),
    }]);
    fetchCloudFiles();
    setDashSection('kpis');
  }, [fetchCloudFiles]);

  // ── Reload a file from Supabase cloud ──
  const reloadCloudFile = useCallback(async (f: SavedFile) => {
    if (!f.file_path) return;
    const buf = await downloadFromStorage(f.file_path);
    if (!buf) { console.warn('Impossible de télécharger le fichier cloud.'); return; }
    const result = parseExcelBuffer(buf, f.file_name);
    handleWizardComplete({ ...result, fileName: f.file_name, supabasePath: f.file_path });
  }, [handleWizardComplete]);

  // ── AI ──
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || aiThinking) return;
    setChatMsgs(prev => [...prev, { role: 'user', text: text.trim(), ts: nowTs() }]);
    setAiInput('');
    setAiThinking(true);
    try {
      const resp = await aiResponseAsync(text, records, kpis, teams, caps, aiModel);
      setChatMsgs(prev => [...prev, { role: 'ai', text: resp, ts: nowTs() }]);
    } finally {
      setAiThinking(false);
    }
  }, [records, kpis, teams, caps, aiModel, aiThinking]);

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(aiInput); }
  };

  // ── Export ──
  const exportCSV = useCallback(() => {
    const headers = ['NOM', 'EQUIPE', 'OFFRE', 'STATUT', 'DATE PLANIFICATION', 'DATE INSTALLATION', 'COMMENTAIRE', 'SIP', 'STATUT CALC.', 'DELAI (j)'];
    const rows = records.map(r => [
      r.client, r._teamName, r.offer, r.raw_status,
      r.planned_date, r.installation_date, r.comment, r.sip,
      STATUS_META[r._status].label, r._delayDays ?? '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'KSSI_FTTH_export.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [records]);

  const loadProject = useCallback((project: ProjectRecord) => {
    setRawRecs(project.records);
    setSchema(project.schema);
    setCaps(project.caps);
    setProfile(project.profile);
    setFileName(project.fileName);
    setFilters(DEFAULT_FILTERS);
    setTab('all');
    setPage(1);
    setDrillStatus(null); setDrillTeam(null); setDrillDebit(null);
    setShowSchema(false);
    setSelectedProject(null);
    setChatMsgs(prev => [...prev, {
      role: 'ai',
      text: `Projet "${project.fileName}" chargé — ${project.recordCount} enregistrements, taux d'installation : ${project.taux}%. Tous les graphiques et KPIs ont été mis à jour.`,
      ts: nowTs(),
    }]);
    setDashSection('kpis');
  }, []);

  // ── Drill helpers ──
  const hasDrill = drillStatus || drillTeam || drillDebit;
  const clearDrill = () => { setDrillStatus(null); setDrillTeam(null); setDrillDebit(null); };

  // ── Style shortcuts ──
  const SOFT = hexA(ACCENT, .12);
  const SHAD = hexA(ACCENT, .35);
  const card: React.CSSProperties = { background: '#fff', borderRadius: 20, boxShadow: '0 6px 20px rgba(30,35,60,.05)', padding: '22px 24px' };

  const SortArrow: React.FC<{ col: string }> = ({ col }) =>
    sortCol === col ? <span style={{ color: ACCENT, marginLeft: 3 }}>{sortDir === 'asc' ? '↑' : '↓'}</span> : null;

  const ColHead: React.FC<{ col: typeof sortCol; label: string }> = ({ col, label }) => (
    <div onClick={() => toggleSort(col)} style={{ fontSize: 11.5, fontWeight: 700, color: sortCol === col ? ACCENT : '#9398a8', textTransform: 'uppercase', letterSpacing: .5, cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
      {label}<SortArrow col={col} />
    </div>
  );

  const ACTION_BUTTONS = [
    { emoji: '📞', label: 'Relancer injoignables', q: 'Qui sont les clients injoignables à relancer ?',  bg: '#e4f7ef', color: '#16a06f' },
    { emoji: '📅', label: 'Replanifier retards',   q: 'Quelles installations en retard replanifier ?',    bg: '#eceafe', color: '#6c5ce6' },
    { emoji: '⚡', label: 'Optimiser planning',    q: 'Comment optimiser le planning ?',                  bg: '#fdf3e3', color: '#d99a2b' },
    { emoji: '📄', label: 'Rapport hebdo',          q: 'Génère un rapport hebdomadaire résumé.',           bg: '#fdecec', color: '#e0564f' },
  ];

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── PROJECT DETAIL PANEL ── */}
      {selectedProject && (() => {
        const p = selectedProject;
        const qs = p.qualityScore;
        const qBadge = qs >= 80
          ? { label: 'Excellent',   bg: '#e4f7ef', color: '#16a06f' }
          : qs >= 65
          ? { label: 'Bon',         bg: '#e4eeff', color: '#5b8def' }
          : qs >= 50
          ? { label: 'Acceptable',  bg: '#fdf3e3', color: '#d99a2b' }
          : { label: 'Faible',      bg: '#fdecec', color: '#e0564f' };
        const allCols = p.schema.sheets.flatMap(s => s.detectedColumns);
        const capChips = [
          { ok: p.caps.hasTeam,        label: 'Équipe',        bg: '#dcf5e7', color: '#16a06f' },
          { ok: p.caps.hasStatus,       label: 'Statut',        bg: '#dcf5e7', color: '#16a06f' },
          { ok: p.caps.hasPlannedDate,  label: 'Planification', bg: '#dcf5e7', color: '#16a06f' },
          { ok: p.caps.hasInstallDate,  label: 'Date install.', bg: '#dcf5e7', color: '#16a06f' },
          { ok: p.caps.hasOffer,        label: 'Offre/Débit',   bg: '#ddf3f0', color: '#0f9b8e' },
          { ok: p.caps.hasComment,      label: 'Commentaires',  bg: '#dcf5e7', color: '#16a06f' },
          { ok: p.caps.hasDelayAnalysis,label: 'Délais',        bg: '#e4eeff', color: '#5b8def' },
          { ok: p.caps.hasSubType,      label: 'Sous-type',     bg: '#fdf3e3', color: '#d99a2b' },
        ].filter(c => c.ok);
        const fillEntries = FIELD_DEFINITIONS.filter(f => p.profile.fillRates[f.key] !== undefined);
        return (
          <>
            <div onClick={() => setSelectedProject(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,30,.18)', zIndex: 200 }} />
            <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 580, background: '#fff', zIndex: 201, boxShadow: '-4px 0 32px rgba(30,35,60,.14)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* ── Panel header ── */}
              <div style={{ padding: '18px 24px 0', borderBottom: '1px solid #eef0f4', flexShrink: 0 }}>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: hexA(ACCENT, .1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📊</div>
                      <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -.3 }}>Analyse du fichier</div>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#9398a8', fontWeight: 500, marginLeft: 38 }}>
                      {p.fileName} · {p.schema.sheets.length} feuille{p.schema.sheets.length > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ textAlign: 'center', background: qBadge.bg, borderRadius: 10, padding: '6px 12px', minWidth: 54 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: qBadge.color, lineHeight: 1 }}>{qs}</div>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: qBadge.color, marginTop: 2 }}>{qBadge.label}</div>
                    </div>
                    <button onClick={() => loadProject(p)}
                      style={{ background: ACCENT, color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                      ▶ Analyser
                    </button>
                    <button onClick={() => { setProjects(prev => prev.filter(x => x.id !== p.id)); setSelectedProject(null); }}
                      style={{ width: 32, height: 32, borderRadius: 8, background: '#fdecec', border: 'none', cursor: 'pointer', color: '#e0564f', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑</button>
                    <button onClick={() => setSelectedProject(null)}
                      style={{ width: 32, height: 32, borderRadius: 8, background: '#f4f5f8', border: 'none', cursor: 'pointer', color: '#6c7184', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                </div>

                {/* 4 stats cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#eef0f4', border: '1px solid #eef0f4', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
                  {[
                    { val: String(p.recordCount),          label: 'Lignes',            bg: '#fff',    valColor: '#1d2030' },
                    { val: String(p.profile.duplicateRows), label: 'Doublons supp.',   bg: p.profile.duplicateRows > 0 ? '#fdf6ed' : '#fff', valColor: p.profile.duplicateRows > 0 ? '#16a06f' : '#1d2030' },
                    { val: `${p.profile.mappedColumns}/${p.profile.detectedColumns}`,  label: 'Colonnes mappées', bg: '#fff', valColor: '#1d2030' },
                    { val: String(p.profile.unmappedColumns), label: 'Non reconnues',  bg: p.profile.unmappedColumns > 0 ? '#fdecec' : '#fff', valColor: p.profile.unmappedColumns > 0 ? '#e0564f' : '#1d2030' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: s.bg, padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: s.valColor, letterSpacing: -.5, lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: 10.5, color: '#9398a8', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Detected column chips */}
                {capChips.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {capChips.map((c, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 7, background: c.bg, color: c.color }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
                        {c.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sub-tabs */}
                <div style={{ display: 'flex' }}>
                  {([
                    ['overview',  'Vue d\'ensemble'],
                    ['columns',   `Colonnes ${allCols.length}`],
                    ['warnings',  `Avertissements ${p.profile.warnings.length}`],
                  ] as const).map(([key, label]) => (
                    <div key={key} onClick={() => setProjectPanelTab(key)}
                      style={{ padding: '9px 18px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', color: projectPanelTab === key ? ACCENT : '#9398a8', borderBottom: `2px solid ${projectPanelTab === key ? ACCENT : 'transparent'}`, transition: 'all .15s', userSelect: 'none', whiteSpace: 'nowrap' }}>
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Panel body ── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                {/* ─ Vue d'ensemble ─ */}
                {projectPanelTab === 'overview' && (
                  <>
                    {/* Feuilles détectées */}
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Feuilles détectées</div>
                      {p.schema.sheets.map((sheet, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '11px 14px', borderBottom: '1px solid #f3f4f8', background: i % 2 === 0 ? '#fafbfc' : '#fff' }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#c8cad4', marginRight: 12, flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1d2030' }}>{sheet.name}</span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: 11.5, fontWeight: 700, background: '#e4eeff', color: '#5b8def', padding: '2px 9px', borderRadius: 6 }}>{sheet.rowCount} lignes</span>
                            <span style={{ fontSize: 11.5, fontWeight: 700, background: '#f4f5f8', color: '#6c7184', padding: '2px 9px', borderRadius: 6 }}>{sheet.detectedColumns.length} colonnes</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Complétude des données */}
                    {fillEntries.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>Complétude des données</div>
                        {fillEntries.map(f => {
                          const rate = p.profile.fillRates[f.key] ?? 0;
                          const pct = Math.round(rate * 100);
                          const barColor = pct >= 90 ? '#16c79a' : pct >= 70 ? '#d9a93e' : '#e0564f';
                          const textColor = pct >= 90 ? '#16a06f' : pct >= 70 ? '#d99a2b' : '#e0564f';
                          return (
                            <div key={f.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 9 }}>
                              <div style={{ width: 130, fontSize: 12, color: '#4a4f63', fontWeight: 500, flexShrink: 0, paddingRight: 8 }}>{f.label}</div>
                              <div style={{ flex: 1, height: 7, borderRadius: 4, background: '#f0f1f5', overflow: 'hidden', margin: '0 10px' }}>
                                <div style={{ height: '100%', width: pct + '%', background: barColor, borderRadius: 4, transition: 'width .6s ease' }} />
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: textColor, width: 38, textAlign: 'right' }}>{pct}%</div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Upload info if no fill data */}
                    {fillEntries.length === 0 && (
                      <div style={{ background: '#f8f9fc', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                          ['Date d\'import', new Date(p.uploadedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })],
                          ['Heure',          new Date(p.uploadedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })],
                          ['Taux install.',  `${p.taux}%`],
                          ['Équipes',        String(p.teamCount)],
                        ].map(([k, v], i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: '#9398a8', fontWeight: 500 }}>{k}</span>
                            <span style={{ fontWeight: 700, color: '#1d2030' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ─ Colonnes ─ */}
                {projectPanelTab === 'columns' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 0, fontSize: 10.5, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .5, padding: '0 4px 8px', borderBottom: '1px solid #f0f1f5', marginBottom: 4 }}>
                      <div>Colonne brute</div><div style={{ textAlign: 'center', paddingRight: 12 }}>Mapping</div><div style={{ width: 80, textAlign: 'right' }}>Complétude</div>
                    </div>
                    {allCols.map((col, i) => {
                      const pct = Math.round(col.fillRate * 100);
                      const barColor = pct >= 90 ? '#16c79a' : pct >= 70 ? '#d9a93e' : '#e0564f';
                      return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 0, padding: '10px 4px', borderBottom: '1px solid #f3f4f8', alignItems: 'center' }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1d2030' }}>{col.raw}</div>
                          <div style={{ paddingRight: 12 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: col.canonicalField ? '#e4f7ef' : '#f1f2f6', color: col.canonicalField ? '#16a06f' : '#b6bac6' }}>
                              {col.canonicalField || '—'}
                            </span>
                          </div>
                          <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                            <div style={{ width: 44, height: 5, borderRadius: 4, background: '#f0f1f5', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: pct + '%', background: barColor, borderRadius: 4 }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: barColor, width: 28, textAlign: 'right' }}>{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* ─ Avertissements ─ */}
                {projectPanelTab === 'warnings' && (
                  <>
                    {p.profile.warnings.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 0', color: '#16a06f' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Aucun avertissement</div>
                        <div style={{ fontSize: 12, color: '#9398a8', marginTop: 4, fontWeight: 500 }}>Les données sont conformes aux attentes.</div>
                      </div>
                    ) : p.profile.warnings.map((w, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, padding: '11px 14px', background: '#fdf6ed', borderRadius: 10, marginBottom: 8, border: '1px solid #fde8c8' }}>
                        <span style={{ fontSize: 13, flexShrink: 0 }}>⚠️</span>
                        <span style={{ fontSize: 12.5, color: '#4a4f63', lineHeight: 1.55, fontWeight: 500 }}>{w}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* ── Panel footer ── */}
              <div style={{ padding: '12px 24px 16px', borderTop: '1px solid #eef0f4', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11.5, color: '#9398a8', fontWeight: 500 }}>
                  {p.recordCount} enregistrements · Score : <strong style={{ color: qBadge.color }}>{qs}/100</strong>
                </div>
                <button onClick={() => loadProject(p)}
                  style={{ background: ACCENT, color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px ${hexA(ACCENT, .35)}` }}>
                  ▶ Charger et analyser
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── TEAM DETAIL PANEL ── */}
      {selectedTeam && (() => {
        const e = selectedTeam;
        const sub = records.filter(r => r._teamName === e.name);
        const barColor = e.taux >= 70 ? '#16c79a' : e.taux >= 40 ? '#d9a93e' : '#e0564f';
        const statusBadge = e.taux >= 70
          ? { label: 'Actif',        bg: '#e4f7ef', color: '#16a06f' }
          : e.taux >= 40
          ? { label: 'En cours',     bg: '#e4eeff', color: '#5b8def' }
          : { label: 'À améliorer',  bg: '#fdf3e3', color: '#d99a2b' };
        const offerMap: Record<string, number> = {};
        sub.forEach(r => { const o = debitShort(r.offer || ''); if (o) offerMap[o] = (offerMap[o] || 0) + 1; });
        const topOffer = Object.entries(offerMap).sort(([, a], [, b]) => b - a)[0]?.[0] || 'FTTH';
        return (
          <>
            <div onClick={() => setSelectedTeam(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,30,.18)', zIndex: 200 }} />
            <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 520, background: '#fff', zIndex: 201, boxShadow: '-4px 0 32px rgba(30,35,60,.14)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Header */}
              <div style={{ padding: '22px 24px 0', borderBottom: '1px solid #eef0f4', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: e.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
                      {initials(e.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -.3 }}>{e.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, padding: '2px 9px', borderRadius: 6, background: statusBadge.bg, color: statusBadge.color }}>{statusBadge.label}</span>
                        <span style={{ fontSize: 11, color: '#9398a8', fontWeight: 500 }}>{e.total} demandes · {topOffer} Fibre</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTeam(null)}
                    style={{ width: 32, height: 32, borderRadius: 8, background: '#f4f5f8', border: 'none', cursor: 'pointer', color: '#6c7184', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: '#9398a8', fontWeight: 600 }}>PROGRESSION</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: barColor }}>{e.taux}%</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 4, background: '#f0f1f5', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: e.taux + '%', background: barColor, borderRadius: 4, transition: 'width .6s' }} />
                  </div>
                </div>

                {/* Sub-tabs */}
                <div style={{ display: 'flex' }}>
                  {([['overview', 'Vue d\'ensemble'], ['clients', `Clients ${sub.length}`], ['perf', 'Performances']] as const).map(([key, label]) => (
                    <div key={key} onClick={() => setTeamPanelTab(key)}
                      style={{ padding: '9px 16px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', color: teamPanelTab === key ? ACCENT : '#9398a8', borderBottom: `2px solid ${teamPanelTab === key ? ACCENT : 'transparent'}`, transition: 'all .15s', userSelect: 'none', whiteSpace: 'nowrap' }}>
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                {/* ─ Vue d'ensemble ─ */}
                {teamPanelTab === 'overview' && (
                  <>
                    {/* 4 stat cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 18 }}>
                      {[
                        { label: 'Total demandes', val: e.total,    color: '#1d2030',                                     bg: '#f8f9fc' },
                        { label: 'Installées',     val: e.installe, color: '#16a06f',                                     bg: '#e4f7ef' },
                        { label: 'Planifiées',     val: e.planifie, color: ACCENT,                                        bg: hexA(ACCENT, .1) },
                        { label: 'Bloquées',       val: e.bloque,   color: e.bloque > 0 ? '#e0564f' : '#b6bac6',         bg: e.bloque > 0 ? '#fdecec' : '#f8f9fc' },
                      ].map((s, i) => (
                        <div key={i} style={{ background: s.bg, borderRadius: 14, padding: '14px 16px' }}>
                          <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: -1 }}>{s.val}</div>
                          <div style={{ fontSize: 11.5, color: '#9398a8', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Breakdown section */}
                    <div style={{ border: '1px solid #f0f1f5', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                      <div style={{ padding: '12px 16px', background: '#f9fafb', fontSize: 10.5, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .8 }}>Répartition des statuts</div>
                      {([
                        { key: 'installe', pct: e.total ? Math.round(e.installe / e.total * 100) : 0 },
                        { key: 'planifie', pct: e.total ? Math.round(e.planifie / e.total * 100) : 0 },
                        { key: 'bloque',   pct: e.total ? Math.round(e.bloque   / e.total * 100) : 0 },
                        { key: 'annule',   pct: e.total ? Math.round(e.annule   / e.total * 100) : 0 },
                        { key: 'attente',  pct: e.total ? Math.round(e.attente  / e.total * 100) : 0 },
                      ] as { key: Status; pct: number }[]).filter(s => {
                        const count = e[s.key as keyof typeof e] as number;
                        return typeof count === 'number' && count > 0;
                      }).map((s, i, arr) => {
                        const sm = STATUS_META[s.key];
                        const count = e[s.key as keyof typeof e] as number;
                        return (
                          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f8' : 'none' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: sm.color, flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1d2030' }}>{sm.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#4a4f63' }}>{count}</span>
                            <div style={{ width: 80, height: 5, borderRadius: 4, background: '#f0f1f5', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: s.pct + '%', background: sm.color, borderRadius: 4 }} />
                            </div>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: sm.color, width: 32, textAlign: 'right' }}>{s.pct}%</span>
                          </div>
                        );
                      })}
                    </div>

                    {caps.hasDelayAnalysis && e.avgDelay !== null && (
                      <div style={{ background: '#f8f9fc', borderRadius: 12, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#4a4f63' }}>Délai moyen d'installation</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: e.avgDelay <= 2 ? '#16a06f' : e.avgDelay <= 5 ? '#d99a2b' : '#e0564f' }}>{e.avgDelay}j</span>
                      </div>
                    )}
                  </>
                )}

                {/* ─ Clients ─ */}
                {teamPanelTab === 'clients' && (
                  <>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 10 }}>
                      {sub.length} client{sub.length > 1 ? 's' : ''}
                    </div>
                    {sub.map((r, i) => {
                      const sm = STATUS_META[r._status];
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < sub.length - 1 ? '1px solid #f3f4f8' : 'none' }}>
                          <Avatar name={r.client || '?'} size={34} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.client || '—'}</div>
                            <div style={{ fontSize: 11, color: '#9398a8', fontWeight: 500, marginTop: 1 }}>
                              {r.sip || '—'}{r.offer ? ` · ${debitShort(r.offer)}` : ''}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 7, background: sm.bg, color: sm.color }}>{sm.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* ─ Performances ─ */}
                {teamPanelTab === 'perf' && (
                  <>
                    <div style={{ border: '1px solid #f0f1f5', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
                      <div style={{ padding: '12px 16px', background: '#f9fafb', fontSize: 10.5, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .8 }}>Indicateurs clés</div>
                      {[
                        ['Taux de réalisation', `${e.taux}%`, e.taux >= 70 ? '#16a06f' : e.taux >= 40 ? '#d99a2b' : '#e0564f'],
                        ['Demandes totales', String(e.total), '#1d2030'],
                        ['Installations réalisées', String(e.installe), '#16a06f'],
                        ['En attente de réalisation', String(e.planifie), ACCENT],
                        ['Nécessitent retraitement', String(e.bloque + e.annule), e.bloque + e.annule > 0 ? '#e0564f' : '#b6bac6'],
                        ...(caps.hasDelayAnalysis && e.avgDelay !== null ? [['Délai moyen', `${e.avgDelay} jour${e.avgDelay > 1 ? 's' : ''}`, '#5b8def']] : []),
                      ].map(([label, value, color], i, arr) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f8' : 'none' }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#4a4f63' }}>{label}</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color }}>{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Offer breakdown */}
                    {Object.keys(offerMap).length > 0 && (
                      <div style={{ border: '1px solid #f0f1f5', borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', background: '#f9fafb', fontSize: 10.5, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .8 }}>Répartition par offre</div>
                        {Object.entries(offerMap).sort(([, a], [, b]) => b - a).map(([offer, count], i, arr) => {
                          const pct = Math.round(count / sub.length * 100);
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f8' : 'none' }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#1d2030', width: 60 }}>{offer}</span>
                              <div style={{ flex: 1, height: 6, borderRadius: 4, background: '#f0f1f5', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: pct + '%', background: ACCENT, borderRadius: 4 }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#6c7184', width: 50, textAlign: 'right' }}>{count} · {pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 24px 16px', borderTop: '1px solid #eef0f4', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11.5, color: '#9398a8', fontWeight: 500 }}>{e.installe}/{e.total} installées</div>
                <button onClick={() => { setDrillTeam(e.name); setDrillStatus(null); setDrillDebit(null); setView('clients'); setSelectedTeam(null); }}
                  style={{ background: ACCENT, color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 12px ${hexA(ACCENT, .35)}` }}>
                  Voir les clients →
                </button>
              </div>
            </div>
          </>
        );
      })()}

      <div style={{ minHeight: '100vh', background: '#eef0f4', padding: '26px 30px 40px', color: '#1d2030', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", WebkitFontSmoothing: 'antialiased' }}>
        <Helmet>
          <title>Tableau de bord FTTH | KSSI Tech</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        </Helmet>

        <div style={{ width: '100%' }}>

          {/* ── TOP BAR ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: '#15171f', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(20,22,30,.22)', flexShrink: 0 }}>
                  <img src={withBase("/logo_Khwarizmia_light.png")} alt="KSSI Tech" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                </div>
                <div style={{ lineHeight: 1.15 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -.4, color: '#1d2030' }}>KSSI TECH</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#caa35e', marginTop: 2 }}>Leading Technical Future World</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {[{ l: 'H', c: '#16c79a' }, { l: 'O', c: '#5b8def' }, { l: 'M', c: '#9b7ce6' }].map((a, i) => (
                  <div key={i} title={['Hamza', 'Omar', 'Mohammed'][i]}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: a.c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, border: '2px solid #fff', marginLeft: i > 0 ? -10 : 6, flexShrink: 0 }}>
                    {a.l}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', padding: 5, borderRadius: 16, boxShadow: '0 4px 14px rgba(30,35,60,.06)' }}>
              <div onClick={() => navigate('/')} style={{ padding: '9px 14px', borderRadius: 11, color: '#6c7184', fontSize: 13, fontWeight: 600, cursor: 'pointer' }} title="Accueil">🏠</div>
              {(['Vue d\'ensemble', 'Clients', 'Installations', 'Équipes', 'Rapports'] as const).map((label, vi) => {
                const v = (['overview', 'clients', 'installations', 'equipes', 'rapports'] as DashView[])[vi];
                const active = view === v;
                return (
                  <div key={v} onClick={() => setView(v)} style={{ padding: '9px 16px', borderRadius: 11, background: active ? '#15171f' : 'transparent', color: active ? '#fff' : '#6c7184', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap', userSelect: 'none' }}>
                    {label}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Schema quality badge */}
              {profile && (
                <div onClick={() => setShowSchema(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, background: profile.qualityScore >= 80 ? '#e4f7ef' : profile.qualityScore >= 55 ? '#fdf3e3' : '#fdecec', cursor: 'pointer' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: profile.qualityScore >= 80 ? '#16a06f' : profile.qualityScore >= 55 ? '#d99a2b' : '#e0564f' }}>
                    🔬 Score {profile.qualityScore}
                  </span>
                </div>
              )}
              {alerts.filter(a => a.type === 'error').length > 0 && (
                <div style={{ padding: '7px 12px', borderRadius: 10, background: '#fdecec', color: '#e0564f', fontSize: 12.5, fontWeight: 700 }}>
                  🔴 {alerts.filter(a => a.type === 'error').length} alerte(s)
                </div>
              )}
              {alerts.length > 0 && (
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(30,35,60,.06)', color: '#6c7184', cursor: 'pointer', position: 'relative' }}
                  onClick={() => { setView('overview'); setDashSection('forecast'); }}
                  title={`${alerts.length} alerte${alerts.length > 1 ? 's' : ''} active${alerts.length > 1 ? 's' : ''}`}
                >
                  🔔
                  {alerts.filter(a => a.type === 'error').length > 0 && (
                    <span style={{ position: 'absolute', top: 8, right: 10, width: 7, height: 7, background: '#ef5b54', borderRadius: '50%', border: '1.5px solid #fff' }} />
                  )}
                </div>
              )}
              <a href="https://wa.me/212661979129" target="_blank" rel="noopener noreferrer"
                style={{ padding: '8px 14px', borderRadius: 10, background: '#dcfce7', color: '#16a34a', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                💬 WhatsApp
              </a>
              <div onClick={() => { signOut(); navigate('/login'); }} style={{ padding: '8px 14px', borderRadius: 10, background: '#f4f5f8', color: '#6c7184', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>✕</div>
            </div>
          </div>

          {/* ── WELCOME BANNER ── */}
          {user && (() => {
            const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'utilisateur';
            const firstName = String(fullName).split(' ')[0];
            const role: string = (user.user_metadata?.role as string) || 'user';
            const roleLabels: Record<string, string> = { directeur: 'Directeur', secretaire: 'Secrétaire', client: 'Client' };
            const roleColors: Record<string, string> = { directeur: '#059669', secretaire: '#1E5FA8', client: '#D97706' };
            const roleLabel = roleLabels[role] || role;
            const roleColor = roleColors[role] || '#6c7184';
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', borderRadius: 14, background: '#f8f9fc', border: '1px solid #eef0f4' }}>
                <div style={{ fontSize: 22 }}>👋</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1d2030' }}>
                    Bonjour, <span style={{ color: '#15171f' }}>{firstName}</span> !
                  </div>
                  <div style={{ fontSize: 12, color: '#9398a8', fontWeight: 500, marginTop: 1 }}>
                    Connecté en tant que{' '}
                    <span style={{ fontWeight: 700, color: roleColor, background: roleColor + '14', padding: '1px 8px', borderRadius: 5 }}>
                      {roleLabel}
                    </span>
                    {' '}— Bienvenue sur votre tableau de bord KSSI TECH.
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── SCHEMA PANEL (collapsible) ── */}
          {showSchema && profile && (
            <div style={{ marginBottom: 20 }}>
              <SchemaPanel schema={schema} profile={profile} caps={caps} onClose={() => setShowSchema(false)} />
            </div>
          )}

          {/* ── FILTERS BAR ── */}
          <FiltersBar
            filters={filters}
            onChange={f => { setFilters(f); setPage(1); }}
            records={allProcessed}
            filteredCount={records.length}
            totalCount={allProcessed.length}
          />

          {/* ── DRILL-DOWN BANNER ── */}
          {hasDrill && (
            <div style={{ background: hexA(ACCENT, .1), border: `1.5px solid ${hexA(ACCENT, .25)}`, borderRadius: 14, padding: '10px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>🔍 Vue filtrée :</span>
              {drillStatus && <span style={{ fontSize: 12.5, fontWeight: 700, color: ACCENT, background: '#fff', padding: '3px 10px', borderRadius: 8 }}>{STATUS_META[drillStatus as Status]?.label || drillStatus}</span>}
              {drillTeam   && <span style={{ fontSize: 12.5, fontWeight: 700, color: ACCENT, background: '#fff', padding: '3px 10px', borderRadius: 8 }}>Équipe {drillTeam}</span>}
              {drillDebit  && <span style={{ fontSize: 12.5, fontWeight: 700, color: ACCENT, background: '#fff', padding: '3px 10px', borderRadius: 8 }}>{drillDebit} Méga</span>}
              <button onClick={clearDrill} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#e0564f', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>✕ Effacer</button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              OVERVIEW
          ══════════════════════════════════════════════════════════ */}
          {view === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 300px', gap: 20, alignItems: 'start' }}>

              {/* ── VERTICAL MENU ── */}
              <div style={{ position: 'sticky', top: 20, background: '#fff', borderRadius: 20, padding: '14px 10px', boxShadow: '0 4px 16px rgba(30,35,60,.06)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Analyse — always first */}
                {(() => {
                  const active = dashSection === 'excel';
                  return (
                    <div onClick={() => setDashSection('excel')}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '11px 14px', borderRadius: 14, cursor: 'pointer',
                        background: active ? hexA(ACCENT, .1) : 'transparent',
                        color: active ? ACCENT : '#6c7184',
                        fontWeight: active ? 700 : 600, fontSize: 14,
                        transition: 'all .15s', userSelect: 'none',
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = '#f7f8fa'; }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      <span>Analyse</span>
                      {projects.length > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: active ? ACCENT : '#e4e6ef', color: active ? '#fff' : '#8a90a3', padding: '1px 7px', borderRadius: 7 }}>
                          {projects.length}
                        </span>
                      )}
                    </div>
                  );
                })()}

                <div style={{ height: 1, background: '#f0f1f5', margin: '8px 6px' }} />

                {([
                  { key: 'kpis',      label: 'KPIs'       },
                  { key: 'charts',    label: 'Graphiques' },
                  { key: 'forecast',  label: 'Prévisions' },
                  { key: 'table',     label: 'Tableau'    },
                  { key: 'universal', label: 'Analyse IA' },
                ] as { key: string; label: string }[]).map(s => {
                  const dashSectionTyped = dashSection as string;
                  const active = dashSectionTyped === s.key;
                  return (
                    <div key={s.key} onClick={() => setDashSection(s.key as typeof dashSection)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        padding: '11px 14px', borderRadius: 14, cursor: 'pointer',
                        background: active ? (s.key === 'universal' ? '#6c5ce615' : '#f0f1f5') : 'transparent',
                        color: active ? (s.key === 'universal' ? '#6c5ce6' : '#1d2030') : '#6c7184',
                        fontWeight: active ? 700 : 600, fontSize: 13,
                        transition: 'all .15s', userSelect: 'none',
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = '#f7f8fa'; }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      {s.label}
                    </div>
                  );
                })}
              </div>

              {/* ── MAIN CONTENT ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

                {/* ─── SECTION: KPIs ─── */}
                {dashSection === 'kpis' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                      <KPICard label="Demandes totales" value={kpis.total}
                        subtitle={`${kpis.activeTeams} équipe${kpis.activeTeams > 1 ? 's' : ''} · ${kpis.uniqueClients} clients`}
                        sparkData={sparkInstalle} badge={{ text: periodLabel, color: '#16a06f', bg: '#e4f7ef' }} loading={loading} />
                      <KPICard label="Installées" value={kpis.installe}
                        subtitle={`${kpis.taux}% de taux de réalisation`}
                        trend={kpis.taux - 70} sparkData={sparkInstalle} accentColor="#16a06f" loading={loading} />
                      <KPICard label="À retraiter" value={kpis.annule + kpis.bloque}
                        subtitle={`${kpis.bloque} bloquées · ${kpis.annule} annulées`}
                        trend={kpis.bloque > 0 ? -Math.round(kpis.bloque / Math.max(kpis.total, 1) * 100) : null}
                        sparkData={sparkBloque} accentColor="#e0564f" loading={loading} />
                      <KPICard label="Planifiées" value={kpis.planifie}
                        subtitle="En attente de réalisation"
                        sparkData={sparkPlanifie} accentColor={ACCENT} loading={loading} />
                      {caps.hasDelayAnalysis && (
                        <KPICard label="Délai moyen" value={kpis.avgDelay !== null ? `${kpis.avgDelay}j` : '—'}
                          subtitle={`Médiane : ${kpis.medianDelay !== null ? kpis.medianDelay + 'j' : '—'}`}
                          trend={kpis.avgDelay !== null ? (kpis.avgDelay <= 2 ? 5 : -10) : null}
                          accentColor={kpis.avgDelay !== null && kpis.avgDelay <= 2 ? '#16a06f' : '#d99a2b'} loading={loading} />
                      )}
                      {caps.hasDelayAnalysis && (
                        <KPICard label="SLA Compliance" value={`${kpis.slaCompliance}%`}
                          subtitle="Installé ≤ 3j après planification"
                          trend={kpis.slaCompliance - 80}
                          accentColor={kpis.slaCompliance >= 80 ? '#16a06f' : '#d99a2b'} loading={loading} />
                      )}
                      {!caps.hasDelayAnalysis && (
                        <KPICard label="En attente" value={kpis.attente}
                          subtitle="Sans date de planification" accentColor="#d99a2b" loading={loading} />
                      )}
                      {!caps.hasDelayAnalysis && (
                        <KPICard label="Clients actifs" value={kpis.uniqueClients}
                          subtitle={`${kpis.activeTeams} équipe${kpis.activeTeams !== 1 ? 's' : ''}`} loading={loading} />
                      )}
                    </div>
                    <InsightCards insights={insights} />
                  </>
                )}

                {/* ─── SECTION: Graphiques ─── */}
                {dashSection === 'charts' && (
                  <>
                    {caps.hasDateData && <InstallationsOverTime records={records} />}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {caps.hasStatus && (
                        <StatusDonut records={records}
                          onStatusClick={s => { setDrillStatus(s); setDrillTeam(null); setDrillDebit(null); }} />
                      )}
                      {caps.hasTeam && (
                        <TeamLeaderboard teams={teams}
                          onTeamClick={name => { setDrillTeam(name); setDrillStatus(null); setDrillDebit(null); }} />
                      )}
                      {caps.hasStatus && !caps.hasTeam && (
                        <div style={card}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#9398a8', marginBottom: 12 }}>Colonne équipe non détectée</div>
                          <div style={{ fontSize: 13, color: '#b6bac6', fontWeight: 500 }}>
                            Ajoutez une colonne "EQUIPE" ou "TECHNICIEN" pour voir le classement par équipe.
                          </div>
                        </div>
                      )}
                    </div>
                    {caps.hasDelayAnalysis && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <DelayHistogram records={records} />
                        <WeekdayHeatmap records={records} />
                      </div>
                    )}
                    {caps.hasOffer && (
                      <DebitBreakdown records={records}
                        onDebitClick={d => { setDrillDebit(d); setDrillStatus(null); setDrillTeam(null); }} />
                    )}
                    {!caps.hasDateData && !caps.hasStatus && !caps.hasTeam && !caps.hasOffer && (
                      <div style={{ ...card, textAlign: 'center', padding: '48px 24px', color: '#b6bac6', fontSize: 14, fontWeight: 600 }}>
                        Importez un fichier Excel avec des données de dates ou statuts pour afficher les graphiques.
                      </div>
                    )}
                  </>
                )}

                {/* ─── SECTION: Prévisions & Alertes ─── */}
                {dashSection === 'forecast' && (
                  <>
                    {caps.hasDateData
                      ? <ForecastPanel forecast={forecast} />
                      : (
                        <div style={{ ...card, textAlign: 'center', padding: '32px 24px' }}>
                          <div style={{ fontSize: 32, marginBottom: 10 }}>🔮</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#9398a8' }}>Données de dates requises</div>
                          <div style={{ fontSize: 13, color: '#b6bac6', marginTop: 6, fontWeight: 500 }}>Importez un fichier avec des colonnes de planification pour activer les prévisions.</div>
                        </div>
                      )
                    }
                    <AlertsPanel alerts={alerts} />
                  </>
                )}

                {/* ─── SECTION: Tableau ─── */}
                {dashSection === 'table' && (
                  <div style={{ ...card, padding: '24px 26px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -.3 }}>Suivi des installations</div>
                        <div style={{ fontSize: 12, color: '#9398a8', marginTop: 2, fontWeight: 500 }}>{sorted.length} enregistrement{sorted.length > 1 ? 's' : ''}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#9398a8', background: '#f4f5f8', padding: '7px 13px', borderRadius: 10 }}>
                          {fileName || 'Données démo'}
                        </div>
                        <button onClick={exportCSV} style={{ border: 'none', background: '#e4f7ef', color: '#16a06f', fontSize: 12.5, fontWeight: 700, padding: '7px 14px', borderRadius: 10, cursor: 'pointer' }}>
                          ↓ CSV
                        </button>
                      </div>
                    </div>

                    {/* Status tabs */}
                    <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #eef0f4', paddingBottom: 14, marginBottom: 6, flexWrap: 'wrap' }}>
                      {(['all', 'installe', 'planifie', 'bloque', 'annule', 'attente'] as TabKey[]).map(k => {
                        const label = k === 'all' ? 'Toutes' : STATUS_META[k as Status].label;
                        const active = tab === k;
                        return (
                          <div key={k} onClick={() => { setTab(k); setPage(1); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: active ? ACCENT : '#f4f5f8', color: active ? '#fff' : '#6c7184', transition: 'all .15s', userSelect: 'none' }}>
                            {label}
                            <span style={{ fontSize: 10.5, fontWeight: 700, background: active ? 'rgba(255,255,255,.25)' : '#e6e8ef', color: active ? '#fff' : '#8a90a3', padding: '1px 6px', borderRadius: 7 }}>{tabCounts[k]}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Table header */}
                    <div style={{ display: 'grid', gridTemplateColumns: `2.2fr ${caps.hasTeam ? '1.1fr' : ''} ${caps.hasOffer ? '0.9fr' : ''} ${caps.hasPlannedDate ? '1fr' : ''} 1.1fr 40px`, gap: 10, padding: '10px 6px', alignItems: 'center', borderBottom: '1px solid #f3f4f8' }}>
                      <ColHead col="client" label="Client" />
                      {caps.hasTeam && <ColHead col="team" label="Équipe" />}
                      {caps.hasOffer && <ColHead col="offer" label="Offre" />}
                      {caps.hasPlannedDate && <ColHead col="planned_date" label="Planifié" />}
                      <ColHead col="_status" label="Statut" />
                      <div />
                    </div>

                    {/* Rows */}
                    <div style={{ overflowY: 'auto', maxHeight: 520 }}>
                      {pageRows.length === 0 ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#b6bac6', fontSize: 13, fontWeight: 600 }}>Aucune installation dans cette catégorie</div>
                      ) : pageRows.map((r, i) => {
                        const sm = STATUS_META[r._status];
                        return (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: `2.2fr ${caps.hasTeam ? '1.1fr' : ''} ${caps.hasOffer ? '0.9fr' : ''} ${caps.hasPlannedDate ? '1fr' : ''} 1.1fr 40px`, gap: 10, padding: '12px 6px', alignItems: 'center', borderTop: '1px solid #f3f4f8', transition: 'background .1s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#fafbfc'}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                              <Avatar name={r.client || '?'} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.client || '—'}</div>
                                <div style={{ fontSize: 11.5, color: '#9398a8', fontWeight: 500 }}>{r.sip || '—'}</div>
                              </div>
                            </div>
                            {caps.hasTeam && <div style={{ fontSize: 13, fontWeight: 600, color: '#4a4f63' }}>{r._teamName}</div>}
                            {caps.hasOffer && <div style={{ fontSize: 13, fontWeight: 700 }}>{debitShort(r.offer || '')}</div>}
                            {caps.hasPlannedDate && (
                              <div style={{ fontSize: 13, fontWeight: 500, color: '#6c7184' }}>
                                {fmtDate(r.planned_date || '')}
                                {r._delayDays !== null && (
                                  <span style={{ fontSize: 10.5, marginLeft: 5, fontWeight: 700, color: r._delayDays > 3 ? '#e0564f' : '#16a06f' }}>
                                    {r._delayDays > 0 ? `+${r._delayDays}j` : r._delayDays === 0 ? '✓' : `${r._delayDays}j`}
                                  </span>
                                )}
                              </div>
                            )}
                            <div>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, background: sm.bg, color: sm.color, padding: '4px 10px', borderRadius: 9 }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.color, flexShrink: 0 }} />
                                {sm.label}
                              </span>
                            </div>
                            <div style={{ textAlign: 'center', color: '#c2c6d2', fontWeight: 700, fontSize: 16 }}>⋮</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 6px', borderTop: '1px solid #f3f4f8' }}>
                        <div style={{ fontSize: 12.5, color: '#9398a8', fontWeight: 500 }}>
                          {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} sur {sorted.length}
                        </div>
                        <div style={{ display: 'flex', gap: 5 }}>
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                            .reduce<(number | '…')[]>((acc, p, i, arr) => {
                              if (i > 0 && typeof arr[i - 1] === 'number' && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                              acc.push(p); return acc;
                            }, [])
                            .map((p, i) => p === '…'
                              ? <span key={`e${i}`} style={{ padding: '6px 8px', fontSize: 12.5, color: '#b6bac6' }}>…</span>
                              : <div key={p} onClick={() => setPage(p as number)}
                                style={{ padding: '6px 11px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', background: page === p ? ACCENT : '#f4f5f8', color: page === p ? '#fff' : '#6c7184', userSelect: 'none' }}>
                                {p}
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                    <div style={{ height: 12 }} />
                  </div>
                )}

                {/* ─── SECTION: Analyse Project ─── */}
                {dashSection === 'excel' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                    {/* ── Upload Wizard ── */}
                    <UploadWizard userId={user?.id} onComplete={handleWizardComplete} />

                    {/* Projects list */}
                    {projects.length > 0 && (
                      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 6px 20px rgba(30,35,60,.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f0f1f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: 17, fontWeight: 800 }}>Projets analysés</div>
                            <div style={{ fontSize: 11.5, color: '#9398a8', fontWeight: 500, marginTop: 1 }}>{projects.length} projet{projects.length > 1 ? 's' : ''}</div>
                          </div>
                        </div>
                        {/* Table header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr 0.7fr 0.7fr 0.7fr 0.9fr', gap: 10, padding: '10px 20px', fontSize: 10.5, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase' as const, letterSpacing: .5, borderBottom: '1px solid #f3f4f8' }}>
                          <div>Fichier</div><div>Date d'import</div><div>Lignes</div><div>Équipes</div><div>Score</div><div>Taux install.</div>
                        </div>
                        {/* Rows */}
                        {projects.map((p, i) => {
                          const isActive = selectedProject?.id === p.id;
                          return (
                            <div key={p.id}
                              onClick={() => {
                                // Load this project's data into the active state
                                setRawRecs(p.records);
                                setSchema(p.schema);
                                setCaps(p.caps);
                                setProfile(p.profile);
                                setFileName(p.fileName);
                                setFilters(DEFAULT_FILTERS);
                                setTab('all');
                                setPage(1);
                                setDrillStatus(null); setDrillTeam(null); setDrillDebit(null);
                                // Show the schema panel
                                setShowSchema(true);
                                // Open the project detail side panel
                                setSelectedProject(p);
                                setProjectPanelTab('overview');
                              }}
                              style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr 0.7fr 0.7fr 0.7fr 0.9fr', gap: 10, padding: '13px 20px', alignItems: 'center', borderBottom: i < projects.length - 1 ? '1px solid #f3f4f8' : 'none', cursor: 'pointer', background: isActive ? hexA(ACCENT, .04) : 'transparent', borderLeft: `3px solid ${isActive ? ACCENT : 'transparent'}`, transition: 'all .12s' }}
                              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = '#fafbfc'; }}
                              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 9, background: hexA(ACCENT, .1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📊</div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.fileName}</div>
                                  <div style={{ fontSize: 10.5, color: '#9398a8', fontWeight: 500, marginTop: 1 }}>{p.recordCount} enregistrements</div>
                                </div>
                              </div>
                              <div style={{ fontSize: 12, color: '#4a4f63', fontWeight: 500 }}>
                                {new Date(p.uploadedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                <div style={{ fontSize: 10.5, color: '#9398a8', marginTop: 1 }}>{new Date(p.uploadedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{p.recordCount}</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#4a4f63' }}>{p.teamCount}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 40, height: 5, borderRadius: 4, background: '#e8eaef', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', borderRadius: 4, width: p.qualityScore + '%', background: p.qualityScore >= 80 ? '#16c79a' : p.qualityScore >= 55 ? '#d99a2b' : '#e0564f' }} />
                                </div>
                                <span style={{ fontSize: 11.5, fontWeight: 700, color: p.qualityScore >= 80 ? '#16a06f' : p.qualityScore >= 55 ? '#d99a2b' : '#e0564f' }}>{p.qualityScore}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.taux >= 70 ? '#16c79a' : p.taux >= 40 ? '#d99a2b' : '#e0564f', flexShrink: 0 }} />
                                <span style={{ fontSize: 13, fontWeight: 800, color: p.taux >= 70 ? '#16a06f' : p.taux >= 40 ? '#d99a2b' : '#e0564f' }}>{p.taux}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* ── Cloud files ── */}
                    {cloudFiles.length > 0 && (
                      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 6px 20px rgba(30,35,60,.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f0f1f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: 17, fontWeight: 800 }}>☁️ Fichiers cloud</div>
                            <div style={{ fontSize: 11.5, color: '#9398a8', fontWeight: 500, marginTop: 1 }}>Sauvegardés dans Supabase Storage</div>
                          </div>
                          <button onClick={fetchCloudFiles} style={{ background: '#f4f5f8', border: 'none', color: '#6c7184', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 9, cursor: 'pointer' }}>↺ Rafraîchir</button>
                        </div>
                        {cloudFiles.map((f, i) => {
                          const kb   = Math.round(f.file_size / 1024);
                          const date = new Date(f.uploaded_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
                          const time = new Date(f.uploaded_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                          const ext  = f.file_name.split('.').pop()?.toLowerCase() || '';
                          return (
                            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: i < cloudFiles.length - 1 ? '1px solid #f3f4f8' : 'none' }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: hexA(ACCENT, .1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                                {ext === 'csv' ? '📄' : '📊'}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.file_name}</div>
                                <div style={{ fontSize: 11, color: '#9398a8', fontWeight: 500, marginTop: 2 }}>
                                  {f.record_count} lignes · {kb} Ko · {date} à {time}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                <div style={{ width: 36, height: 4, borderRadius: 4, background: '#e8eaef', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: f.quality_score + '%', background: f.quality_score >= 80 ? '#16c79a' : f.quality_score >= 55 ? '#d99a2b' : '#e0564f', borderRadius: 4 }} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#9398a8' }}>{f.quality_score}</span>
                              </div>
                              <button onClick={() => reloadCloudFile(f)}
                                style={{ background: hexA(ACCENT, .1), border: 'none', color: ACCENT, fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 9, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                ▶ Charger
                              </button>
                              <button onClick={() => deleteFileMeta(f.id, f.file_path).then(fetchCloudFiles)}
                                style={{ width: 30, height: 30, borderRadius: 8, background: '#fdecec', border: 'none', color: '#e0564f', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🗑</button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── SECTION: Universal Analysis ─── */}
                {(dashSection as string) === 'universal' && (
                  universalProfile
                    ? <UniversalDashboard profile={universalProfile} fileName={fileName || 'Données'} />
                    : (
                      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <div style={{ fontSize: 36, marginBottom: 14 }}>🔬</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1d2030', marginBottom: 8 }}>Importez un fichier Excel</div>
                        <div style={{ fontSize: 13, color: '#9398a8', maxWidth: 340, margin: '0 auto' }}>
                          L'analyse universelle se lance automatiquement dès qu'un fichier est importé. Elle fonctionne avec n'importe quelle structure de données.
                        </div>
                      </div>
                    )
                )}

              </div>

              {/* ── RIGHT COLUMN: AI Chat + Team Contact ── */}
              <div style={{
                position: 'sticky', top: 20,
                display: 'flex', flexDirection: 'column',
                gap: 10,
                maxHeight: 'calc(100vh - 80px)',
                overflowY: 'auto',
              }}>

              {/* AI Chat Box */}
              <div style={{
                background: 'linear-gradient(160deg,#eef0ff 0%,#f3effb 55%,#eef6ff 100%)',
                borderRadius: 20, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 320,
                boxShadow: '0 6px 20px rgba(30,35,60,.07)',
              }}>
                {/* Header */}
                <div style={{ padding: '18px 14px 12px', flexShrink: 0, borderBottom: '1px solid rgba(108,92,230,.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 9.5, color: '#6c7184', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>Assistant IA</div>
                      <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -.3, marginTop: 1, color: '#1d2030' }}>KSSI AI</div>
                    </div>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: hexA(ACCENT, .12), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
                  </div>
                  <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,.7)', padding: 3, borderRadius: 10, marginBottom: 10 }}>
                    {([
                      { k: 'kssi',     label: 'KSSI AI',    available: true,  tip: 'Moteur local FTTH — fonctionne hors ligne' },
                      { k: 'gpt',      label: 'Claude Pro',  available: false, tip: 'Nécessite VITE_ANTHROPIC_API_KEY' },
                      { k: 'deepseek', label: 'Claude Fast', available: false, tip: 'Nécessite VITE_ANTHROPIC_API_KEY' },
                    ] as { k: AIModel; label: string; available: boolean; tip: string }[]).map(({ k, label, available, tip }) => (
                      <div key={k}
                        onClick={() => available ? setAiModel(k) : undefined}
                        title={tip}
                        style={{
                          flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 8,
                          background: aiModel === k ? hexA(ACCENT, .15) : 'transparent',
                          color: aiModel === k ? ACCENT : available ? '#9398a8' : '#c8cad4',
                          fontSize: 10.5, fontWeight: aiModel === k ? 700 : 600,
                          cursor: available ? 'pointer' : 'not-allowed',
                          transition: 'all .15s',
                          opacity: available ? 1 : 0.55,
                        }}>
                        {label}{!available && ' 🔒'}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                    {ACTION_BUTTONS.map((a, i) => (
                      <div key={i} onClick={() => sendMessage(a.q)}
                        style={{ background: 'rgba(255,255,255,.8)', borderRadius: 10, padding: '8px', cursor: 'pointer', transition: 'transform .12s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}>
                        <div style={{ width: 22, height: 22, borderRadius: 7, background: a.bg, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, marginBottom: 5 }}>{a.emoji}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#1d2030', lineHeight: 1.3 }}>{a.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chatMsgs.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                      {msg.role === 'ai' && (
                        <div style={{ width: 22, height: 22, borderRadius: 7, background: hexA(ACCENT, .12), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>🤖</div>
                      )}
                      <div style={{ maxWidth: '85%', padding: '9px 11px', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: msg.role === 'user' ? ACCENT : 'rgba(255,255,255,.92)', color: msg.role === 'user' ? '#fff' : '#1d2030', fontSize: 11.5, fontWeight: 500, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {msg.text}
                        <div style={{ fontSize: 9.5, color: msg.role === 'user' ? 'rgba(255,255,255,.6)' : '#b6bac6', marginTop: 3, textAlign: 'right' }}>{msg.ts}</div>
                      </div>
                    </div>
                  ))}
                  {aiThinking && (
                    <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                      <div style={{ width: 22, height: 22, borderRadius: 7, background: hexA(ACCENT, .12), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>🤖</div>
                      <div style={{ padding: '9px 14px', borderRadius: '12px 12px 12px 4px', background: 'rgba(255,255,255,.92)', display: 'flex', gap: 4, alignItems: 'center' }}>
                        {[0, 1, 2].map(j => (
                          <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, opacity: 0.6, animation: `pulse 1s ${j * 0.2}s infinite` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                {/* Input */}
                <div style={{ padding: '10px 12px 14px', borderTop: '1px solid rgba(108,92,230,.08)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.9)', borderRadius: 12, padding: '9px 12px' }}>
                    <input
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      onKeyDown={handleInputKey}
                      placeholder="Posez une question…"
                      style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12.5, fontWeight: 500, color: '#1d2030', outline: 'none' }}
                    />
                    <div onClick={() => sendMessage(aiInput)}
                      style={{ width: 28, height: 28, borderRadius: 8, background: (aiInput.trim() && !aiThinking) ? ACCENT : '#e4e6ef', color: (aiInput.trim() && !aiThinking) ? '#fff' : '#b6bac6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, cursor: (aiInput.trim() && !aiThinking) ? 'pointer' : 'default', transition: 'all .15s' }}>
                      {aiThinking ? '…' : '➤'}
                    </div>
                  </div>
                </div>
              </div>
              {/* ── END AI Chat Box ── */}

              {/* ── TEAM CONTACT WIDGET ── */}
              <div style={{
                background: '#fff',
                borderRadius: 20,
                padding: '16px 14px',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(30,35,60,.06)',
                border: '1px solid #f0f1f5',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 9.5, color: '#6c7184', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1.5 }}>Contact équipe</div>
                    <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -.3, marginTop: 1, color: '#1d2030' }}>Messagerie interne</div>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: '#e4f7ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>💬</div>
                </div>

                {/* Team members — derived from real data */}
                {teams.slice(0, 2).map((t, i) => {
                  const member = {
                    name: t.name,
                    role: `${t.total} demandes · ${t.taux}%`,
                    color: t.color,
                    available: t.planifie > 0 || t.bloque > 0,
                  };
                  return (
                  <div key={i}
                    onClick={() => navigate('/inbox')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', borderRadius: 13,
                      cursor: 'pointer', marginBottom: 6,
                      background: '#f8f9fc',
                      transition: 'background .12s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#eef0f4'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#f8f9fc'}
                  >
                    {/* Avatar with status dot */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 11,
                        background: member.color + '18', color: member.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800,
                      }}>
                        {initials(member.name)}
                      </div>
                      <div style={{
                        position: 'absolute', bottom: -1, right: -1,
                        width: 10, height: 10, borderRadius: '50%',
                        background: member.available ? '#16a06f' : '#e0564f',
                        border: '2px solid #fff',
                      }} />
                    </div>

                    {/* Name + role */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1d2030', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {member.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#9398a8', fontWeight: 500 }}>{member.role}</div>
                    </div>

                    {/* Availability + arrow */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: member.available ? '#16a06f' : '#e0564f',
                        background: member.available ? '#e4f7ef' : '#fdecec',
                        padding: '2px 7px', borderRadius: 6,
                      }}>
                        {member.available ? 'Actif' : 'Inactif'}
                      </span>
                      <span style={{ color: '#c2c6d2', fontSize: 16, lineHeight: 1 }}>›</span>
                    </div>
                  </div>
                  );
                })}

                {/* CTA button */}
                <button
                  onClick={() => navigate('/inbox')}
                  style={{
                    width: '100%', marginTop: 6,
                    padding: '10px 0', borderRadius: 13,
                    background: '#15171f', color: '#caa35e',
                    fontSize: 12.5, fontWeight: 700,
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#1d2030'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#15171f'}
                >
                  Ouvrir la messagerie <span style={{ fontSize: 14 }}>→</span>
                </button>
              </div>
              {/* ── END TEAM CONTACT WIDGET ── */}

              </div>
              {/* ── END RIGHT COLUMN ── */}

            </div>
          )}

          {/* ══════════ CLIENTS VIEW ══════════ */}
          {view === 'clients' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>Clients — {records.length} demandes</div>
                <button onClick={exportCSV} style={{ border: 'none', background: '#e4f7ef', color: '#16a06f', fontSize: 13, fontWeight: 700, padding: '9px 18px', borderRadius: 12, cursor: 'pointer' }}>↓ Exporter CSV</button>
              </div>
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: `2fr ${caps.hasTeam ? '1fr' : ''} ${caps.hasOffer ? '1fr' : ''} ${caps.hasPlannedDate ? '1fr' : ''} ${caps.hasInstallDate ? '1fr' : ''} 1.2fr 40px`, gap: 12, padding: '12px 20px', borderBottom: '1px solid #f3f4f8' }}>
                  <ColHead col="client" label="Client" />
                  {caps.hasTeam && <ColHead col="team" label="Équipe" />}
                  {caps.hasOffer && <ColHead col="offer" label="Offre" />}
                  {caps.hasPlannedDate && <ColHead col="planned_date" label="Planifié" />}
                  {caps.hasInstallDate && <ColHead col="installation_date" label="Installé" />}
                  <ColHead col="_status" label="Statut" />
                  <div />
                </div>
                <div style={{ overflowY: 'auto', maxHeight: 600 }}>
                  {sorted.map((r, i) => {
                    const sm = STATUS_META[r._status];
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: `2fr ${caps.hasTeam ? '1fr' : ''} ${caps.hasOffer ? '1fr' : ''} ${caps.hasPlannedDate ? '1fr' : ''} ${caps.hasInstallDate ? '1fr' : ''} 1.2fr 40px`, gap: 12, padding: '13px 20px', alignItems: 'center', borderBottom: '1px solid #f8f9fc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <Avatar name={r.client || '?'} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.client || '—'}</div>
                            <div style={{ fontSize: 11.5, color: '#9398a8', fontWeight: 500 }}>{r.sip || '—'}</div>
                          </div>
                        </div>
                        {caps.hasTeam && <div style={{ fontSize: 13, fontWeight: 600, color: '#4a4f63' }}>{r._teamName}</div>}
                        {caps.hasOffer && <div style={{ fontSize: 13, fontWeight: 700 }}>{debitShort(r.offer || '')}</div>}
                        {caps.hasPlannedDate && <div style={{ fontSize: 13, color: '#6c7184', fontWeight: 500 }}>{fmtDate(r.planned_date || '')}</div>}
                        {caps.hasInstallDate && <div style={{ fontSize: 13, color: '#6c7184', fontWeight: 500 }}>{fmtDate(r.installation_date || '') || '—'}</div>}
                        <div><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, background: sm.bg, color: sm.color, padding: '4px 10px', borderRadius: 9 }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.color }} />{sm.label}
                        </span></div>
                        <div style={{ color: '#c2c6d2', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>⋮</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ INSTALLATIONS VIEW ══════════ */}
          {view === 'installations' && (() => {
            const byDate: Record<string, ProcessedRecord[]> = {};
            records.forEach(r => {
              const k = r.installation_date || r.planned_date || 'Non daté';
              if (!byDate[k]) byDate[k] = [];
              byDate[k].push(r);
            });
            const sorted2 = Object.entries(byDate).sort(([a], [b]) => {
              const da = parseDate(a), db = parseDate(b);
              if (!da && !db) return 0; if (!da) return 1; if (!db) return -1;
              return da.getTime() - db.getTime();
            });
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>Installations — chronologie ({records.length})</div>
                {sorted2.map(([date, recs]) => (
                  <div key={date} style={card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: ACCENT + '18', color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                        {date !== 'Non daté' ? fmtDate(date) : '—'}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{date !== 'Non daté' ? date : 'Non daté'}</div>
                        <div style={{ fontSize: 12.5, color: '#9398a8', fontWeight: 500 }}>{recs.length} installation{recs.length > 1 ? 's' : ''}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {STATUS_ORDER.map(s => { const n = recs.filter(r => r._status === s).length; return n > 0 ? <span key={s} style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 8, background: STATUS_META[s].bg, color: STATUS_META[s].color }}>{n} {STATUS_META[s].label}</span> : null; })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {recs.map((r, i) => {
                        const sm = STATUS_META[r._status];
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8f9fc', borderRadius: 10, padding: '9px 12px', flex: '0 0 calc(50% - 5px)' }}>
                            <Avatar name={r.client || '?'} size={32} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.client || '—'}</div>
                              <div style={{ fontSize: 11, color: '#9398a8', fontWeight: 500 }}>{caps.hasTeam ? `${r._teamName} · ` : ''}{debitShort(r.offer || '')}</div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7, background: sm.bg, color: sm.color, flexShrink: 0 }}>{sm.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ══════════ ÉQUIPES VIEW ══════════ */}
          {view === 'equipes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {!caps.hasTeam ? (
                <div style={card}>
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#1d2030', marginBottom: 8 }}>Données d'équipe non disponibles</div>
                    <div style={{ fontSize: 14, color: '#9398a8', fontWeight: 500, maxWidth: 360, margin: '0 auto' }}>
                      Le fichier chargé ne contient pas de colonne "EQUIPE". Importez un fichier avec cette information.
                    </div>
                  </div>
                </div>
              ) : (() => {
                const filteredTeams = [...teams.filter(t =>
                  t.name.toLowerCase().includes(teamSearch.toLowerCase())
                )].sort((a, b) => {
                  let cmp = 0;
                  if (teamSortCol === 'name')     cmp = a.name.localeCompare(b.name);
                  if (teamSortCol === 'total')    cmp = a.total - b.total;
                  if (teamSortCol === 'installe') cmp = a.installe - b.installe;
                  if (teamSortCol === 'taux')     cmp = a.taux - b.taux;
                  if (teamSortCol === 'status')   cmp = a.taux - b.taux;
                  return teamSortDir === 'asc' ? cmp : -cmp;
                });
                return (
                  <>
                    {/* Top bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>Équipes</div>
                        <div style={{ fontSize: 12.5, color: '#9398a8', fontWeight: 500, marginTop: 1 }}>{teams.length} équipe{teams.length > 1 ? 's' : ''}</div>
                      </div>
                    </div>

                    {/* Search bar */}
                    <div style={{ background: '#fff', border: '1.5px solid #eef0f4', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 15, color: '#b6bac6' }}>🔍</span>
                      <input value={teamSearch} onChange={ev => setTeamSearch(ev.target.value)}
                        placeholder="Rechercher une équipe…"
                        style={{ border: 'none', outline: 'none', fontSize: 13.5, fontWeight: 500, color: '#1d2030', background: 'transparent', flex: 1 }} />
                      {teamSearch && (
                        <span onClick={() => setTeamSearch('')} style={{ cursor: 'pointer', color: '#b6bac6', fontSize: 14, lineHeight: 1 }}>✕</span>
                      )}
                    </div>

                    {/* CRM Table */}
                    <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 6px 20px rgba(30,35,60,.05)', overflow: 'hidden' }}>
                      {/* Column headers */}
                      <div style={{ display: 'grid', gridTemplateColumns: '36px 2.2fr 1.4fr 1fr 0.7fr 0.9fr 1.4fr 1fr', gap: 10, padding: '11px 20px', borderBottom: '1.5px solid #f0f1f5', background: '#fafbfc' }}>
                        <div><input type="checkbox" style={{ accentColor: ACCENT, cursor: 'pointer' }} readOnly /></div>
                        {(['name', 'installe', null, 'total', null, 'taux', 'status'] as const).reduce<React.ReactNode[]>((acc, col, idx) => {
                          const labels = ['Nom', 'Contacts', 'Spécialité', 'Total', 'Responsable', 'Progression', 'Statut'];
                          const label = labels[idx];
                          if (col === null) {
                            acc.push(<div key={idx} style={{ fontSize: 10.5, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .5 }}>{label}</div>);
                          } else {
                            const active = teamSortCol === col;
                            acc.push(
                              <div key={idx} onClick={() => toggleTeamSort(col)}
                                style={{ fontSize: 10.5, fontWeight: 700, color: active ? ACCENT : '#9398a8', textTransform: 'uppercase', letterSpacing: .5, cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                                {label}{active && <span style={{ color: ACCENT }}>{teamSortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
                              </div>
                            );
                          }
                          return acc;
                        }, [])}
                      </div>

                      {/* Rows */}
                      {filteredTeams.length === 0 ? (
                        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#b6bac6', fontSize: 13, fontWeight: 600 }}>
                          Aucune équipe ne correspond à la recherche
                        </div>
                      ) : filteredTeams.map((e, ei) => {
                        const sub = records.filter(r => r._teamName === e.name);
                        const offerCounts: Record<string, number> = {};
                        sub.forEach(r => { const o = debitShort(r.offer || ''); if (o) offerCounts[o] = (offerCounts[o] || 0) + 1; });
                        const topOffer = Object.entries(offerCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'FTTH';
                        const barColor = e.taux >= 70 ? '#16c79a' : e.taux >= 40 ? '#d9a93e' : '#e0564f';
                        const statusBadge = e.taux >= 70
                          ? { label: 'Actif',       bg: '#e4f7ef', color: '#16a06f' }
                          : e.taux >= 40
                          ? { label: 'En cours',    bg: '#e4eeff', color: '#5b8def' }
                          : { label: 'À améliorer', bg: '#fdf3e3', color: '#d99a2b' };
                        const isActive = selectedTeam?.name === e.name;
                        return (
                          <div key={ei}
                            onClick={() => { setSelectedTeam(e); setTeamPanelTab('overview'); }}
                            style={{ display: 'grid', gridTemplateColumns: '36px 2.2fr 1.4fr 1fr 0.7fr 0.9fr 1.4fr 1fr', gap: 10, padding: '14px 20px', alignItems: 'center', borderBottom: ei < filteredTeams.length - 1 ? '1px solid #f3f4f8' : 'none', cursor: 'pointer', background: isActive ? hexA(ACCENT, .04) : 'transparent', borderLeft: `3px solid ${isActive ? ACCENT : 'transparent'}`, transition: 'all .1s' }}
                            onMouseEnter={ev => { if (!isActive) (ev.currentTarget as HTMLDivElement).style.background = '#fafbfc'; }}
                            onMouseLeave={ev => { if (!isActive) (ev.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                          >
                            {/* Checkbox */}
                            <div onClick={ev => ev.stopPropagation()}>
                              <input type="checkbox" style={{ accentColor: ACCENT, cursor: 'pointer' }} readOnly />
                            </div>

                            {/* Nom */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                              <div style={{ width: 38, height: 38, borderRadius: 11, background: e.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                                {initials(e.name)}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1d2030', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                                <div style={{ fontSize: 11, color: '#9398a8', fontWeight: 500, marginTop: 1 }}>
                                  {caps.hasDelayAnalysis && e.avgDelay !== null ? `Délai moy. ${e.avgDelay}j` : `${e.planifie} planifiées`}
                                </div>
                              </div>
                            </div>

                            {/* Contacts */}
                            <div>
                              <div style={{ fontSize: 12.5, color: '#4a4f63', fontWeight: 600 }}>{e.installe} installées</div>
                              <div style={{ fontSize: 11, color: '#9398a8', fontWeight: 500, marginTop: 1 }}>{sub.length} client{sub.length > 1 ? 's' : ''}</div>
                            </div>

                            {/* Spécialité */}
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#4a4f63' }}>{topOffer} Fibre</div>

                            {/* Total */}
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#1d2030' }}>{e.total}</div>

                            {/* Chef d'équipe — initiales du nom d'équipe */}
                            <div style={{ display: 'flex' }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: e.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, border: '2px solid #fff', flexShrink: 0 }}>
                                {initials(e.name)}
                              </div>
                            </div>

                            {/* Progression */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 6, borderRadius: 4, background: '#f0f1f5', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: e.taux + '%', background: barColor, borderRadius: 4, transition: 'width .5s' }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#4a4f63', width: 32, textAlign: 'right' }}>{e.taux}%</span>
                            </div>

                            {/* Statut badge */}
                            <div>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, padding: '4px 11px', borderRadius: 8, background: statusBadge.bg, color: statusBadge.color, whiteSpace: 'nowrap' }}>
                                {statusBadge.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0' }}>
                      <div style={{ fontSize: 12, color: '#9398a8', fontWeight: 500 }}>
                        {filteredTeams.length} équipe{filteredTeams.length > 1 ? 's' : ''}
                        {teams.length !== filteredTeams.length ? ` sur ${teams.length}` : ''}
                        {' · '}
                        {records.length} demandes au total
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ══════════ RAPPORTS VIEW ══════════ */}
          {view === 'rapports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Rapports & Export</div>

              <div style={card}>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 18 }}>📊 Rapport de synthèse</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Total demandes', val: kpis.total, color: '#1d2030' },
                    { label: 'Installées', val: `${kpis.installe} (${kpis.taux}%)`, color: '#16a06f' },
                    { label: 'Planifiées', val: kpis.planifie, color: ACCENT },
                    { label: 'Bloquées', val: kpis.bloque, color: '#e0564f' },
                    { label: 'Annulées', val: kpis.annule, color: '#8a90a3' },
                    ...(caps.hasDelayAnalysis ? [
                      { label: 'SLA compliance', val: `${kpis.slaCompliance}%`, color: kpis.slaCompliance >= 80 ? '#16a06f' : '#d99a2b' },
                      { label: 'Délai moyen', val: kpis.avgDelay !== null ? `${kpis.avgDelay}j` : '—', color: '#5b8def' },
                    ] : []),
                    ...(caps.hasComment ? [{ label: 'Injoignables', val: kpis.injoignables, color: '#d99a2b' }] : []),
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '14px 12px', background: '#f8f9fc', borderRadius: 14 }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: -1 }}>{s.val}</div>
                      <div style={{ fontSize: 11.5, color: '#9398a8', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: '#4a4f63', fontWeight: 500, background: '#f8f9fc', borderRadius: 12, padding: '16px 18px' }}>
                  <strong>Synthèse :</strong> Sur {kpis.total} demandes, {kpis.installe} installations réalisées ({kpis.taux}%).{' '}
                  {kpis.annule} annulées et {kpis.bloque} bloquées nécessitent un retraitement.{' '}
                  {caps.hasDelayAnalysis && `SLA compliance : ${kpis.slaCompliance}%. `}
                  Il faut {Math.max(0, Math.ceil(kpis.total * .9) - kpis.installe)} installations supplémentaires pour atteindre 90%.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {caps.hasTeam && (
                  <div style={card}>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>👥 Par équipe</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ color: '#9398a8', fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: .4 }}>
                          <th style={{ padding: '6px 0', textAlign: 'left' }}>Équipe</th>
                          <th style={{ padding: '6px', textAlign: 'right' }}>Total</th>
                          <th style={{ padding: '6px', textAlign: 'right' }}>Install.</th>
                          <th style={{ padding: '6px', textAlign: 'right' }}>Taux</th>
                          {caps.hasDelayAnalysis && <th style={{ padding: '6px', textAlign: 'right' }}>Délai</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map((e, i) => (
                          <tr key={i} style={{ borderTop: '1px solid #f3f4f8' }}>
                            <td style={{ padding: '10px 0', fontWeight: 700 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: e.color, display: 'inline-block' }} />{e.name}
                              </span>
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 600, color: '#6c7184' }}>{e.total}</td>
                            <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 800, color: '#16a06f' }}>{e.installe}</td>
                            <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: e.taux >= 70 ? '#16a06f' : '#d99a2b' }}>{e.taux}%</td>
                            {caps.hasDelayAnalysis && <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600, color: '#9398a8' }}>{e.avgDelay !== null ? e.avgDelay + 'j' : '—'}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div style={{ ...card, background: 'linear-gradient(135deg,#f4f2ff,#eef6ff)' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>💾 Export</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Export CSV', icon: '📄', desc: `${records.length} enregistrements filtrés`, color: '#16a06f', bg: '#e4f7ef' },
                    ].map((btn, i) => (
                      <div key={i} onClick={exportCSV}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', transition: 'transform .12s', boxShadow: '0 4px 12px rgba(30,35,60,.06)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: btn.bg, color: btn.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{btn.icon}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{btn.label}</div>
                          <div style={{ fontSize: 12, color: '#9398a8', fontWeight: 500 }}>{btn.desc}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: 20, color: '#c2c6d2' }}>›</div>
                      </div>
                    ))}
                  </div>

                  {/* Schema info in reports */}
                  {profile && (
                    <div style={{ marginTop: 14, background: '#fff', borderRadius: 12, padding: '12px 14px' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#3a3f52', marginBottom: 8 }}>Schéma chargé</div>
                      <div style={{ fontSize: 12, color: '#6c7184', fontWeight: 500, lineHeight: 1.6 }}>
                        Score qualité : <strong style={{ color: ACCENT }}>{profile.qualityScore}/100</strong><br />
                        {profile.mappedColumns} colonnes reconnues · {profile.unmappedColumns} non mappées<br />
                        {profile.duplicateRows > 0 && `${profile.duplicateRows} doublons supprimés`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <InsightCards insights={insights} />
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
