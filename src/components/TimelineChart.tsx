import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TimelineDataPoint } from '../types/chat';

interface TimelineChartProps {
  timeline: TimelineDataPoint[];
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 w-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Chat Activity Over Time
          </h3>
          <p className="text-xs text-zinc-400">
            Monthly message volume across the conversation span
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 text-[11px] font-mono text-brand-emerald">
          {timeline.length} Months
        </div>
      </div>

      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-card-elevated rounded-xl p-3 text-xs border border-white/10 shadow-xl">
                      <p className="font-mono text-zinc-400 mb-1">{label}</p>
                      <p className="font-bold text-white text-sm">
                        {payload[0].value?.toLocaleString()} messages
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
