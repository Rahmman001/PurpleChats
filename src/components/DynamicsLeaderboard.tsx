import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { ParticipantSummary } from '../types/chat';
import { resolveSenderName } from '../utils/phoneHandler';

interface DynamicsLeaderboardProps {
  participants: ParticipantSummary[];
}

export const DynamicsLeaderboard: React.FC<DynamicsLeaderboardProps> = ({ participants }) => {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const displayLimit = 6;
  const isLarge = participants.length > displayLimit;

  // Filtered by search if query exists
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants;
    const q = searchQuery.toLowerCase().trim();
    return participants.filter(
      (p) =>
        resolveSenderName(p.name).toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q)
    );
  }, [participants, searchQuery]);

  const visibleParticipants =
    searchQuery.trim().length > 0
      ? filteredParticipants
      : showAll || !isLarge
      ? participants
      : participants.slice(0, displayLimit);

  // Responsive column count based on participant count
  const gridColsClass =
    visibleParticipants.length === 1
      ? 'grid-cols-1 max-w-md mx-auto'
      : visibleParticipants.length === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="rounded-3xl bg-[#F5F2EB] border border-[#E7E2D8] p-6 sm:p-8 w-full shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      {/* Header Section with comfortable margins and padding */}
      <div className="mb-6 pb-4 border-b border-[#E2DDD3] flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#78716C] block">
            Section 02 · Contribution & Pacing
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1917] tracking-tight">
            Conversational Rhythms
          </h3>
          <p className="text-xs sm:text-sm font-serif italic text-[#78716C]">
            Message share, average response speed, and who kicks off conversations.
          </p>
        </div>

        {isLarge && (
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Search Filter for Large Groups */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter members..."
                className="bg-[#EFECE6] border border-[#E2DDD3] text-xs font-mono text-[#1C1917] placeholder-[#78716C] pl-8 pr-7 py-1 rounded-full focus:outline-none focus:border-[#1C1917]/40 w-36 sm:w-44 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] p-0.5 rounded cursor-pointer"
                  title="Clear filter"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <span className="text-[10px] font-mono text-[#78716C] bg-[#EFECE6] px-3 py-1 rounded-full border border-[#E2DDD3]">
              {visibleParticipants.length} of {participants.length} members
            </span>
          </div>
        )}
      </div>

      {/* Grid of Member Cards with generous gap and padding */}
      <div className={`grid ${gridColsClass} gap-4 sm:gap-5`}>
        {visibleParticipants.map((p, idx) => {
          const isInstantReplier = p.medianResponseMinutes > 0 && p.medianResponseMinutes <= 2.0;
          const isGhoster = p.medianResponseMinutes >= 20.0;
          const formattedName = resolveSenderName(p.name);

          return (
            <div
              key={p.name}
              className="rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] p-4 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:border-[#D5CDBC] hover:shadow-sm"
            >
              <div>
                {/* Header with Rank Pill */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EA580C] text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                    RANK 0{idx + 1}
                  </span>
                  <span className="text-sm font-mono font-semibold text-[#1C1917]">
                    {p.percentage}%
                  </span>
                </div>

                {/* Name */}
                <h4 className="font-serif text-base sm:text-lg font-normal text-[#1C1917] truncate mb-1">
                  {formattedName}
                </h4>

                <p className="text-xs font-mono text-[#78716C] mb-3.5">
                  {p.messageCount.toLocaleString()} messages sent
                </p>

                {/* Progress bar */}
                <div className="w-full bg-[#E2DDD3] h-1.5 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-[#1C1917] transition-all duration-500"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
              </div>

              {/* 3-column stats inset panel with balanced padding and margins */}
              <div className="rounded-xl bg-[#FAF7F2] border border-[#E2DDD3]/70 p-2.5 sm:p-3 mb-4">
                <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-[#78716C] block mb-1">
                      Reply Time
                    </span>
                    <span
                      className={`font-mono text-xs font-semibold ${
                        isInstantReplier
                          ? 'text-[#15803D]'
                          : isGhoster
                          ? 'text-[#B91C1C]'
                          : 'text-[#1C1917]'
                      }`}
                    >
                      {p.medianResponseMinutes > 0 ? `${p.medianResponseMinutes}m` : '< 1m'}
                    </span>
                  </div>

                  <div className="border-x border-[#E2DDD3]/70 px-0.5 sm:px-1">
                    <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-[#78716C] block mb-1">
                      Started
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#1C1917]">
                      {p.initiationCount}
                    </span>
                  </div>

                  <div>
                    <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-[#78716C] block mb-1">
                      Follow-ups
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#1C1917]">
                      {p.doubleTextCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Attribution Chips */}
              <div className="flex items-center justify-between pt-1">
                {p.badges && p.badges.length > 0 ? (
                  <span className="inline-block text-[9px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF7F2] text-[#1C1917] border border-[#E2DDD3]">
                    {p.badges[0].title}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-[#78716C]">Contributor</span>
                )}

                <span className="text-[9px] font-mono text-[#78716C] border border-[#1C1917]/20 px-2.5 py-0.5 rounded-full">
                  Awarded
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {visibleParticipants.length === 0 && (
        <div className="py-12 text-center">
          <p className="font-serif italic text-[#78716C] text-sm">
            No participants found matching "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-3 text-xs font-mono text-[#1C1917] bg-[#EFECE6] px-4 py-1.5 rounded-full border border-[#E2DDD3] hover:bg-[#EAE5DB] transition-colors cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}

      {isLarge && !searchQuery && (
        <div className="mt-6 pt-4 border-t border-[#E2DDD3] flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-mono text-[#1C1917] bg-[#EFECE6] hover:bg-[#EAE5DB] px-5 py-2 rounded-full border border-[#E2DDD3] transition-colors cursor-pointer"
          >
            {showAll ? `Show Top ${displayLimit} Only` : `Show All ${participants.length} Participants`}
          </button>
        </div>
      )}
    </div>
  );
};
