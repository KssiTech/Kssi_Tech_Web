import React from 'react';
import type { Insight } from '@/types/dashboard';

const TYPE_STYLE: Record<Insight['type'], { bg: string; border: string; valueBg: string; valueColor: string }> = {
  success: { bg: '#f0fff8', border: '#b7f5da', valueBg: '#e4f7ef', valueColor: '#16a06f' },
  warning: { bg: '#fffdf0', border: '#fef3c7', valueBg: '#fdf3e3', valueColor: '#d99a2b' },
  error:   { bg: '#fff8f8', border: '#fde8e8', valueBg: '#fdecec', valueColor: '#e0564f' },
  info:    { bg: '#f0f7ff', border: '#dbeafe', valueBg: '#e8f0fd', valueColor: '#5b8def' },
};

interface InsightCardsProps {
  insights: Insight[];
}

export const InsightCards: React.FC<InsightCardsProps> = ({ insights }) => {
  if (!insights.length) return null;

  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      boxShadow: '0 6px 20px rgba(30,35,60,.05)', padding: '20px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(108,92,230,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
          🧠
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -.2, color: '#1d2030' }}>Insights IA</div>
          <div style={{ fontSize: 12, color: '#9398a8', fontWeight: 500 }}>Générés automatiquement depuis vos données</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {insights.map((insight, i) => {
          const s = TYPE_STYLE[insight.type];
          return (
            <div key={i} style={{
              background: s.bg, border: `1.5px solid ${s.border}`,
              borderRadius: 14, padding: '14px 16px',
              transition: 'transform .15s, box-shadow .15s',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = `0 8px 20px ${s.border}`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{insight.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1d2030' }}>{insight.title}</span>
                </div>
                {insight.value && (
                  <span style={{
                    fontSize: 13, fontWeight: 800, color: s.valueColor,
                    background: s.valueBg, padding: '3px 10px', borderRadius: 8,
                    flexShrink: 0,
                  }}>
                    {insight.value}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12.5, color: '#4a4f63', fontWeight: 500, lineHeight: 1.55, margin: 0 }}>
                {insight.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightCards;
