import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon,
  accentColor = '#10b981',
}) => {
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {title}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm border border-white/10"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
        >
          {icon}
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-zinc-400 mt-1 font-sans">
            {subValue}
          </span>
        )}
      </div>

      {/* Subtle bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-40 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
};
