import * as XLSX from 'xlsx';
import { FIELD_DEFINITIONS, ALIAS_TO_FIELD } from '@/config/fieldMappings';
import type { CanonicalField } from '@/config/fieldMappings';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ColumnInfo {
  raw: string;                     // original header text from Excel
  normalized: string;              // after normalization
  canonicalField: CanonicalField | null;
  colIndex: number;
  sampleValues: string[];
  missingCount: number;
  fillRate: number;                // 0-1
  inferredType: 'text' | 'date' | 'number' | 'status';
}

export interface SheetInfo {
  name: string;
  rowCount: number;
  headerRowIndex: number;
  detectedColumns: ColumnInfo[];
}

export interface SchemaDetectionResult {
  sheets: SheetInfo[];
  // canonical field → normalized column name (first sheet to provide each wins)
  mappings: Partial<Record<CanonicalField, string>>;
  // canonical field → column index per sheet (for extraction)
  columnIndices: Partial<Record<CanonicalField, number>>;
  unmappedColumns: string[];   // normalized names with no canonical mapping
  totalRows: number;
  warnings: string[];
  suggestedMappings: { column: string; possibleField: string }[];
}

export interface RawRecord {
  // All column values keyed by normalized column name
  [normalizedCol: string]: string;
}

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * Convert any raw Excel column header into a stable, comparable key.
 *
 * "DATE D'INSTALLATION" → "date_dinstallation"
 * "EQUIPE OGIF"         → "equipe_ogif"
 * "Nom Client"          → "nom_client"
 */
export function normalizeColumnName(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    // Decompose accented chars (é → e + combining accent) then strip combining marks
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // Drop anything that isn't a letter, digit or whitespace
    .replace(/[^a-z0-9\s]/g, '')
    // Collapse whitespace runs into a single underscore
    .replace(/\s+/g, '_')
    // Collapse multiple underscores
    .replace(/_+/g, '_')
    // Trim leading / trailing underscores
    .replace(/^_+|_+$/g, '');
}

// ─── Type inference ────────────────────────────────────────────────────────────

const DATE_RE    = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$|^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/;
const NUMBER_RE  = /^\d+(\.\d+)?$/;
const STATUS_WORDS = new Set(['ok', 'blocage', 'annule', 'planifie', 'installe', 'attente', 'non', 'installed', 'blocked', 'cancelled']);

function inferType(values: string[]): ColumnInfo['inferredType'] {
  const nE = values.filter(v => v.trim());
  if (!nE.length) return 'text';
  const dateCount   = nE.filter(v => DATE_RE.test(v.trim())).length;
  const numCount    = nE.filter(v => NUMBER_RE.test(v.trim())).length;
  const statusCount = nE.filter(v => STATUS_WORDS.has(v.trim().toLowerCase())).length;
  const total = nE.length;
  if (dateCount / total   > 0.5) return 'date';
  if (numCount / total    > 0.7) return 'number';
  if (statusCount / total > 0.4) return 'status';
  return 'text';
}

// ─── Header-row detection ─────────────────────────────────────────────────────

// Broad set of keywords that indicate a header row
const HEADER_HINTS = [
  'nom', 'client', 'equipe', 'etat', 'statut', 'date', 'planif',
  'install', 'debit', 'offre', 'sip', 'comm', 'technicien', 'semaine',
  'routeur', 'type', 'sous', 'agent', 'state', 'status', 'team',
];

function findHeaderRow(rows: string[][]): number {
  // Score each of the first 10 rows and pick the best
  let bestRow = 0;
  let bestScore = -1;

  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    const nonEmpty = row.filter(c => String(c || '').trim()).length;
    if (nonEmpty < 2) continue;

    const normalized = row.map(c => normalizeColumnName(String(c || '')));
    let score = 0;
    // Points for each cell matching a header hint
    normalized.forEach(n => {
      if (HEADER_HINTS.some(h => n === h || n.startsWith(h))) score += 2;
      if (n && n.length > 1) score += 0.5; // non-trivial cell content
    });
    // Bonus for having many non-empty cells
    score += nonEmpty * 0.3;

    if (score > bestScore) { bestScore = score; bestRow = i; }
  }
  return bestRow;
}

// ─── Alias matching ────────────────────────────────────────────────────────────

function matchCanonicalField(normalized: string): CanonicalField | null {
  // 1. Exact alias match
  if (ALIAS_TO_FIELD.has(normalized)) return ALIAS_TO_FIELD.get(normalized)!;

  // 2. Prefix / contains match (lower confidence — avoids short-string false positives)
  if (normalized.length < 3) return null;
  for (const def of FIELD_DEFINITIONS) {
    for (const alias of def.aliases) {
      if (alias.length < 3) continue;
      if (normalized === alias || normalized.startsWith(alias + '_') || alias.startsWith(normalized + '_')) {
        return def.key;
      }
    }
  }

  // 3. Substring match as last resort
  for (const def of FIELD_DEFINITIONS) {
    for (const alias of def.aliases) {
      if (alias.length < 4) continue;
      if (normalized.includes(alias) || alias.includes(normalized)) {
        return def.key;
      }
    }
  }

  return null;
}

// ─── Fuzzy suggestions for unmapped columns ───────────────────────────────────

function suggestField(normalized: string): string | null {
  let bestDist = Infinity;
  let bestField: string | null = null;

  for (const def of FIELD_DEFINITIONS) {
    for (const alias of def.aliases) {
      // Cheap Hamming-style similarity on prefix
      const minLen = Math.min(alias.length, normalized.length);
      let diff = Math.abs(alias.length - normalized.length);
      for (let i = 0; i < minLen; i++) {
        if (alias[i] !== normalized[i]) diff++;
      }
      if (diff < bestDist && diff < 4) {
        bestDist = diff;
        bestField = def.label;
      }
    }
  }
  return bestField;
}

// ─── Main detection entry point ───────────────────────────────────────────────

export function detectSchema(buffer: ArrayBuffer): SchemaDetectionResult {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false });

  const sheets: SheetInfo[] = [];
  const globalMappings: Partial<Record<CanonicalField, string>> = {};
  const globalIndices:  Partial<Record<CanonicalField, number>> = {};
  const warnings: string[] = [];
  const suggestedMappings: { column: string; possibleField: string }[] = [];
  const unmappedSet = new Set<string>();
  let totalRows = 0;

  wb.SheetNames.forEach(sheetName => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;

    const rows = XLSX.utils.sheet_to_json<string[]>(ws, {
      header: 1, raw: false, defval: '',
    }) as string[][];

    if (!rows.length) {
      warnings.push(`Feuille "${sheetName}" ignorée : vide.`);
      return;
    }

    const headerRowIndex = findHeaderRow(rows);
    const headerRow      = rows[headerRowIndex];
    const dataRows       = rows.slice(headerRowIndex + 1).filter(r => r.some(c => String(c).trim()));

    if (!dataRows.length) {
      warnings.push(`Feuille "${sheetName}" ignorée : aucune ligne de données après l'en-tête.`);
      return;
    }

    const columns: ColumnInfo[] = headerRow
      .map((rawHeader, colIdx) => {
        const raw = String(rawHeader || '').trim();
        if (!raw) return null;

        const normalized    = normalizeColumnName(raw);
        const canonicalField = matchCanonicalField(normalized);
        const sampleValues  = dataRows.slice(0, 20).map(r => String(r[colIdx] || '').trim());
        const nonEmpty      = sampleValues.filter(Boolean);
        const missingCount  = dataRows.filter(r => !String(r[colIdx] || '').trim()).length;

        return {
          raw,
          normalized,
          canonicalField,
          colIndex: colIdx,
          sampleValues: nonEmpty.slice(0, 5),
          missingCount,
          fillRate: dataRows.length ? 1 - missingCount / dataRows.length : 1,
          inferredType: inferType(sampleValues),
        } as ColumnInfo;
      })
      .filter((c): c is ColumnInfo => c !== null);

    // Populate global mappings (first sheet providing each canonical field wins)
    columns.forEach(col => {
      if (col.canonicalField && !globalMappings[col.canonicalField]) {
        globalMappings[col.canonicalField] = col.normalized;
        globalIndices[col.canonicalField]  = col.colIndex;
      }
      if (!col.canonicalField) {
        unmappedSet.add(col.normalized);
        const suggestion = suggestField(col.normalized);
        if (suggestion) {
          suggestedMappings.push({ column: col.normalized, possibleField: suggestion });
        }
      }
    });

    totalRows += dataRows.length;

    sheets.push({
      name: sheetName,
      rowCount: dataRows.length,
      headerRowIndex,
      detectedColumns: columns,
    });
  });

  // Warn if required fields missing
  FIELD_DEFINITIONS.filter(f => f.required && !globalMappings[f.key]).forEach(f => {
    warnings.push(
      `Champ requis "${f.label}" non détecté. Aliases attendus : ${f.aliases.slice(0, 4).join(', ')}.`
    );
  });

  // Deduplicate unmapped (remove those that ended up mapped via another sheet)
  const canonicalNormNames = new Set(Object.values(globalMappings));
  const unmappedColumns = [...unmappedSet].filter(n => !canonicalNormNames.has(n));

  if (unmappedColumns.length) {
    warnings.push(
      `${unmappedColumns.length} colonne(s) non mappée(s) : ${unmappedColumns.slice(0, 8).join(', ')}${unmappedColumns.length > 8 ? '…' : ''}`
    );
  }

  return { sheets, mappings: globalMappings, columnIndices: globalIndices, unmappedColumns, totalRows, warnings, suggestedMappings };
}

// ─── Record extraction ────────────────────────────────────────────────────────

/**
 * Extract all data rows from the workbook using the detected schema.
 * Returns raw records where every key is a normalized column name,
 * plus special `_cf_<canonicalField>` keys for easy canonical access.
 */
export function extractRawRecords(buffer: ArrayBuffer, schema: SchemaDetectionResult): RawRecord[] {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false });
  const all: RawRecord[] = [];

  schema.sheets.forEach(sheetInfo => {
    const ws = wb.Sheets[sheetInfo.name];
    if (!ws) return;

    const rows = XLSX.utils.sheet_to_json<string[]>(ws, {
      header: 1, raw: false, defval: '',
    }) as string[][];

    const headerRow = rows[sheetInfo.headerRowIndex];

    // Build normalized-name → col-index for THIS sheet
    const normToIdx: Record<string, number> = {};
    headerRow.forEach((raw, idx) => {
      const norm = normalizeColumnName(String(raw || ''));
      if (norm) normToIdx[norm] = idx;
    });

    const dataRows = rows.slice(sheetInfo.headerRowIndex + 1);

    dataRows.forEach(row => {
      if (!row.some(c => String(c).trim())) return;

      const record: RawRecord = {};

      // All columns by normalized name
      Object.entries(normToIdx).forEach(([norm, idx]) => {
        record[norm] = String(row[idx] || '').trim();
      });

      // Canonical field shortcuts (prefixed to avoid collision)
      (Object.entries(schema.mappings) as [CanonicalField, string][]).forEach(([canon, normName]) => {
        if (normName && normToIdx[normName] !== undefined) {
          record[`_cf_${canon}`] = String(row[normToIdx[normName]] || '').trim();
        }
      });

      all.push(record);
    });
  });

  return all;
}

// ─── Universal raw extraction (for any Excel file) ───────────────────────────

/**
 * Extract headers and data rows from the first sheet of a workbook,
 * preserving all columns regardless of FTTH field mappings.
 * Used by the universal profiler to analyze any Excel file.
 */
export function extractRawSheetData(buffer: ArrayBuffer): { headers: string[]; rows: string[][] } {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return { headers: [], rows: [] };

  const ws = wb.Sheets[sheetName];
  const allRows = XLSX.utils.sheet_to_json<string[]>(ws, {
    header: 1, raw: false, defval: '',
  }) as string[][];

  if (!allRows.length) return { headers: [], rows: [] };

  const headerRowIdx = findHeaderRow(allRows);
  const rawHeader = allRows[headerRowIdx];

  // Keep only columns that have a non-empty header
  const colIndices: number[] = [];
  const headers: string[] = [];
  rawHeader.forEach((h, i) => {
    const trimmed = String(h || '').trim();
    if (trimmed.length > 0) {
      colIndices.push(i);
      headers.push(trimmed);
    }
  });

  const rows = allRows
    .slice(headerRowIdx + 1)
    .filter(row => row.some(c => String(c || '').trim().length > 0))
    .map(row => colIndices.map(i => String(row[i] ?? '').trim()));

  return { headers, rows };
}

// ─── Default "virtual" schema for demo data ───────────────────────────────────
// This lets the demo data flow through the same processing pipeline as real files.

export const DEFAULT_SCHEMA: SchemaDetectionResult = {
  sheets: [{ name: 'Données démo', rowCount: 50, headerRowIndex: 0, detectedColumns: [] }],
  mappings: {
    client:            'nom',
    team:              'equipe',
    status:            'etat',
    planned_date:      'planif',
    installation_date: 'date_installation',
    offer:             'debit',
    sip:               'sip',
    comment:           'comm',
  },
  columnIndices: {},
  unmappedColumns: [],
  totalRows: 50,
  warnings: [],
  suggestedMappings: [],
};
