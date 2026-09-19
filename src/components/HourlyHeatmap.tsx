import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { HourlyDistribution } from '../types/chat';

interface HourlyHeatmapProps {
  data: HourlyDistribution[];
}

export const HourlyHeatmap: React.FC<HourlyHeatmapProps> = ({ data }) => {
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 w-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            24-Hour Activity Clock
          </h3>
          <p className="text-xs text-zinc-400">
            Peak chatting times during day vs. night
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          Hourly Distribution
        </span>
      </div>

      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as HourlyDistribution;
                  const isLateNight = item.hour >= 0 && item.hour < 5;
                  return (
                    <div className="glass-card-elevated rounded-xl p-3 text-xs border border-white/10 shadow-xl">
                      <p className="font-mono text-zinc-400 mb-1">{item.label}</p>
                      <p className="font-bold text-white text-sm">
                        {item.count.toLocaleString()} messages
                      </p>
                      {isLateNight && (
                        <p className="text-[10px] font-semibold text-amber-400 mt-1">
                          🦉 Late-Night Hours
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry) => {
                const isLateNight = entry.hour >= 0 && entry.hour < 5;
                const isPeakAfternoon = entry.hour >= 18 && entry.hour <= 22;
                let color = '#3b82f6';
                if (isLateNight) color = '#f59e0b';
                else if (isPeakAfternoon) color = '#10b981';
                return <Cell key={`cell-${entry.hour}`} fill={color} fillOpacity={0.85} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 pt-3 border-t border-white/5 text-xs text-zinc-400">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
          <span>Late Night (12am-5am)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-emerald"></span>
          <span>Evening Peak</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
          <span>Daytime</span>
        </div>
      </div>
    </div>
  );
};
