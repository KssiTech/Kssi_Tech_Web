import React, { useState } from 'react';
import type { DataProfile, DataCapabilities } from '@/types/dashboard';
import type { SchemaDetectionResult } from '@/lib/schemaDetector';
import { FIELD_BY_KEY } from '@/config/fieldMappings';
import type { CanonicalField } from '@/config/fieldMappings';

interface SchemaPanelProps {
  schema:  SchemaDetectionResult;
  profile: DataProfile;
  caps:    DataCapabilities;
  onClose?: () => void;
}

const QUALITY_COLOR = (score: number) =>
  score >= 80 ? '#16a06f' : score >= 55 ? '#d99a2b' : '#e0564f';
const QUALITY_BG = (score: number) =>
  score >= 80 ? '#e4f7ef' : score >= 55 ? '#fdf3e3' : '#fdecec';
const QUALITY_LABEL = (score: number) =>
  score >= 80 ? 'Excellent' : score >= 55 ? 'Acceptable' : 'À améliorer';

const TAG: React.FC<{ text: string; color: string; bg: string }> = ({ text, color, bg }) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 6, display: 'inline-block' }}>
    {text}
  </span>
);

export const SchemaPanel: React.FC<SchemaPanelProps> = ({ schema, profile, caps, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'columns' | 'warnings'>('overview');

  const mappedFields = Object.entries(schema.mappings) as [CanonicalField, string][];
  const hasWarnings  = profile.warnings.length > 0;

  const TabBtn: React.FC<{ id: typeof activeTab; label: string; badge?: number }> = ({ id, label, badge }) => (
    <div onClick={() => setActiveTab(id)}
      style={{
        padding: '7px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
        background: activeTab === id ? '#6c5ce6' : 'transparent',
        color: activeTab === id ? '#fff' : '#6c7184',
        display: 'flex', alignItems: 'center', gap: 6, userSelect: 'none', transition: 'all .15s',
      }}>
      {label}
      {badge !== undefined && badge > 0 && (
        <span style={{ fontSize: 10, fontWeight: 700, background: activeTab === id ? 'rgba(255,255,255,.25)' : '#f3f4f8', color: activeTab === id ? '#fff' : '#9398a8', padding: '1px 6px', borderRadius: 6 }}>
          {badge}
        </span>
      )}
    </div>
  );

  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      boxShadow: '0 8px 32px rgba(30,35,60,.10)',
      padding: '22px 24px', position: 'relative',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: QUALITY_BG(profile.qualityScore), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            🔬
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -.2, color: '#1d2030' }}>Analyse du fichier</div>
            <div style={{ fontSize: 12, color: '#9398a8', fontWeight: 500, marginTop: 2 }}>
              {profile.fileName} · {schema.sheets.length} feuille{schema.sheets.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Quality score badge */}
          <div style={{
            background: QUALITY_BG(profile.qualityScore),
            borderRadius: 14, padding: '8px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: QUALITY_COLOR(profile.qualityScore), letterSpacing: -1, lineHeight: 1 }}>
              {profile.qualityScore}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: QUALITY_COLOR(profile.qualityScore), marginTop: 2 }}>
              {QUALITY_LABEL(profile.qualityScore)}
            </div>
          </div>

          {onClose && (
            <div onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: '#f4f5f8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: '#6c7184' }}>✕</div>
          )}
        </div>
      </div>

      {/* Quick stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Lignes',        value: profile.totalRows,        icon: '📋' },
          { label: 'Doublons supp.', value: profile.duplicateRows,   icon: '♻️', warn: profile.duplicateRows > 0 },
          { label: 'Colonnes mappées', value: `${profile.mappedColumns}/${profile.detectedColumns}`, icon: '🔗' },
          { label: 'Non reconnues', value: profile.unmappedColumns,   icon: '❓', warn: profile.unmappedColumns > 0 },
        ].map((s, i) => (
          <div key={i} style={{ background: s.warn ? '#fff8f8' : '#f8f9fc', borderRadius: 12, padding: '10px 12px', textAlign: 'center', border: s.warn ? '1.5px solid #fde8e8' : 'none' }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.warn ? '#e0564f' : '#1d2030' }}>{s.value}</div>
            <div style={{ fontSize: 10.5, color: '#9398a8', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Capability badges */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {[
          { key: 'hasTeam',        label: '👥 Équipe',       active: caps.hasTeam },
          { key: 'hasStatus',      label: '🏷️ Statut',       active: caps.hasStatus },
          { key: 'hasPlannedDate', label: '📅 Planification', active: caps.hasPlannedDate },
          { key: 'hasInstallDate', label: '⚡ Date install.',  active: caps.hasInstallDate },
          { key: 'hasOffer',       label: '📡 Offre/Débit',   active: caps.hasOffer },
          { key: 'hasComment',     label: '💬 Commentaires',  active: caps.hasComment },
          { key: 'hasDelayAnalysis', label: '⏱️ Délais',      active: caps.hasDelayAnalysis },
          { key: 'hasSubType',     label: '🗂️ Sous-type',     active: caps.hasSubType },
        ].map(b => (
          <span key={b.key} style={{
            fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
            background: b.active ? '#e4f7ef' : '#f1f2f6',
            color: b.active ? '#16a06f' : '#8a90a3',
            border: `1px solid ${b.active ? '#b7f5da' : '#e4e6ef'}`,
          }}>
            {b.label}
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f4f5f8', padding: 4, borderRadius: 12, marginBottom: 14 }}>
        <TabBtn id="overview"  label="Vue d'ensemble" />
        <TabBtn id="columns"   label="Colonnes" badge={mappedFields.length} />
        <TabBtn id="warnings"  label="Avertissements" badge={profile.warnings.length} />
      </div>

      {/* ── Overview tab ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Sheets */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .4, marginBottom: 4 }}>
            Feuilles détectées
          </div>
          {schema.sheets.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8f9fc', borderRadius: 10, padding: '9px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>📄</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1d2030' }}>{s.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <TAG text={`${s.rowCount} lignes`} color="#5b8def" bg="#e8f0fd" />
                <TAG text={`${s.detectedColumns.length} colonnes`} color="#9b7ce6" bg="#f3efff" />
              </div>
            </div>
          ))}

          {/* Missing values overview */}
          {mappedFields.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .4, marginTop: 6, marginBottom: 4 }}>
                Complétude des données
              </div>
              {mappedFields.map(([field, normName]) => {
                const def     = FIELD_BY_KEY.get(field);
                const fillRate = profile.fillRates[field] ?? 1;
                const pct     = Math.round(fillRate * 100);
                const color   = pct >= 90 ? '#16a06f' : pct >= 60 ? '#d99a2b' : '#e0564f';
                return (
                  <div key={field} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 110, fontSize: 12.5, fontWeight: 600, color: '#4a4f63', flexShrink: 0 }}>{def?.label || field}</div>
                    <div style={{ flex: 1, height: 6, background: '#f3f4f8', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .5s' }} />
                    </div>
                    <div style={{ width: 36, fontSize: 11.5, fontWeight: 700, color, textAlign: 'right', flexShrink: 0 }}>{pct}%</div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ── Columns tab ── */}
      {activeTab === 'columns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Mapped */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .4, marginBottom: 4 }}>
            Champs reconnus ({mappedFields.length})
          </div>
          {mappedFields.map(([canon, norm]) => {
            const def = FIELD_BY_KEY.get(canon);
            return (
              <div key={canon} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fff8', border: '1.5px solid #b7f5da', borderRadius: 10, padding: '9px 14px' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>✅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1d2030' }}>{def?.label || canon}</div>
                  <div style={{ fontSize: 11.5, color: '#9398a8', fontWeight: 500, marginTop: 1 }}>
                    Colonne : <code style={{ fontFamily: 'monospace', fontSize: 11, background: '#e8f8f2', padding: '1px 5px', borderRadius: 4 }}>{norm}</code>
                  </div>
                </div>
                <TAG text={def?.type || 'text'} color="#16a06f" bg="#e4f7ef" />
              </div>
            );
          })}

          {/* Unmapped */}
          {schema.unmappedColumns.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9398a8', textTransform: 'uppercase', letterSpacing: .4, marginTop: 8, marginBottom: 4 }}>
                Colonnes non reconnues ({schema.unmappedColumns.length})
              </div>
              {schema.unmappedColumns.map((col, i) => {
                const suggestion = schema.suggestedMappings.find(s => s.column === col);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fffdf0', border: '1.5px solid #fef3c7', borderRadius: 10, padding: '9px 14px' }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>❓</span>
                    <div style={{ flex: 1 }}>
                      <code style={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'monospace', color: '#1d2030' }}>{col}</code>
                      {suggestion && (
                        <div style={{ fontSize: 11.5, color: '#d99a2b', fontWeight: 500, marginTop: 2 }}>
                          Ressemble à : {suggestion.possibleField}
                        </div>
                      )}
                    </div>
                    <TAG text="non mappé" color="#d99a2b" bg="#fdf3e3" />
                  </div>
                );
              })}
              <div style={{ fontSize: 12, color: '#9398a8', fontWeight: 500, fontStyle: 'italic', marginTop: 4 }}>
                💡 Pour mapper ces colonnes, ajoutez leurs noms normalisés aux aliases dans <code>src/config/fieldMappings.ts</code>.
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Warnings tab ── */}
      {activeTab === 'warnings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {profile.warnings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#16a06f', fontSize: 13, fontWeight: 600 }}>
              ✅ Aucun avertissement — données de bonne qualité.
            </div>
          ) : profile.warnings.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, background: '#fffdf0', border: '1.5px solid #fef3c7', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ flexShrink: 0, fontSize: 14 }}>⚠️</span>
              <span style={{ fontSize: 12.5, color: '#4a4f63', fontWeight: 500, lineHeight: 1.5 }}>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemaPanel;
