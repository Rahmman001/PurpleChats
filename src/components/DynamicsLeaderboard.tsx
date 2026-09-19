import React from 'react';
import { Clock, Zap, Flame } from 'lucide-react';
import { ParticipantSummary } from '../types/chat';

interface DynamicsLeaderboardProps {
  participants: ParticipantSummary[];
}

export const DynamicsLeaderboard: React.FC<DynamicsLeaderboardProps> = ({ participants }) => {
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 w-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Conversational Dynamics & Ghosting
          </h3>
          <p className="text-xs text-zinc-400">
            Real behavioral patterns behind response times and chat initiations
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          Behavioral Leaderboard
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {participants.map((p) => {
          const isInstantReplier = p.medianResponseMinutes > 0 && p.medianResponseMinutes <= 2.0;
          const isGhoster = p.medianResponseMinutes >= 20.0;

          return (
            <div
              key={p.name}
              className="glass-card-elevated rounded-xl p-4 border border-white/5 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="font-bold text-sm text-white">{p.name}</span>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                  {p.percentage}% of chat
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${p.percentage}%`, backgroundColor: p.color }}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                {/* Latency */}
                <div className="bg-surface/50 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center justify-center space-x-1 text-[11px] text-zinc-400 mb-1">
                    <Clock className="w-3 h-3" />
                    <span>Reply Time</span>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold ${
                      isInstantReplier
                        ? 'text-brand-emerald'
                        : isGhoster
                        ? 'text-red-400'
                        : 'text-zinc-200'
                    }`}
                  >
                    {p.medianResponseMinutes > 0 ? `${p.medianResponseMinutes}m` : '< 1m'}
                  </span>
                </div>

                {/* Initiations */}
                <div className="bg-surface/50 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center justify-center space-x-1 text-[11px] text-zinc-400 mb-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Starters</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white">
                    {p.initiationCount} times
                  </span>
                </div>

                {/* Double texts */}
                <div className="bg-surface/50 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center justify-center space-x-1 text-[11px] text-zinc-400 mb-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span>3x Bursts</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white">
                    {p.doubleTextCount} streaks
                  </span>
                </div>
              </div>

              {/* Active Badges on this participant */}
              {p.badges && p.badges.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-1.5">
                  {p.badges.map((b) => (
                    <span
                      key={b.id}
                      title={b.description}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-zinc-300"
                    >
                      <span>{b.emoji}</span>
                      <span>{b.title}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
