import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { CanonicalRecord, DataCapabilities, DataProfile } from '@/types/dashboard';
import type { SchemaDetectionResult } from '@/lib/schemaDetector';
import type { UniversalDatasetProfile } from '@/lib/universalProfiler';
import type { CanonicalField } from '@/config/fieldMappings';
import { FIELD_DEFINITIONS } from '@/config/fieldMappings';
import { uploadToStorage, saveFileMeta } from '@/lib/uploadService';
import type { WorkerResponse } from '@/workers/excelParser.worker';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WizardResult {
  canonical:        CanonicalRecord[];
  schema:           SchemaDetectionResult;
  caps:             DataCapabilities;
  profile:          DataProfile;
  universalProfile: UniversalDatasetProfile;
  fileName:         string;
  supabasePath:     string | null;
}

interface Props {
  userId?:    string | null;
  onComplete: (result: WizardResult) => void;
}

type Step = 1 | 2 | 3 | 4;

interface ParseResult {
  canonical:        CanonicalRecord[];
  schema:           SchemaDetectionResult;
  caps:             DataCapabilities;
  profile:          DataProfile;
  universalProfile: UniversalDatasetProfile;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT  = '#6c5ce6';
const MAX_MB  = 20;
const ALLOWED = ['.xlsx', '.xls', '.csv'];

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ['Upload', 'Analyse', 'Mapping', 'Aperçu'];

function StepBar({ current }: { current: Step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
      {STEP_LABELS.map((label, i) => {
        const n    = (i + 1) as Step;
        const done = current > n;
        const active = current === n;
        const color = done ? '#16a06f' : active ? ACCENT : '#c4c8d8';
        const bg    = done ? '#e4f7ef' : active ? hexA(ACCENT, .12) : '#f4f5f8';
        return (
          <React.Fragment key={n}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: bg, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color, transition: 'all .3s' }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: .5, whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: current > n ? '#16a06f' : '#e8eaef', margin: '0 6px', marginBottom: 22, transition: 'background .3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Toast / inline error ─────────────────────────────────────────────────────

function ErrorBanner({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fdecec', border: '1px solid #fac8c8', borderRadius: 12, padding: '11px 14px', marginBottom: 14 }}>
      <span style={{ fontSize: 16 }}>⚠️</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#c0392b' }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#c0392b', lineHeight: 1 }}>×</button>
    </div>
  );
}

// ─── UploadWizard ─────────────────────────────────────────────────────────────

export function UploadWizard({ userId, onComplete }: Props) {
  const [step,           setStep]          = useState<Step>(1);
  const [dragging,       setDragging]      = useState(false);
  const [file,           setFile]          = useState<File | null>(null);
  const [uploadPct,      setUploadPct]     = useState(0);
  const [parseStep,      setParseStep]     = useState('');
  const [parseResult,    setParseResult]   = useState<ParseResult | null>(null);
  const [manualMappings, setManualMappings]= useState<Partial<Record<string, CanonicalField>>>({});
  const [supabasePath,   setSupabasePath]  = useState<string | null>(null);
  const [error,          setError]         = useState<string | null>(null);
  const [confirming,     setConfirming]    = useState(false);

  const fileRef   = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  // Instantiate worker once
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../../workers/excelParser.worker.ts', import.meta.url),
      { type: 'module' },
    );
    workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        setParseStep(msg.step);
      } else if (msg.type === 'done') {
        setParseResult(msg.result as ParseResult);
        // Skip mapping step if no unmapped columns
        const hasUnmapped = msg.result.schema.unmappedColumns.length > 0;
        setStep(hasUnmapped ? 3 : 4);
      } else if (msg.type === 'error') {
        setError(`Erreur de parsing : ${msg.message}`);
        setStep(1);
      }
    };
    return () => { workerRef.current?.terminate(); };
  }, []);

  // ── File validation ──
  const validateFile = (f: File): string | null => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED.includes(ext)) return `Format non supporté. Utilisez ${ALLOWED.join(', ')}`;
    if (f.size > MAX_MB * 1024 * 1024) return `Fichier trop volumineux (max ${MAX_MB} Mo)`;
    return null;
  };

  // ── Start the wizard with a file ──
  const startWithFile = useCallback(async (f: File) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }

    setError(null);
    setFile(f);
    setStep(2);
    setUploadPct(5);
    setParseStep('Envoi vers le cloud…');

    // 1. Upload to Supabase (non-blocking on failure)
    const path = await uploadToStorage(f, userId ?? null, (pct) =>
      setUploadPct(Math.round(5 + pct * 0.6)),
    );
    setSupabasePath(path);
    setUploadPct(70);
    setParseStep('Lecture du fichier…');

    // 2. Read as ArrayBuffer then send to worker
    const buffer = await f.arrayBuffer();
    setUploadPct(85);
    // Transfer ownership to worker (zero-copy)
    workerRef.current?.postMessage({ buffer, fileName: f.name }, [buffer]);
  }, [userId]);

  // ── Drop handlers ──
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()                   => setDragging(false);
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) startWithFile(f);
  };
  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) startWithFile(f);
    e.target.value = '';
  };

  // ── Confirm: save metadata + call parent ──
  const handleConfirm = async () => {
    if (!parseResult || !file) return;
    setConfirming(true);
    const kpisCalc = parseResult.canonical.length;
    await saveFileMeta({
      user_id:       userId ?? null,
      file_name:     file.name,
      file_path:     supabasePath ?? '',
      file_size:     file.size,
      record_count:  kpisCalc,
      quality_score: parseResult.profile.qualityScore,
      taux:          0,
      team_count:    new Set(parseResult.canonical.filter(r => r.team).map(r => r.team)).size,
      warnings:      parseResult.schema.warnings,
      unmapped_cols: parseResult.schema.unmappedColumns,
    });
    setConfirming(false);
    onComplete({
      ...parseResult,
      fileName:     file.name,
      supabasePath: supabasePath,
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 6px 24px rgba(30,35,60,.07)',
    padding: '28px 28px 24px',
  };

  return (
    <div style={card}>
      <StepBar current={step} />

      {error && <ErrorBanner msg={error} onClose={() => setError(null)} />}

      {/* ══ STEP 1 — UPLOAD ══════════════════════════════════════════════ */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1d2030' }}>Importer un fichier</div>
            <div style={{ fontSize: 13, color: '#9398a8', marginTop: 4 }}>Excel (.xlsx, .xls) ou CSV — max {MAX_MB} Mo</div>
          </div>

          <input ref={fileRef} type="file" accept={ALLOWED.join(',')} onChange={onFileInput} style={{ display: 'none' }} />

          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${dragging ? ACCENT : '#d0cff0'}`,
              borderRadius: 16,
              background: dragging ? hexA(ACCENT, .04) : '#fafafd',
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all .2s',
              boxShadow: dragging ? `0 0 0 4px ${hexA(ACCENT, .1)}` : undefined,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>📁</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1d2030', marginBottom: 6 }}>
              Glissez votre fichier ici
            </div>
            <div style={{ fontSize: 12.5, color: '#9398a8', marginBottom: 20 }}>
              ou cliquez pour parcourir
            </div>
            <div style={{ display: 'inline-block', background: ACCENT, color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 24px', borderRadius: 12, boxShadow: `0 4px 14px ${hexA(ACCENT, .35)}` }}>
              Choisir un fichier
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {[{ icon: '🔒', text: 'Fichier chiffré en transit' }, { icon: '☁️', text: 'Sauvegardé dans le cloud' }, { icon: '⚡', text: 'Analyse automatique des colonnes' }].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f4f5f8', borderRadius: 8, padding: '5px 10px', fontSize: 11.5, color: '#6c7184', fontWeight: 600 }}>
                <span>{item.icon}</span> {item.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ STEP 2 — ANALYSE ═════════════════════════════════════════════ */}
      {step === 2 && (
        <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🔬</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1d2030', marginBottom: 6 }}>
            Analyse en cours…
          </div>
          <div style={{ fontSize: 13, color: '#9398a8', marginBottom: 28 }}>{parseStep || 'Initialisation…'}</div>

          {/* Progress bar */}
          <div style={{ height: 8, background: '#f0f1f5', borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{
              height: '100%',
              width: `${uploadPct}%`,
              background: `linear-gradient(90deg, ${ACCENT}, #a29bfe)`,
              borderRadius: 8,
              transition: 'width .4s ease',
            }} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{uploadPct}%</div>

          {file && (
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: hexA(ACCENT, .1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1d2030' }}>{file.name}</div>
                <div style={{ fontSize: 11.5, color: '#9398a8' }}>{(file.size / 1024).toFixed(0)} Ko</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ STEP 3 — MAPPING ═════════════════════════════════════════════ */}
      {step === 3 && parseResult && (
        <div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1d2030' }}>Colonnes non reconnues</div>
            <div style={{ fontSize: 13, color: '#9398a8', marginTop: 4 }}>
              Assignez manuellement les colonnes que l'analyse n'a pas pu identifier, ou ignorez-les.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {parseResult.schema.unmappedColumns.map(col => (
              <div key={col} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center', background: '#fafafd', border: '1px solid #eeeff4', borderRadius: 12, padding: '12px 14px' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1d2030' }}>{col}</div>
                  <div style={{ fontSize: 11, color: '#9398a8', marginTop: 2 }}>Colonne non reconnue</div>
                </div>
                <select
                  value={manualMappings[col] || ''}
                  onChange={e => {
                    const val = e.target.value as CanonicalField | '';
                    setManualMappings(prev => {
                      const next = { ...prev };
                      if (val) next[col] = val; else delete next[col];
                      return next;
                    });
                  }}
                  style={{ border: '1.5px solid #e2e4ec', borderRadius: 9, padding: '7px 10px', fontSize: 13, color: '#1d2030', background: '#fff', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">— Ignorer —</option>
                  {FIELD_DEFINITIONS.map(f => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Detected columns */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>
              Colonnes reconnues automatiquement
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {parseResult.schema.sheets.flatMap(s =>
                s.detectedColumns.filter(c => c.canonicalField).map(c => (
                  <div key={c.raw} style={{ background: '#e4f7ef', color: '#16a06f', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
                    ✓ {c.raw}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setStep(4)}
            style={{ width: '100%', padding: '12px', borderRadius: 13, background: ACCENT, color: '#fff', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 14px ${hexA(ACCENT, .35)}` }}
          >
            Continuer →
          </button>
        </div>
      )}

      {/* ══ STEP 4 — APERÇU ══════════════════════════════════════════════ */}
      {step === 4 && parseResult && file && (
        <div>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Lignes',    value: parseResult.canonical.length, icon: '📝', color: '#0984e3' },
              { label: 'Colonnes', value: parseResult.schema.sheets[0]?.detectedColumns.length ?? 0, icon: '📊', color: ACCENT },
              { label: 'Qualité',  value: `${parseResult.profile.qualityScore}/100`, icon: '✅', color: parseResult.profile.qualityScore >= 70 ? '#16a06f' : '#d99a2b' },
              { label: 'Doublons', value: parseResult.profile.duplicateRows, icon: '🔁', color: parseResult.profile.duplicateRows > 0 ? '#e17055' : '#16a06f' },
            ].map(s => (
              <div key={s.label} style={{ background: '#f8f9fc', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .5, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Warnings */}
          {parseResult.schema.warnings.length > 0 && (
            <div style={{ background: '#fdf6e3', border: '1px solid #f5e07a', borderRadius: 11, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#b8860b', marginBottom: 4 }}>⚠️ {parseResult.schema.warnings.length} avertissement(s)</div>
              {parseResult.schema.warnings.slice(0, 3).map((w, i) => (
                <div key={i} style={{ fontSize: 12, color: '#7a6a1f', marginTop: 2 }}>• {w}</div>
              ))}
            </div>
          )}

          {/* Cloud badge */}
          {supabasePath ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#e4f7ef', borderRadius: 9, padding: '7px 12px', marginBottom: 16, fontSize: 12.5, fontWeight: 700, color: '#16a06f' }}>
              ☁️ Sauvegardé dans le cloud — {file.name}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fdf3e3', borderRadius: 9, padding: '7px 12px', marginBottom: 16, fontSize: 12.5, fontWeight: 600, color: '#d99a2b' }}>
              ⚠️ Sauvegarde cloud indisponible — fichier chargé localement uniquement
            </div>
          )}

          {/* Preview table */}
          <div style={{ border: '1px solid #eef0f4', borderRadius: 12, overflow: 'hidden', marginBottom: 22 }}>
            <div style={{ padding: '10px 14px', background: '#f8f9fc', borderBottom: '1px solid #eef0f4', fontSize: 11.5, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .5 }}>
              Aperçu — 10 premières lignes
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#fafbfc' }}>
                    {(['client', 'team', 'offer', 'raw_status', 'planned_date', 'installation_date'] as const).map(k => (
                      <th key={k} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#9398a8', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: .5, whiteSpace: 'nowrap', borderBottom: '1px solid #eef0f4' }}>
                        {k.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parseResult.canonical.slice(0, 10).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f8' }}>
                      {(['client', 'team', 'offer', 'raw_status', 'planned_date', 'installation_date'] as const).map(k => (
                        <td key={k} style={{ padding: '8px 12px', color: '#1d2030', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row[k] || <span style={{ color: '#c2c6d2' }}>—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { setStep(1); setFile(null); setParseResult(null); setUploadPct(0); setSupabasePath(null); }}
              style={{ flex: 1, padding: '12px', borderRadius: 13, background: '#f4f5f8', color: '#6c7184', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              ← Recommencer
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              style={{ flex: 2, padding: '12px', borderRadius: 13, background: confirming ? '#a29bfe' : ACCENT, color: '#fff', border: 'none', fontSize: 14, fontWeight: 800, cursor: confirming ? 'default' : 'pointer', boxShadow: `0 4px 14px ${hexA(ACCENT, .35)}` }}
            >
              {confirming ? '⏳ Chargement…' : '✓ Charger dans le dashboard'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
