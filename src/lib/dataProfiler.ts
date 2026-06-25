import type { SchemaDetectionResult } from '@/lib/schemaDetector';
import type { CanonicalRecord, DataProfile, DataCapabilities } from '@/types/dashboard';
import type { CanonicalField } from '@/config/fieldMappings';
import { FIELD_DEFINITIONS } from '@/config/fieldMappings';

// ─── Quality score weights ────────────────────────────────────────────────────

const WEIGHTS = {
  hasClientField:     25,  // required field present
  fillRateClient:     15,  // % of non-empty client values
  hasDates:           15,  // at least one date field
  hasStatus:          10,  // status field present
  hasTeam:            10,  // team field present
  lowDuplicates:      10,  // deducted for high duplicate rate
  lowMissing:         10,  // deducted for high missing rate
  multipleFields:      5,  // having 5+ mapped fields
};

// ─── Main profiler ────────────────────────────────────────────────────────────

export function profileData(
  records: CanonicalRecord[],
  schema: SchemaDetectionResult,
  fileName: string,
): DataProfile {
  const total = records.length;
  const warnings: string[] = [...schema.warnings];

  // ── Duplicate detection ──
  const seen = new Set<string>();
  let duplicates = 0;
  records.forEach(r => {
    const key = `${r.client?.toLowerCase().trim()}|${r.sip?.toLowerCase().trim()}`.replace(/\s+/g, '');
    if (key === '|' || key === '') return; // skip blank keys
    if (seen.has(key)) duplicates++;
    else seen.add(key);
  });

  if (duplicates > 0) {
    warnings.push(`${duplicates} ligne(s) dupliquée(s) détectée(s) et supprimée(s) lors du traitement.`);
  }

  // ── Missing values per canonical field ──
  const canonicalFields: CanonicalField[] = FIELD_DEFINITIONS.map(f => f.key);
  const missingValues: Partial<Record<CanonicalField, number>> = {};
  const fillRates: Partial<Record<CanonicalField, number>> = {};

  canonicalFields.forEach(field => {
    if (!schema.mappings[field]) return;
    const missing = records.filter(r => !r[field]).length;
    missingValues[field] = missing;
    fillRates[field] = total ? 1 - missing / total : 1;

    if (total > 0 && missing / total > 0.3) {
      const def = FIELD_DEFINITIONS.find(f => f.key === field);
      warnings.push(
        `Champ "${def?.label || field}" : ${Math.round((missing / total) * 100)}% de valeurs manquantes (${missing}/${total}).`
      );
    }
  });

  // ── Type validation ──
  const dateRE = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/;
  const invalidDates: string[] = [];
  if (schema.mappings.planned_date) {
    records.forEach(r => {
      if (r.planned_date && !dateRE.test(r.planned_date.trim())) {
        invalidDates.push(r.planned_date);
      }
    });
  }
  if (invalidDates.length) {
    warnings.push(`${invalidDates.length} date(s) de planification au format non reconnu.`);
  }

  // ── Anomaly detection ──
  const mappedCount = Object.keys(schema.mappings).length;
  const detectedCols = schema.sheets.reduce((acc, s) => acc + s.detectedColumns.length, 0);
  const unmappedCount = schema.unmappedColumns.length;

  if (unmappedCount > 0) {
    warnings.push(
      `${unmappedCount} colonne(s) non reconnue(s) ignorée(s) dans l'analyse.`
    );
  }

  // ── Quality score (0–100) ──
  let score = 0;

  if (schema.mappings.client)             score += WEIGHTS.hasClientField;
  if (total > 0 && (fillRates.client ?? 0) > 0.9) score += WEIGHTS.fillRateClient;
  else if (total > 0)                     score += Math.round(WEIGHTS.fillRateClient * (fillRates.client ?? 0));

  if (schema.mappings.planned_date || schema.mappings.installation_date) score += WEIGHTS.hasDates;
  if (schema.mappings.status)             score += WEIGHTS.hasStatus;
  if (schema.mappings.team)               score += WEIGHTS.hasTeam;
  if (mappedCount >= 5)                   score += WEIGHTS.multipleFields;

  // Penalty for duplicates
  const dupRate = total ? duplicates / total : 0;
  score -= Math.round(WEIGHTS.lowDuplicates * dupRate);

  // Penalty for missing values on key fields
  const avgMissing = (['client', 'status'] as CanonicalField[])
    .map(f => (schema.mappings[f] ? (missingValues[f] ?? 0) / Math.max(total, 1) : 0))
    .reduce((a, b) => a + b, 0) / 2;
  score -= Math.round(WEIGHTS.lowMissing * avgMissing);

  score = Math.max(0, Math.min(100, score));

  return {
    fileName,
    totalRows:         total,
    validRows:         total - duplicates,
    duplicateRows:     duplicates,
    sheetCount:        schema.sheets.length,
    detectedColumns:   detectedCols,
    mappedColumns:     mappedCount,
    unmappedColumns:   unmappedCount,
    missingValues,
    fillRates,
    warnings,
    qualityScore:      score,
  };
}

// ─── Capabilities ─────────────────────────────────────────────────────────────

export function computeCapabilities(schema: SchemaDetectionResult): DataCapabilities {
  const m = schema.mappings;
  const hasPlannedDate   = !!m.planned_date;
  const hasInstallDate   = !!m.installation_date;
  const hasTeam          = !!m.team;

  return {
    hasClient:         !!m.client,
    hasTeam,
    hasStatus:         !!m.status,
    hasPlannedDate,
    hasInstallDate,
    hasOffer:          !!m.offer,
    hasSIP:            !!m.sip,
    hasComment:        !!m.comment,
    hasPlanner:        !!m.planner,
    hasSubType:        !!m.sub_type,
    hasRouter:         !!m.router,
    hasDateData:       hasPlannedDate || hasInstallDate,
    hasTimeSeriesData: hasInstallDate,
    hasDelayAnalysis:  hasPlannedDate && hasInstallDate,
    hasTeamAnalysis:   hasTeam,
  };
}
