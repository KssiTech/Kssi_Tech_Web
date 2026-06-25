import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: number | null;       // % change vs previous period
  sparkData?: { v: number }[];
  accentColor?: string;
  bgColor?: string;
  badge?: { text: string; color: string; bg: string };
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  label, value, subtitle, trend, sparkData, accentColor = '#6c5ce6',
  bgColor, badge, loading = false,
}) => {
  const trendPositive = trend !== undefined && trend !== null && trend >= 0;
  const trendColor = trend === null || trend === undefined ? '#9398a8'
    : trend >= 0 ? '#16a06f' : '#e0564f';
  const trendBg = trend === null || trend === undefined ? '#f4f5f8'
    : trend >= 0 ? '#e4f7ef' : '#fdecec';

  if (loading) {
    return (
      <div style={{
        background: '#fff', borderRadius: 20,
        boxShadow: '0 6px 20px rgba(30,35,60,.05)', padding: '22px 24px',
        minHeight: 130,
      }}>
        <div style={{ height: 14, width: '60%', borderRadius: 6, background: '#f3f4f8', marginBottom: 16, animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: 36, width: '40%', borderRadius: 8, background: '#f3f4f8', marginBottom: 12, animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: 12, width: '80%', borderRadius: 6, background: '#f3f4f8', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  return (
    <div style={{
      background: bgColor || '#fff',
      borderRadius: 20,
      boxShadow: '0 6px 20px rgba(30,35,60,.05)',
      padding: '20px 22px',
      transition: 'box-shadow .2s, transform .2s',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 30px rgba(30,35,60,.10)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(30,35,60,.05)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#6c7184' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {badge && (
            <div style={{ fontSize: 11.5, fontWeight: 700, color: badge.color, background: badge.bg, padding: '3px 9px', borderRadius: 8 }}>
              {badge.text}
            </div>
          )}
          {trend !== undefined && trend !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: trendColor, background: trendBg, padding: '3px 8px', borderRadius: 8 }}>
              <span>{trendPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Value */}
      <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, color: accentColor !== '#6c5ce6' ? accentColor : '#1d2030', lineHeight: 1.1, marginBottom: 6 }}>
        {value}
      </div>

      {/* Subtitle + sparkline row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        {subtitle && (
          <div style={{ fontSize: 12.5, color: '#9398a8', fontWeight: 500, lineHeight: 1.4 }}>{subtitle}</div>
        )}
        {sparkData && sparkData.length > 1 && (
          <div style={{ flexShrink: 0 }}>
            <ResponsiveContainer width={72} height={28}>
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={accentColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Accent bar at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3, borderRadius: '0 0 20px 20px',
        background: `linear-gradient(90deg, ${accentColor}44, ${accentColor})`,
        opacity: 0.7,
      }} />
    </div>
  );
};

export default KPICard;
