import React from 'react';
import { Smile, Hash } from 'lucide-react';

interface EmojiLeaderboardProps {
  emojis: { emoji: string; count: number }[];
  words: { word: string; count: number }[];
}

export const EmojiLeaderboard: React.FC<EmojiLeaderboardProps> = ({ emojis, words }) => {
  const maxEmojiCount = emojis[0]?.count || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Emojis Column */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Smile className="w-5 h-5 text-brand-emerald" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Top Emojis
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Frequency
          </span>
        </div>

        {emojis.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">No emojis found in this chat.</p>
        ) : (
          <div className="space-y-2.5">
            {emojis.slice(0, 7).map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <span className="font-mono text-xs text-zinc-500 w-4">
                  #{idx + 1}
                </span>
                <span className="text-2xl leading-none w-8 text-center">{item.emoji}</span>
                <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-emerald rounded-full"
                    style={{ width: `${(item.count / maxEmojiCount) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-zinc-300 w-12 text-right">
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Words Column */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Hash className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Top Vocabulary
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Stop-Words Filtered
          </span>
        </div>

        {words.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">No significant vocabulary parsed.</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {words.slice(0, 16).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated/70 border border-white/5 hover:border-cyan-400/40 transition-colors"
              >
                <span className="text-xs font-medium text-white">{item.word}</span>
                <span className="font-mono text-[10px] text-cyan-400 font-bold bg-cyan-400/10 px-1.5 py-0.5 rounded">
                  {item.count}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
