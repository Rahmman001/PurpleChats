import React from 'react';

interface EmojiLeaderboardProps {
  emojis: { emoji: string; count: number }[];
  words: { word: string; count: number }[];
}

export const EmojiLeaderboard: React.FC<EmojiLeaderboardProps> = ({ emojis, words }) => {
  const maxEmojiCount = emojis[0]?.count || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* Symbol Frequency Card */}
      <div className="rounded-3xl bg-[#F5F2EB] border border-[#E7E2D8] p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <div className="mb-5 border-b border-[#E2DDD3] pb-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#78716C] block mb-1">
              Section 05 · Reactions
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1917] tracking-tight">
              Top Emojis
            </h3>
            <p className="text-xs font-serif italic text-[#78716C] mt-0.5">
              The emojis your group sends the most.
            </p>
          </div>

          {emojis.length === 0 ? (
            <p className="text-xs text-[#78716C] py-8 text-center font-mono">No symbol data recorded.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {emojis.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-2xl leading-none w-8 text-center">{item.emoji}</span>
                  <div className="flex-1 bg-[#E2DDD3] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1C1917] rounded-full"
                      style={{ width: `${(item.count / maxEmojiCount) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-medium text-[#78716C] w-12 text-right">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-[#E2DDD3] flex items-center justify-between text-[9px] font-mono text-[#78716C]">
          <span>Most popular reactions in the group</span>
          <span className="border border-[#1C1917]/20 px-2 py-0.5 rounded-full">Top Emojis</span>
        </div>
      </div>

      {/* Vocabulary Card */}
      <div className="rounded-3xl bg-[#F5F2EB] border border-[#E7E2D8] p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <div className="mb-5 border-b border-[#E2DDD3] pb-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#78716C] block mb-1">
              Section 06 · Vocabulary
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1917] tracking-tight">
              Top Words & Catchphrases
            </h3>
            <p className="text-xs font-serif italic text-[#78716C] mt-0.5">
              The words and phrases your group uses most (common filler words excluded).
            </p>
          </div>

          {words.length === 0 ? (
            <p className="text-xs text-[#78716C] py-8 text-center font-mono">No word frequency data.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {words.slice(0, 18).map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-full bg-[#EFECE6] border border-[#E2DDD3] px-3 py-1 flex items-center gap-1.5 hover:border-[#D5CDBC] transition-colors"
                >
                  <span className="font-serif text-xs text-[#1C1917]">{item.word}</span>
                  <span className="font-mono text-[9px] text-[#78716C] bg-black/5 px-1.5 py-0.2 rounded-full">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-[#E2DDD3] flex items-center justify-between text-[9px] font-mono text-[#78716C]">
          <span>Filtered for common conversation words</span>
          <span className="border border-[#1C1917]/20 px-2 py-0.5 rounded-full">Vocabulary</span>
        </div>
      </div>
    </div>
  );
};
