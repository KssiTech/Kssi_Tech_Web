import React from 'react';
import type { Filters } from '@/types/dashboard';
import type { ProcessedRecord } from '@/types/dashboard';
import { equipeShort, debitNum } from '@/hooks/useExcelData';
import { STATUS_META } from '@/types/dashboard';

interface FiltersBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  records: ProcessedRecord[];
}

const sel: React.CSSProperties = {
  border: '1.5px solid #e8eaf0',
  borderRadius: 10,
  padding: '7px 12px',
  fontSize: 12.5,
  fontWeight: 600,
  color: '#3a3f52',
  background: '#fff',
  cursor: 'pointer',
  outline: 'none',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%239398a8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
  paddingRight: 28,
  minWidth: 110,
};

const inp: React.CSSProperties = {
  border: '1.5px solid #e8eaf0',
  borderRadius: 10,
  padding: '7px 12px 7px 34px',
  fontSize: 12.5,
  fontWeight: 500,
  color: '#3a3f52',
  background: '#fff',
  outline: 'none',
  minWidth: 180,
};

export const FiltersBar: React.FC<FiltersBarProps> = ({ filters, onChange, records }) => {
  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    onChange({ ...filters, [k]: e.target.value });

  const teams    = [...new Set(records.map(r => r._teamName).filter(n => n && n !== '—'))].sort();
  const debits   = [...new Set(records.map(r => r._debitNum).filter(Boolean))].sort((a, b) => (a as number) - (b as number)) as number[];
  const sousTypes = [...new Set(records.map(r => r.sousType).filter(Boolean))].sort();
  const planneurs = [...new Set(records.map(r => r.planneur).filter(Boolean))].sort();
  const weeks    = [...new Set(records.map(r => r._week).filter(Boolean))].sort((a, b) => (a as number) - (b as number)) as number[];
  const months   = [...new Set(records.map(r => r._month).filter(Boolean))].sort((a, b) => (a as number) - (b as number)) as number[];
  const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => {
    if (k === 'searchText') return v !== '';
    return v !== '' && v !== 'all';
  });

  const reset = () => onChange({
    dateFrom: '', dateTo: '', team: 'all', status: 'all', debit: 'all',
    sousType: 'all', planneur: 'all', searchText: '', week: 'all', month: 'all',
  });

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 14px rgba(30,35,60,.06)',
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      marginBottom: 20,
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#b6bac6', pointerEvents: 'none' }}>🔍</span>
        <input
          style={inp}
          placeholder="Rechercher client, SIP…"
          value={filters.searchText}
          onChange={set('searchText')}
        />
      </div>

      <div style={{ width: 1, height: 24, background: '#e8eaf0', flexShrink: 0 }} />

      {/* Date range */}
      <input
        type="date"
        style={{ ...sel, paddingRight: 12, backgroundImage: 'none', minWidth: 130, color: filters.dateFrom ? '#3a3f52' : '#b6bac6' }}
        value={filters.dateFrom}
        onChange={set('dateFrom')}
        title="Date de début"
      />
      <span style={{ fontSize: 12, color: '#b6bac6', fontWeight: 600 }}>→</span>
      <input
        type="date"
        style={{ ...sel, paddingRight: 12, backgroundImage: 'none', minWidth: 130, color: filters.dateTo ? '#3a3f52' : '#b6bac6' }}
        value={filters.dateTo}
        onChange={set('dateTo')}
        title="Date de fin"
      />

      <div style={{ width: 1, height: 24, background: '#e8eaf0', flexShrink: 0 }} />

      {/* Team */}
      <select style={sel} value={filters.team} onChange={set('team')}>
        <option value="all">Toutes équipes</option>
        {teams.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Status */}
      <select style={sel} value={filters.status} onChange={set('status')}>
        <option value="all">Tous statuts</option>
        {(Object.entries(STATUS_META) as [string, { label: string }][]).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </select>

      {/* Debit */}
      <select style={sel} value={filters.debit} onChange={set('debit')}>
        <option value="all">Tous débits</option>
        {debits.map(d => <option key={d} value={String(d)}>{d} Méga</option>)}
      </select>

      {/* Week */}
      {weeks.length > 1 && (
        <select style={sel} value={filters.week} onChange={set('week')}>
          <option value="all">Toutes semaines</option>
          {weeks.map(w => <option key={w} value={String(w)}>S{w}</option>)}
        </select>
      )}

      {/* Month */}
      {months.length > 1 && (
        <select style={sel} value={filters.month} onChange={set('month')}>
          <option value="all">Tous mois</option>
          {months.map(m => <option key={m} value={String(m)}>{MONTH_NAMES[m - 1]}</option>)}
        </select>
      )}

      {/* Sous type */}
      {sousTypes.length > 0 && (
        <select style={sel} value={filters.sousType} onChange={set('sousType')}>
          <option value="all">Tous types</option>
          {sousTypes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      )}

      {/* Planneur */}
      {planneurs.length > 0 && (
        <select style={sel} value={filters.planneur} onChange={set('planneur')}>
          <option value="all">Tous planneurs</option>
          {planneurs.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      )}

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={reset}
          style={{
            border: 'none', background: '#fdecec', color: '#e0564f',
            fontSize: 12.5, fontWeight: 700, padding: '7px 14px',
            borderRadius: 10, cursor: 'pointer', flexShrink: 0,
          }}
        >
          ✕ Réinitialiser
        </button>
      )}

      {hasActiveFilters && (
        <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#6c5ce6', background: '#eceafe', padding: '5px 12px', borderRadius: 8 }}>
          Filtres actifs
        </div>
      )}
    </div>
  );
};

export default FiltersBar;
