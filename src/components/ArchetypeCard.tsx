import React from 'react';
import { Award } from 'lucide-react';
import { BadgeProfile } from '../types/chat';

interface ArchetypeCardProps {
  badges: BadgeProfile[];
}

export const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ badges }) => {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 w-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-brand-emerald" />
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Personality Badges & Archetypes
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          Data-Backed Honors
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="glass-card-elevated rounded-xl p-4 border border-white/5 hover:border-brand-emerald/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl leading-none">{badge.emoji}</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20">
                  {badge.value}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white mb-0.5">{badge.title}</h4>
              <p className="text-xs text-brand-emerald font-semibold mb-2">
                Awarded to {badge.recipientName}
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
