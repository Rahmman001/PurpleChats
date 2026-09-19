import React, { useState } from 'react';
import { HourlyDistribution } from '../types/chat';

interface HourlyHeatmapProps {
  data: HourlyDistribution[];
}

export const HourlyHeatmap: React.FC<HourlyHeatmapProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(1, ...data.map(d => d.count));
  const chartWidth = 660;
  const chartHeight = 150;
  const leftPad = 35;
  const topPad = 20;
  const slotWidth = chartWidth / 24;
  const barWidth = Math.max(4, slotWidth - 6);

  const hoveredItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="rounded-3xl bg-[#F5F2EB] border border-[#E7E2D8] p-6 sm:p-7 w-full flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div>
        <div className="mb-5 border-b border-[#E2DDD3] pb-3">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#78716C] block mb-1">
            Section 04 · Active Hours
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1917] tracking-tight">
            24-Hour Activity Clock
          </h3>
          <p className="text-xs font-serif italic text-[#78716C] mt-0.5">
            When your group is most talkative throughout the day and night.
          </p>
        </div>

        {/* Responsive Native SVG Chart */}
        <div className="relative w-full aspect-[720/220] select-none">
          <svg
            viewBox="0 0 720 220"
            className="w-full h-full overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Gridlines */}
            {[0, 0.5, 1].map((ratio) => {
              const y = topPad + chartHeight * (1 - ratio);
              const val = Math.round(maxVal * ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={leftPad}
                    y1={y}
                    x2={leftPad + chartWidth}
                    y2={y}
                    stroke="#E2DDD3"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={leftPad - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill="#78716C"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                  </text>
                </g>
              );
            })}

            {/* 24 Hourly Bars */}
            {data.map((d, i) => {
              const barH = Math.max(2, (d.count / maxVal) * chartHeight);
              const x = leftPad + i * slotWidth + (slotWidth - barWidth) / 2;
              const y = topPad + chartHeight - barH;
              const isLateNight = d.hour >= 0 && d.hour < 5;
              const isHovered = hoveredIndex === i;

              return (
                <g
                  key={d.hour}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                >
                  {/* Invisible wide hit target */}
                  <rect
                    x={leftPad + i * slotWidth}
                    y={topPad}
                    width={slotWidth}
                    height={chartHeight}
                    fill="transparent"
                  />
                  {/* Visual Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx="3"
                    ry="3"
                    fill={isLateNight ? '#EA580C' : '#1C1917'}
                    fillOpacity={isHovered ? 1 : isLateNight ? 0.85 : 0.7}
                    className="transition-all duration-150"
                  />
                  {/* X-Axis Hour Label (every 2 hours) */}
                  {i % 2 === 0 && (
                    <text
                      x={leftPad + i * slotWidth + slotWidth / 2}
                      y={topPad + chartHeight + 18}
                      textAnchor="middle"
                      fill="#78716C"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {d.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip */}
          {hoveredItem && (
            <div
              className="absolute pointer-events-none -top-2 transform -translate-x-1/2 -translate-y-full bg-[#FAF7F2] border border-[#E2DDD3] rounded-xl p-2.5 text-xs shadow-lg z-10 transition-all duration-75"
              style={{
                left: `${((leftPad + hoveredItem.hour * slotWidth + slotWidth / 2) / 720) * 100}%`,
              }}
            >
              <p className="font-mono text-[#78716C] text-[10px] mb-0.5">{hoveredItem.label}</p>
              <p className="font-serif text-sm font-semibold text-[#1C1917]">
                {hoveredItem.count.toLocaleString()} messages
              </p>
              {hoveredItem.hour >= 0 && hoveredItem.hour < 5 && (
                <span className="inline-block mt-1 text-[9px] font-mono text-[#EA580C] bg-[#EA580C]/10 px-2 py-0.5 rounded-full">
                  Late Night (Midnight – 5 AM)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E2DDD3] flex items-center justify-between text-[9px] font-mono text-[#78716C]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#1C1917]" /> Daytime
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EA580C]" /> Late Night
          </span>
        </div>
        <span className="border border-[#1C1917]/20 px-2 py-0.5 rounded-full">Daily Rhythm</span>
      </div>
    </div>
  );
};
