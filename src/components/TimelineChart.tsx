import React, { useState } from 'react';
import { TimelineDataPoint } from '../types/chat';

interface TimelineChartProps {
  timeline: TimelineDataPoint[];
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ timeline }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!timeline || timeline.length === 0) return null;

  const chartWidth = 660;
  const chartHeight = 150;
  const leftPad = 35;
  const topPad = 20;
  const bottomY = topPad + chartHeight;

  const points = timeline.map((d) => {
    const val = Number(d.total ?? (d as Record<string, unknown>).count ?? 0);
    return { date: d.date, val };
  });

  const maxVal = Math.max(1, ...points.map(p => p.val));

  const coords = points.map((p, i) => {
    const x =
      points.length === 1
        ? leftPad + chartWidth / 2
        : leftPad + (i / (points.length - 1)) * chartWidth;
    const y = topPad + chartHeight - (p.val / maxVal) * chartHeight;
    return { x, y, date: p.date, val: p.val };
  });

  // Build SVG path
  let pathD = '';
  let areaD = '';
  if (coords.length === 1) {
    pathD = `M ${coords[0].x - 20} ${coords[0].y} L ${coords[0].x + 20} ${coords[0].y}`;
    areaD = `M ${coords[0].x - 20} ${coords[0].y} L ${coords[0].x + 20} ${coords[0].y} L ${coords[0].x + 20} ${bottomY} L ${coords[0].x - 20} ${bottomY} Z`;
  } else {
    // Generate smooth bezier curve
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const mx = (curr.x + next.x) / 2;
      pathD += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`;
    }
    areaD = `${pathD} L ${coords[coords.length - 1].x} ${bottomY} L ${coords[0].x} ${bottomY} Z`;
  }

  const hoveredCoord = hoveredIndex !== null ? coords[hoveredIndex] : null;

  // Choose interval for X-axis labels so they don't crowd
  const labelInterval = Math.max(1, Math.ceil(coords.length / 8));

  return (
    <div className="rounded-3xl bg-[#F5F2EB] border border-[#E7E2D8] p-6 sm:p-7 w-full flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div>
        <div className="mb-5 border-b border-[#E2DDD3] pb-3">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#78716C] block mb-1">
            Section 03 · Trajectory
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1917] tracking-tight">
            Activity Over Time
          </h3>
          <p className="text-xs font-serif italic text-[#78716C] mt-0.5">
            How your conversation volume rose and dipped month over month.
          </p>
        </div>

        {/* Native Responsive SVG Area Chart */}
        <div className="relative w-full aspect-[720/220] select-none">
          <svg
            viewBox="0 0 720 220"
            className="w-full h-full overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1C1917" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#1C1917" stopOpacity="0.0" />
              </linearGradient>
            </defs>

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

            {/* Area Fill */}
            <path d={areaD} fill="url(#areaGradient)" />

            {/* Line Stroke */}
            <path
              d={pathD}
              fill="none"
              stroke="#1C1917"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Hover Indicator & Point */}
            {hoveredCoord && (
              <g>
                <line
                  x1={hoveredCoord.x}
                  y1={topPad}
                  x2={hoveredCoord.x}
                  y2={bottomY}
                  stroke="#1C1917"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.4"
                />
                <circle
                  cx={hoveredCoord.x}
                  cy={hoveredCoord.y}
                  r="4"
                  fill="#1C1917"
                  stroke="#FAF7F2"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Interactive Hit Targets & X-Axis Labels */}
            {coords.map((c, i) => {
              const stepWidth = chartWidth / (coords.length || 1);
              const hitX = c.x - stepWidth / 2;
              const isLabelVisible = i % labelInterval === 0 || i === coords.length - 1;

              return (
                <g key={c.date} onMouseEnter={() => setHoveredIndex(i)} className="cursor-pointer">
                  <rect
                    x={Math.max(leftPad, hitX)}
                    y={topPad}
                    width={stepWidth}
                    height={chartHeight}
                    fill="transparent"
                  />
                  {isLabelVisible && (
                    <text
                      x={c.x}
                      y={bottomY + 18}
                      textAnchor="middle"
                      fill="#78716C"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {c.date}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip */}
          {hoveredCoord && (
            <div
              className="absolute pointer-events-none -top-2 transform -translate-x-1/2 -translate-y-full bg-[#FAF7F2] border border-[#E2DDD3] rounded-xl p-2.5 text-xs shadow-lg z-10 transition-all duration-75"
              style={{
                left: `${(hoveredCoord.x / 720) * 100}%`,
              }}
            >
              <p className="font-mono text-[#78716C] text-[10px] mb-0.5">{hoveredCoord.date}</p>
              <p className="font-serif text-sm font-semibold text-[#1C1917]">
                {hoveredCoord.val.toLocaleString()} messages
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E2DDD3] flex items-center justify-between text-[9px] font-mono text-[#78716C]">
        <span>Monthly trends across the archive</span>
        <span className="border border-[#1C1917]/20 px-2 py-0.5 rounded-full">Timeline</span>
      </div>
    </div>
  );
};
