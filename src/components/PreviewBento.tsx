import React from 'react';

export const PreviewBento: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-[#E2DDD3] w-full h-full bg-[#F5F2EB]">
      {/* Module 01: Activity Over Time */}
      <div className="p-4 sm:p-6 lg:p-7 border-b md:border-b-0 md:border-r border-[#E2DDD3] flex flex-col justify-between h-full relative overflow-hidden group bg-[#F5F2EB] hover:bg-[#FAF8F5] transition-colors">
        <div className="space-y-1 relative z-10 shrink-0">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#78716C] block">
            Module 01 · Timeline
          </span>
          <h3 className="font-serif text-base sm:text-lg font-normal text-[#1C1917] tracking-tight">
            Activity Over Time
          </h3>
          <p className="text-[11px] font-serif italic text-[#78716C]">
            Monthly message rhythms & spikes.
          </p>
        </div>
        <div className="flex-1 min-h-0 flex items-end gap-2 sm:gap-2.5 mt-3 relative z-10">
          {[35, 60, 30, 85, 95, 70, 45].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full w-full transition-all duration-300 ${
                i === 4
                  ? 'bg-[#EA580C] group-hover:bg-[#C2410C]'
                  : i === 3
                  ? 'bg-[#15803D] group-hover:bg-[#166534]'
                  : 'bg-[#1C1917] group-hover:bg-[#3E3A36]'
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Module 02: Network / Bonds */}
      <div className="p-4 sm:p-6 lg:p-7 border-b md:border-b-0 md:border-r border-[#E2DDD3] flex flex-col justify-between h-full relative overflow-hidden group bg-[#F5F2EB] hover:bg-[#FAF8F5] transition-colors">
        <div className="space-y-1 relative z-10 shrink-0">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#78716C] block">
            Module 02 · Relational Topology
          </span>
          <h3 className="font-serif text-base sm:text-lg font-normal text-[#1C1917] tracking-tight">
            Who Talks to Whom
          </h3>
          <p className="text-[11px] font-serif italic text-[#78716C]">
            Interactive bond strength & response speeds.
          </p>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center mt-3 relative z-10">
          <svg className="w-full h-full max-h-[85px]" viewBox="0 0 100 40">
            <line x1="18" y1="20" x2="50" y2="10" stroke="#1C1917" strokeWidth="2.5" />
            <line x1="50" y1="10" x2="82" y2="24" stroke="#15803D" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="18" y1="20" x2="82" y2="24" stroke="#D5CDBC" strokeWidth="1.5" />
            <line x1="50" y1="10" x2="50" y2="34" stroke="#D5CDBC" strokeWidth="1" />
            <circle cx="18" cy="20" r="5" fill="#1C1917" />
            <circle cx="50" cy="10" r="6" fill="#15803D" />
            <circle cx="82" cy="24" r="4.5" fill="#1C1917" />
            <circle cx="50" cy="34" r="4" fill="#78716C" />
          </svg>
        </div>
      </div>

      {/* Module 03: Superlatives */}
      <div className="p-4 sm:p-6 lg:p-7 flex flex-col justify-between h-full relative overflow-hidden group bg-[#F5F2EB] hover:bg-[#FAF8F5] transition-colors">
        <div className="space-y-1 relative z-10 shrink-0">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#78716C] block">
            Module 03 · Roles
          </span>
          <h3 className="font-serif text-base sm:text-lg font-normal text-[#1C1917] tracking-tight">
            Chat Superlatives
          </h3>
          <p className="text-[11px] font-serif italic text-[#78716C]">
            Algorithmic archetype awards.
          </p>
        </div>
        <div className="flex-1 min-h-0 flex flex-col justify-center space-y-2 mt-2 relative z-10">
          <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3]">
            <span className="text-xs font-serif text-[#1C1917]">Conversation Catalyst</span>
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E7F3EC] text-[#15803D] font-bold border border-[#CDE5D5]">
              Initiator
            </span>
          </div>
          <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3]">
            <span className="text-xs font-serif text-[#1C1917]">The Night Owl</span>
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4338CA] font-bold border border-[#C7D2FE]">
              Late
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
