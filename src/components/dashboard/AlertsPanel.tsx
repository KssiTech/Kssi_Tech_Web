import React, { useState } from 'react';
import type { Alert } from '@/types/dashboard';

interface AlertsPanelProps {
  alerts: Alert[];
}

const ICON: Record<Alert['type'], string> = {
  error:   '🔴',
  warning: '🟡',
  info:    '🔵',
};

const COLOR: Record<Alert['type'], { bg: string; border: string; color: string; badge: string; badgeBg: string }> = {
  error:   { bg: '#fff8f8', border: '#fde8e8', color: '#e0564f', badge: '#fff', badgeBg: '#e0564f' },
  warning: { bg: '#fffdf4', border: '#fef3c7', color: '#d99a2b', badge: '#fff', badgeBg: '#d99a2b' },
  info:    { bg: '#f0f7ff', border: '#dbeafe', color: '#5b8def', badge: '#fff', badgeBg: '#5b8def' },
};

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!alerts.length) {
    return (
      <div style={{
        background: '#f0fff8', borderRadius: 20, padding: '20px 24px',
        border: '1.5px solid #b7f5da', display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ fontSize: 28 }}>✅</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#16a06f' }}>Aucune alerte</div>
          <div style={{ fontSize: 12.5, color: '#5b9b7a', fontWeight: 500, marginTop: 2 }}>
            Toutes les métriques sont dans les normes.
          </div>
        </div>
      </div>
    );
  }

  const errors   = alerts.filter(a => a.type === 'error').length;
  const warnings = alerts.filter(a => a.type === 'warning').length;

  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      boxShadow: '0 6px 20px rgba(30,35,60,.05)', padding: '20px 22px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -.2, color: '#1d2030' }}>
            Alertes & Anomalies
          </div>
          <div style={{ fontSize: 12, color: '#9398a8', fontWeight: 500, marginTop: 2 }}>
            Détection automatique
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {errors > 0 && (
            <span style={{ fontSize: 11.5, fontWeight: 700, background: '#fdecec', color: '#e0564f', padding: '3px 10px', borderRadius: 8 }}>
              {errors} critique{errors > 1 ? 's' : ''}
            </span>
          )}
          {warnings > 0 && (
            <span style={{ fontSize: 11.5, fontWeight: 700, background: '#fdf3e3', color: '#d99a2b', padding: '3px 10px', borderRadius: 8 }}>
              {warnings} attention{warnings > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Alert list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {alerts.map((alert, i) => {
          const c = COLOR[alert.type];
          const isOpen = expanded === i;
          return (
            <div
              key={i}
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{
                background: c.bg, border: `1.5px solid ${c.border}`,
                borderRadius: 14, padding: '12px 16px',
                cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 14px ${c.border}`}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{ICON[alert.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1d2030' }}>{alert.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {alert.count > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 700, background: c.badgeBg, color: c.badge, padding: '2px 8px', borderRadius: 6 }}>
                          {alert.count}
                        </span>
                      )}
                      <span style={{ fontSize: 14, color: '#b6bac6', transition: 'transform .2s', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'none' }}>›</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#6c7184', marginTop: 3, fontWeight: 500 }}>{alert.message}</div>

                  {isOpen && alert.items.length > 0 && (
                    <div style={{ marginTop: 10, borderTop: `1px solid ${c.border}`, paddingTop: 10 }}>
                      {alert.items.map((item, j) => (
                        <div key={j} style={{ fontSize: 12, color: '#4a4f63', fontWeight: 600, marginBottom: 4, paddingLeft: 8, borderLeft: `2px solid ${c.color}` }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsPanel;
