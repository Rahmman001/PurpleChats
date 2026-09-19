import React from 'react';
import { BadgeProfile } from '../types/chat';
import { Award, Zap, Clock, Moon, Sun, MessageSquare, Compass, Shield } from 'lucide-react';
import { resolveSenderName } from '../utils/phoneHandler';

interface ArchetypeCardProps {
  badges: BadgeProfile[];
}

const getBadgeIcon = (id: string, colorClass: string) => {
  switch (id) {
    case 'night_owl':
      return <Moon className={`w-4 h-4 ${colorClass}`} />;
    case 'early_bird':
      return <Sun className={`w-4 h-4 ${colorClass}`} />;
    case 'keyboard_philosopher':
      return <MessageSquare className={`w-4 h-4 ${colorClass}`} />;
    case 'tactical_brevity':
      return <Shield className={`w-4 h-4 ${colorClass}`} />;
    case 'zero_latency':
      return <Zap className={`w-4 h-4 ${colorClass}`} />;
    case 'defibrillator':
      return <Compass className={`w-4 h-4 ${colorClass}`} />;
    case 'main_character':
      return <Award className={`w-4 h-4 ${colorClass}`} />;
    default:
      return <Clock className={`w-4 h-4 ${colorClass}`} />;
  }
};

export const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ badges }) => {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="rounded-3xl bg-[#F5F2EB] border border-[#E7E2D8] p-6 sm:p-8 w-full shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      {/* Header with comfortable margins and padding */}
      <div className="mb-6 pb-4 border-b border-[#E2DDD3] flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#78716C] block">
            Section 04 · Group Roles
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1917] tracking-tight">
            Chat Superlatives
          </h3>
          <p className="text-xs sm:text-sm font-serif italic text-[#78716C]">
            Playful badges awarded based on habits, timing, and chat personality.
          </p>
        </div>

        <span className="text-[10px] font-mono text-[#78716C] bg-[#EFECE6] px-3 py-1 rounded-full border border-[#E2DDD3] self-start sm:self-auto">
          {badges.length} badges awarded
        </span>
      </div>

      {/* Grid of Badges with generous gap and padding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {badges.map((badge, idx) => {
          // Spot colors inspired by the July Fund reference palette
          const cardThemes = [
            {
              bg: 'bg-[#EFECE6]',
              border: 'border-[#E2DDD3]',
              text: 'text-[#1C1917]',
              subText: 'text-[#78716C]',
              pill: 'bg-[#EA580C] text-white',
              iconBg: 'bg-[#FAF7F2] text-[#1C1917]',
              iconColor: 'text-[#1C1917]',
            },
            {
              bg: 'bg-[#15803D]',
              border: 'border-[#166534]',
              text: 'text-white',
              subText: 'text-emerald-100',
              pill: 'bg-white text-[#15803D]',
              iconBg: 'bg-white/10 text-white',
              iconColor: 'text-white',
              showDots: true,
            },
            {
              bg: 'bg-[#FACC15]',
              border: 'border-[#EAB308]',
              text: 'text-[#1C1917]',
              subText: 'text-[#1C1917]/85',
              pill: 'bg-[#1C1917] text-[#FACC15]',
              iconBg: 'bg-black/10 text-[#1C1917]',
              iconColor: 'text-[#1C1917]',
            },
            {
              bg: 'bg-[#1C1917]',
              border: 'border-black/10',
              text: 'text-white',
              subText: 'text-[#A8A29E]',
              pill: 'bg-[#6366F1] text-white',
              iconBg: 'bg-white/10 text-white',
              iconColor: 'text-white',
            },
          ][idx % 4];

          return (
            <div
              key={badge.id}
              className={`rounded-2xl ${cardThemes.bg} ${cardThemes.border} border p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:scale-[1.01] hover:shadow-sm`}
            >
              <div>
                {/* Header with Award Pill */}
                <div className="flex items-center justify-between mb-3.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${cardThemes.pill}`}
                  >
                    BADGE 0{idx + 1}
                  </span>
                  {cardThemes.showDots && (
                    <span className="text-white text-[10px] tracking-widest font-bold">● ● ●</span>
                  )}
                </div>

                {/* Icon and Title */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl ${cardThemes.iconBg} flex items-center justify-center shrink-0`}
                  >
                    {getBadgeIcon(badge.id, cardThemes.iconColor)}
                  </div>
                  <h4
                    className={`font-serif text-lg font-normal truncate leading-snug ${cardThemes.text}`}
                  >
                    {badge.title}
                  </h4>
                </div>

                {/* Recipient Tag */}
                <div className="mb-3">
                  <span
                    className={`inline-block text-[10px] font-mono font-medium px-2.5 py-1 rounded-full ${
                      cardThemes.bg.includes('15803D') || cardThemes.bg.includes('1C1917')
                        ? 'bg-white/15 text-white'
                        : 'bg-black/5 text-[#1C1917]'
                    }`}
                  >
                    {resolveSenderName(badge.recipientName)}
                  </span>
                </div>

                {/* Description */}
                <p className={`text-xs font-serif leading-relaxed line-clamp-3 mb-4 ${cardThemes.subText}`}>
                  {badge.description}
                </p>
              </div>

              {/* Bottom Attribution Footer */}
              <div className="mt-auto pt-3 border-t border-black/10 flex items-center justify-between text-[10px] font-mono">
                <span className={cardThemes.subText}>{badge.value}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full border ${
                    cardThemes.bg.includes('15803D') || cardThemes.bg.includes('1C1917')
                      ? 'border-white/30 text-white'
                      : 'border-[#1C1917]/20 text-[#1C1917]'
                  }`}
                >
                  Awarded
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
