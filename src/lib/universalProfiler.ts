// src/lib/universalProfiler.ts
// Universal Excel dataset profiler — works with ANY column structure.
// Does NOT assume FTTH/installation data — it auto-discovers the dataset shape.

// ─── Types ────────────────────────────────────────────────────────────────────

export type UniversalColumnType =
  | 'numeric'      // integers/decimals
  | 'currency'     // numbers with currency symbols/markers
  | 'percentage'   // values ending with % or in 0-100 range
  | 'date'         // date strings in common formats
  | 'categorical'  // text with low cardinality (< 50 unique)
  | 'boolean'      // oui/non/true/false/1/0
  | 'identifier'   // high-cardinality text (IDs)
  | 'text'         // free-form text
  | 'status';      // status-like categorical values

export type BusinessConcept =
  | 'agency' | 'client' | 'employee' | 'status' | 'amount'
  | 'quantity' | 'date' | 'product' | 'category' | 'identifier' | 'unknown';

export interface UniversalColumn {
  rawName: string;
  normalizedName: string;
  index: number;
  universalType: UniversalColumnType;
  businessConcept: BusinessConcept;
  cardinality: number;
  fillRate: number;
  totalRows: number;
  samples: string[];
  // Numeric stats
  sum?: number;
  mean?: number;
  min?: number;
  max?: number;
  median?: number;
  // Frequency table for categorical/status
  topValues?: { value: string; count: number }[];
}

export interface RecommendedChart {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'table';
  title: string;
  xColumn: string;
  yColumn?: string;
  priority: number;
  reason: string;
}

export interface UniversalDatasetProfile {
  rows: number;
  columns: number;
  datasetType: string;
  dimensions: UniversalColumn[];   // categorical, text
  measures: UniversalColumn[];     // numeric, currency, percentage
  dates: UniversalColumn[];        // date columns
  booleans: UniversalColumn[];     // boolean columns
  statuses: UniversalColumn[];     // status-like categoricals
  identifiers: UniversalColumn[];  // high-cardinality identifiers
  allColumns: UniversalColumn[];
  quality: {
    score: number;
    completeness: number;          // % of cells filled (0-100)
    duplicateRows: number;
    missingValueRate: number;      // 0-1
    anomalies: string[];
  };
  recommendedCharts: RecommendedChart[];
  rawData: Record<string, string>[];
}

// ─── Normalisation ────────────────────────────────────────────────────────────

function normalize(str: string): string {
  return String(str || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// ─── Type detection ───────────────────────────────────────────────────────────

const DATE_PATTERNS = [
  /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/,
  /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/,
  /^\d{1,2}\s+\w{3,}\s+\d{4}$/i,
];

const BOOL_VALUES = new Set([
  'oui', 'non', 'yes', 'no', 'true', 'false', '1', '0',
  'vrai', 'faux', 'actif', 'inactif', 'active', 'inactive',
]);

const STATUS_KEYWORDS = new Set([
  'ok', 'ko', 'annulé', 'annule', 'cancel', 'blocage', 'bloque',
  'planifié', 'planifie', 'installé', 'installe', 'attente', 'pending',
  'done', 'completed', 'refusé', 'refuse', 'validé', 'valide',
  'en cours', 'termine', 'nouveau', 'ouvert', 'fermé', 'ferme',
  'traité', 'traite', 'en attente', 'approuvé', 'approuve', 'rejeté',
  'rejete', 'actif', 'inactif', 'draft', 'published', 'archived',
]);

const CURRENCY_MARKERS = /[€$£¥MAD\sDH]/i;
const NUMERIC_CORE = /^-?[\d\s.,]+$/;

function isDateVal(v: string): boolean {
  return v.length >= 6 && DATE_PATTERNS.some(p => p.test(v.trim()));
}
function isCurrencyVal(v: string): boolean {
  return CURRENCY_MARKERS.test(v) && NUMERIC_CORE.test(v.replace(CURRENCY_MARKERS, '').trim());
}
function isPctVal(v: string): boolean {
  return v.trim().endsWith('%') && NUMERIC_CORE.test(v.trim().slice(0, -1));
}
function isNumericVal(v: string): boolean {
  return NUMERIC_CORE.test(v.replace(/[€$£¥MADDHd%\s]/gi, '').trim()) && v.trim().length > 0;
}

function parseNum(v: string): number {
  return parseFloat(v.replace(/[€$£¥MADDHd%\s,]/gi, '').replace(',', '.')) || 0;
}

function detectColType(
  values: string[],
  cardinality: number,
  totalRows: number,
): UniversalColumnType {
  const nonEmpty = values.filter(v => v.trim().length > 0);
  if (nonEmpty.length === 0) return 'text';
  const s = nonEmpty.slice(0, 150);
  const n = s.length;

  if (s.filter(isDateVal).length / n > 0.50) return 'date';
  if (s.filter(isPctVal).length / n > 0.60) return 'percentage';
  if (s.filter(isCurrencyVal).length / n > 0.50) return 'currency';
  if (s.filter(isNumericVal).length / n > 0.70) return 'numeric';
  if (s.filter(v => BOOL_VALUES.has(v.toLowerCase().trim())).length / n > 0.75) return 'boolean';

  const statusHits = s.filter(v => {
    const lv = v.toLowerCase().trim();
    return STATUS_KEYWORDS.has(lv) || Array.from(STATUS_KEYWORDS).some(k => lv.includes(k));
  }).length;
  if (statusHits / n > 0.25 || (cardinality <= 12 && statusHits > 0)) return 'status';

  if (cardinality > Math.min(totalRows * 0.8, 300)) return 'identifier';
  if (cardinality <= 50) return 'categorical';
  return 'text';
}

// ─── Business concept mapping ─────────────────────────────────────────────────

const CONCEPT_MAP: { concept: BusinessConcept; tokens: string[] }[] = [
  { concept: 'agency',   tokens: ['agence', 'agenc', 'agency', 'centre', 'site', 'succursale', 'filiale', 'bureau', 'region', 'secteur', 'zone'] },
  { concept: 'client',   tokens: ['client', 'abonne', 'nom', 'customer', 'subscriber', 'beneficiaire', 'demandeur', 'compte', 'adherent'] },
  { concept: 'employee', tokens: ['technicien', 'agent', 'employe', 'operateur', 'equipe', 'team', 'planneur', 'staff', 'personnel', 'collaborateur'] },
  { concept: 'status',   tokens: ['statut', 'etat', 'status', 'state', 'situation', 'result', 'resultat', 'avancement'] },
  { concept: 'amount',   tokens: ['montant', 'amount', 'valeur', 'value', 'prix', 'price', 'cout', 'cost', 'total', 'revenue', 'ca', 'chiffre', 'remuneration', 'salaire'] },
  { concept: 'quantity', tokens: ['quantite', 'qte', 'quantity', 'qty', 'nombre', 'count', 'nbre', 'nb', 'volume'] },
  { concept: 'date',     tokens: ['date', 'datetime', 'heure', 'time', 'planif', 'creation', 'naissance', 'expiration', 'echeance'] },
  { concept: 'product',  tokens: ['produit', 'product', 'article', 'offre', 'forfait', 'service', 'type_offre', 'debit', 'reference', 'sku'] },
  { concept: 'category', tokens: ['categorie', 'category', 'type', 'classe', 'famille', 'groupe', 'ville', 'pays', 'departement', 'libelle'] },
  { concept: 'identifier', tokens: ['id', 'sip', 'reference', 'numero', 'code', 'matricule', 'cni', 'cin', 'serial'] },
];

function detectBusinessConcept(normalizedName: string, type: UniversalColumnType): BusinessConcept {
  if (type === 'date') return 'date';
  if (type === 'identifier') return 'identifier';
  for (const { concept, tokens } of CONCEPT_MAP) {
    if (tokens.some(t => normalizedName === t || normalizedName.includes(t) || t.includes(normalizedName))) {
      return concept;
    }
  }
  if (['numeric', 'currency', 'percentage'].includes(type)) return 'amount';
  if (type === 'status') return 'status';
  if (type === 'categorical') return 'category';
  return 'unknown';
}

// ─── Numeric statistics ───────────────────────────────────────────────────────

function numericStats(values: string[]): Pick<UniversalColumn, 'sum' | 'mean' | 'min' | 'max' | 'median'> {
  const nums = values.map(parseNum).filter(n => !isNaN(n) && isFinite(n));
  if (!nums.length) return {};
  nums.sort((a, b) => a - b);
  const sum = nums.reduce((a, b) => a + b, 0);
  const mid = Math.floor(nums.length / 2);
  const median = nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
  return { sum, mean: sum / nums.length, min: nums[0], max: nums[nums.length - 1], median };
}

// ─── Top values ───────────────────────────────────────────────────────────────

function topValues(values: string[], limit = 15): { value: string; count: number }[] {
  const c: Record<string, number> = {};
  for (const v of values) { const k = v.trim(); if (k) c[k] = (c[k] || 0) + 1; }
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([value, count]) => ({ value, count }));
}

// ─── Dataset type detection ───────────────────────────────────────────────────

function detectDatasetType(cols: UniversalColumn[]): string {
  const names = cols.map(c => c.normalizedName);
  const concepts = new Set(cols.map(c => c.businessConcept));

  if (names.some(n => n.includes('sip') || n.includes('ftth') || n.includes('fibre') || n.includes('raccordement'))) return 'Installations FTTH';
  if (names.some(n => n.includes('installation') || n.includes('technicien'))) return 'Données Techniques';
  if (names.some(n => n.includes('salaire') || n.includes('conge') || n.includes('rh') || n.includes('employe'))) return 'Données RH';
  if (names.some(n => n.includes('facture') || n.includes('commande') || n.includes('bon_livraison'))) return 'Données Commerciales';
  if (names.some(n => n.includes('comptab') || n.includes('budget') || n.includes('tresorerie'))) return 'Données Financières';
  if (concepts.has('amount') && concepts.has('client')) return 'Données Commerciales';
  if (concepts.has('status') && concepts.has('date')) return 'Données de Suivi';
  if (concepts.has('amount') && concepts.has('date')) return 'Données Transactionnelles';
  if (concepts.has('employee') && concepts.has('date')) return 'Données Opérationnelles';
  return 'Données Génériques';
}

// ─── Chart recommendations ────────────────────────────────────────────────────

function recommendCharts(
  dimensions: UniversalColumn[],
  measures: UniversalColumn[],
  dates: UniversalColumn[],
  statuses: UniversalColumn[],
  rows: number,
): RecommendedChart[] {
  const out: RecommendedChart[] = [];
  let idx = 0;
  const id = () => `uchart-${++idx}`;

  // Date + numeric → line
  for (const d of dates.slice(0, 1)) {
    for (const m of measures.slice(0, 2)) {
      out.push({ id: id(), type: 'line', priority: 10,
        title: `Évolution de ${m.rawName}`,
        xColumn: d.rawName, yColumn: m.rawName,
        reason: `Colonne date "${d.rawName}" × mesure "${m.rawName}"` });
    }
  }

  // Status → pie
  for (const s of statuses.slice(0, 2)) {
    out.push({ id: id(), type: 'pie', priority: 9,
      title: `Répartition ${s.rawName}`,
      xColumn: s.rawName,
      reason: `Colonne statut avec ${s.cardinality} valeurs distinctes` });
  }

  // Categorical + numeric → bar
  for (const dim of dimensions.filter(d => d.cardinality <= 30).slice(0, 3)) {
    for (const m of measures.slice(0, 2)) {
      out.push({ id: id(), type: 'bar', priority: dim.cardinality <= 10 ? 8 : 6,
        title: `${m.rawName} par ${dim.rawName}`,
        xColumn: dim.rawName, yColumn: m.rawName,
        reason: `Dimension "${dim.rawName}" (${dim.cardinality} val.) × "${m.rawName}"` });
      if (out.length >= 7) break;
    }
    if (out.length >= 7) break;
  }

  // Categorical (low card) → pie
  for (const dim of dimensions.filter(d => d.cardinality >= 2 && d.cardinality <= 8).slice(0, 1)) {
    if (!statuses.some(s => s.rawName === dim.rawName)) {
      out.push({ id: id(), type: 'pie', priority: 5,
        title: `Répartition ${dim.rawName}`,
        xColumn: dim.rawName,
        reason: `Faible cardinalité (${dim.cardinality} valeurs)` });
    }
  }

  // Numeric histogram
  for (const m of measures.slice(0, 1)) {
    out.push({ id: id(), type: 'histogram', priority: 4,
      title: `Distribution de ${m.rawName}`,
      xColumn: m.rawName,
      reason: `Distribution statistique de "${m.rawName}"` });
  }

  // Scatter (two numeric)
  if (measures.length >= 2 && rows >= 10) {
    out.push({ id: id(), type: 'scatter', priority: 3,
      title: `${measures[0].rawName} vs ${measures[1].rawName}`,
      xColumn: measures[0].rawName, yColumn: measures[1].rawName,
      reason: `Deux colonnes numériques → corrélation` });
  }

  // Always add table
  out.push({ id: id(), type: 'table', priority: 1,
    title: 'Tableau de données',
    xColumn: '',
    reason: 'Vue tabulaire complète' });

  return out.sort((a, b) => b.priority - a.priority).slice(0, 8);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function profileDataset(
  headers: string[],
  rows: string[][],
): UniversalDatasetProfile {
  const n = rows.length;

  if (n === 0 || headers.length === 0) {
    return {
      rows: 0, columns: 0, datasetType: 'Vide',
      dimensions: [], measures: [], dates: [], booleans: [], statuses: [], identifiers: [],
      allColumns: [], quality: { score: 0, completeness: 0, duplicateRows: 0, missingValueRate: 1, anomalies: ['Fichier vide ou aucune donnée détectée'] },
      recommendedCharts: [], rawData: [],
    };
  }

  // Build typed raw data
  const rawData: Record<string, string>[] = rows.map(row =>
    Object.fromEntries(headers.map((h, i) => [h, String(row[i] ?? '').trim()]))
  );

  // Profile each column
  const allColumns: UniversalColumn[] = headers.map((rawName, colIdx) => {
    const values = rows.map(row => String(row[colIdx] ?? '').trim());
    const nonEmpty = values.filter(v => v.length > 0);
    const unique = new Set(nonEmpty);
    const cardinality = unique.size;
    const fillRate = n > 0 ? nonEmpty.length / n : 0;
    const normalizedName = normalize(rawName);
    const universalType = detectColType(values, cardinality, n);
    const businessConcept = detectBusinessConcept(normalizedName, universalType);
    const samples = Array.from(unique).slice(0, 5);

    const col: UniversalColumn = {
      rawName, normalizedName, index: colIdx,
      universalType, businessConcept,
      cardinality, fillRate, totalRows: n, samples,
    };

    if (['numeric', 'currency', 'percentage'].includes(universalType)) {
      Object.assign(col, numericStats(nonEmpty));
    }
    if (['categorical', 'status', 'boolean'].includes(universalType) || cardinality <= 40) {
      col.topValues = topValues(nonEmpty);
    }

    return col;
  });

  const dimensions  = allColumns.filter(c => ['categorical', 'text'].includes(c.universalType));
  const measures    = allColumns.filter(c => ['numeric', 'currency', 'percentage'].includes(c.universalType));
  const dates       = allColumns.filter(c => c.universalType === 'date');
  const booleans    = allColumns.filter(c => c.universalType === 'boolean');
  const statuses    = allColumns.filter(c => c.universalType === 'status');
  const identifiers = allColumns.filter(c => c.universalType === 'identifier');

  // Quality metrics
  const totalCells = n * headers.length;
  const missingCells = allColumns.reduce((s, c) => s + n - Math.round(c.fillRate * n), 0);
  const missingValueRate = totalCells > 0 ? missingCells / totalCells : 0;

  const rowSet = new Set<string>();
  let duplicateRows = 0;
  for (const row of rows) {
    const key = row.join('║');
    if (rowSet.has(key)) duplicateRows++;
    else rowSet.add(key);
  }

  const anomalies: string[] = [];
  if (missingValueRate > 0.25) anomalies.push(`Taux élevé de valeurs manquantes : ${(missingValueRate * 100).toFixed(1)}%`);
  if (duplicateRows > 0) anomalies.push(`${duplicateRows} ligne(s) dupliquée(s) détectée(s)`);
  if (measures.length === 0) anomalies.push('Aucune colonne numérique détectée — KPIs limités');
  allColumns.filter(c => c.fillRate < 0.5 && c.fillRate > 0).forEach(c => {
    anomalies.push(`"${c.rawName}" : taux de remplissage faible (${(c.fillRate * 100).toFixed(0)}%)`);
  });

  let score = 100;
  score -= Math.round(missingValueRate * 35);
  score -= Math.min(15, duplicateRows);
  score -= anomalies.length * 2;
  score = Math.max(10, Math.min(100, score));

  return {
    rows: n, columns: headers.length,
    datasetType: detectDatasetType(allColumns),
    dimensions, measures, dates, booleans, statuses, identifiers,
    allColumns,
    quality: {
      score,
      completeness: Math.round((1 - missingValueRate) * 100),
      duplicateRows,
      missingValueRate,
      anomalies,
    },
    recommendedCharts: recommendCharts(dimensions, measures, dates, statuses, n),
    rawData,
  };
}
