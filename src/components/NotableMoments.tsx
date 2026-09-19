import React from 'react';
import { NotableMoment } from '../types/chat';
import { Flame, Smile, Quote, Zap, Moon } from 'lucide-react';
import { resolveSenderName } from '../utils/phoneHandler';
import { useLanguage } from '../utils/i18n';

interface NotableMomentsProps {
  moments?: NotableMoment[];
}

export const NotableMoments: React.FC<NotableMomentsProps> = ({ moments }) => {
  const { t } = useLanguage();
  if (!moments || moments.length === 0) return null;

  const getMomentConfig = (id: string) => {
    switch (id) {
      case 'most_reactions':
        return {
          title: t.mostReactions,
          icon: <Flame className="w-3.5 h-3.5 text-[#EA580C]" />,
          tagClass: 'bg-[#EA580C]/10 text-[#C2410C]',
        };
      case 'highest_emoji':
        return {
          title: t.mostEmojis,
          icon: <Smile className="w-3.5 h-3.5 text-[#EA580C]" />,
          tagClass: 'bg-[#EA580C]/10 text-[#C2410C]',
        };
      case 'longest_monologue':
        return {
          title: t.longestMessage,
          icon: <Quote className="w-3.5 h-3.5 text-[#EA580C]" />,
          tagClass: 'bg-[#EA580C]/10 text-[#C2410C]',
        };
      case 'lightning_rally':
        return {
          title: t.fastestExchange,
          icon: <Zap className="w-3.5 h-3.5 text-[#16A34A]" />,
          tagClass: 'bg-[#16A34A]/10 text-[#15803D]',
        };
      case 'late_night':
        return {
          title: t.lateNightChat,
          icon: <Moon className="w-3.5 h-3.5 text-[#2563EB]" />,
          tagClass: 'bg-[#2563EB]/10 text-[#1D4ED8]',
        };
      default:
        return {
          title: 'Moment',
          icon: <Quote className="w-3.5 h-3.5 text-[#1C1917]" />,
          tagClass: 'bg-[#1C1917]/10 text-[#1C1917]',
        };
    }
  };

  return (
    <div className="rounded-3xl bg-[#F5F2EB] border border-[#E7E2D8] p-5 sm:p-7 w-full shadow-[0_4px_24px_rgba(0,0,0,0.02)] break-inside-avoid">
      {/* Streamlined Header */}
      <div className="mb-5 pb-3 border-b border-[#E2DDD3] flex items-baseline justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#78716C] block">
            Section 05 · Highlights
          </span>
          <h3 className="font-serif text-2xl font-normal text-[#1C1917] tracking-tight">
            {t.notableMomentsTitle}
          </h3>
        </div>

        <span className="text-[10px] font-mono text-[#78716C] bg-[#EFECE6] px-2.5 py-0.5 rounded-full border border-[#E2DDD3]">
          {moments.length} Preserved
        </span>
      </div>

      {/* Simplified 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moments.map((moment) => {
          const config = getMomentConfig(moment.id);
          const author = moment.target
            ? `${resolveSenderName(moment.sender)} → ${resolveSenderName(moment.target)}`
            : resolveSenderName(moment.sender);

          return (
            <div
              key={moment.id}
              className="rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] p-4 sm:p-5 flex flex-col justify-between hover:border-[#D5CDBC] transition-all"
            >
              <div>
                {/* Clean Single-Row Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-white border border-[#E2DDD3]">
                      {config.icon}
                    </span>
                    <h4 className="font-serif text-base text-[#1C1917] font-normal">
                      {config.title}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${config.tagClass}`}>
                    {moment.metric}
                  </span>
                </div>

                {/* Sender & Date Line */}
                <p className="text-[11px] font-mono text-[#78716C] mb-2.5">
                  <strong className="text-[#1C1917]">{author}</strong>
                  {moment.timestamp && (
                    <span className="text-[#A8A29E]"> · {moment.timestamp}</span>
                  )}
                </p>

                {/* Clean Quote Bubble (stripped of any raw URLs or invalid links) */}
                <div className="rounded-xl bg-white/80 border border-[#E2DDD3] p-3">
                  <p className="text-xs font-serif italic text-[#44403C] leading-relaxed line-clamp-3">
                    {(() => {
                      const sanitized = moment.snippet.replace(/(?:https?:\/\/|www\.)[^\s]+/gi, '').replace(/\s+/g, ' ').trim();
                      return sanitized.startsWith('"') ? sanitized : `"${sanitized}"`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
