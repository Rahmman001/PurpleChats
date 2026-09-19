import React from 'react';
import {
  MessageSquare,
  Image as ImageIcon,
  Sparkles,
  Cloud,
  ArrowRight,
} from 'lucide-react';
import { ChatAnalytics } from '../types/chat';
import { TimelineChart } from './TimelineChart';
import { HourlyHeatmap } from './HourlyHeatmap';
import { DynamicsLeaderboard } from './DynamicsLeaderboard';
import { EmojiLeaderboard } from './EmojiLeaderboard';
import { ArchetypeCard } from './ArchetypeCard';
import { NetworkGraph } from './NetworkGraph';
import { NotableMoments } from './NotableMoments';
import { resolveSenderName } from '../utils/phoneHandler';

interface BentoGridProps {
  analytics: ChatAnalytics;
  onOpenWrapped: () => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ analytics, onOpenWrapped }) => {
  const avgMessagesPerDay = Math.round(
    analytics.totalMessages / Math.max(1, analytics.totalDays)
  );
  const avgWordsPerMessage = Math.round(
    analytics.totalWords / Math.max(1, analytics.totalMessages)
  );
  const topSpeaker = analytics.participants[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* ========================================================================= */}
      {/* 1. EDITORIAL DOSSIER HERO CARD (Inspired by July Fund Master Header)       */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-[#F5F2EB] border border-[#E7E2D8] p-6 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Kelly Green Pill Kicker */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#16A34A] text-white text-[9px] font-mono font-bold uppercase tracking-widest shrink-0">
                VERIFIED ARCHIVE
              </span>
              <span className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider">
                <span className="hidden sm:inline">PROCESSED ON YOUR DEVICE</span>
                <span className="sm:hidden">ON-DEVICE</span>
              </span>
            </div>

            {/* Editorial Serif Headline */}
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-6xl font-normal text-[#1C1917] tracking-tight leading-tight">
              Group Dynamics & Chat Story
            </h1>

            {/* Editorial About Text */}
            <p className="text-xs sm:text-sm font-serif text-[#57534E] leading-relaxed max-w-xl">
              A clear look at how your group communicates across {analytics.totalDays} active days. Explore response speeds, conversation starters, and night-owl habits.
            </p>

            {/* Monospace Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] sm:text-[11px] font-mono text-[#78716C]">
              <span className="bg-[#EFECE6] border border-[#E2DDD3] px-2.5 py-1 rounded-full">
                {analytics.startDate} — {analytics.endDate}
              </span>
              <span className="bg-[#EFECE6] border border-[#E2DDD3] px-2.5 py-1 rounded-full">
                {analytics.participants.length} {analytics.participants.length === 1 ? 'Member' : 'Members'}
              </span>
              <span className="bg-[#EFECE6] border border-[#E2DDD3] px-2.5 py-1 rounded-full">
                {analytics.totalMessages.toLocaleString()} Messages
              </span>
            </div>
          </div>

          {/* Right Action: Generate Story Dossier Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-start lg:items-end gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenWrapped}
              className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-full bg-[#1C1917] hover:bg-[#2E2A27] text-white font-mono text-xs font-medium flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer group"
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse shrink-0" />
              <span>Create Story Card</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
            <span className="text-[10px] font-mono text-[#78716C] text-center sm:text-left lg:text-right">
              Shareable slides & editorial bento poster
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ASYMMETRIC BENTO MATRIX (Vital Indicators with Rich Palette Diversity) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Tile 1: Hero Volume Card (Warm Bone with Orange Pill) */}
        <div className="md:col-span-6 lg:col-span-4 rounded-3xl bg-[#EFECE6] border border-[#E2DDD3] p-5 sm:p-7 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:border-[#D5CDBC]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EA580C] text-white text-[8px] font-mono font-bold uppercase tracking-wider">
                MESSAGES
              </span>
              <MessageSquare className="w-4 h-4 text-[#1C1917]/40" />
            </div>

            <span className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1C1917] block font-normal tracking-tight mb-1">
              {analytics.totalMessages.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#78716C] uppercase tracking-wider block mb-3">
              Total Messages Sent
            </span>
            <p className="text-xs font-serif text-[#57534E] leading-relaxed">
              Averaging {avgMessagesPerDay} messages every day across the chat.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-[#E2DDD3] flex items-center justify-between text-[9px] font-mono text-[#78716C]">
            <span>{analytics.participants.length} Active Voices</span>
            <span className="border border-[#1C1917]/20 px-2 py-0.5 rounded-full text-[#1C1917]">
              Verified
            </span>
          </div>
        </div>

        {/* Tile 2: The Calendar "10" Tile (Exact aesthetic from July Fund image) */}
        <div className="md:col-span-6 lg:col-span-2 rounded-3xl bg-[#F5F2EB] border border-[#E7E2D8] p-5 sm:p-7 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:border-[#D5CDBC]">
          <div>
            <div className="w-8 h-0.5 bg-[#1C1917]/30 mb-3" />
            <span className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1C1917] block font-normal tracking-tight mb-1">
              {analytics.totalDays}
            </span>
            <span className="text-xs font-mono text-[#78716C] uppercase tracking-wider block">
              Active Days
            </span>
          </div>

          <div className="mt-5 pt-3 border-t border-[#E2DDD3] flex items-center justify-between text-[9px] font-mono text-[#78716C]">
            <span>Timeframe</span>
            <span className="border border-[#1C1917]/20 px-2 py-0.5 rounded-full text-[#1C1917]">
              Span
            </span>
          </div>
        </div>

        {/* Tile 3: Saturated Kelly Green Infrastructure Lexicon Tile with 3 Dots */}
        <div className="md:col-span-6 lg:col-span-3 rounded-3xl bg-[#15803D] text-white border border-[#166534] p-5 sm:p-7 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:scale-[1.01]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm tracking-widest font-bold">● ● ●</span>
              <span className="px-2 py-0.5 rounded-full bg-white text-[#15803D] text-[8px] font-mono font-bold uppercase tracking-wider">
                WORDS
              </span>
            </div>

            <span className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white block font-normal tracking-tight mb-1">
              {analytics.totalWords.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-emerald-100 uppercase tracking-wider block mb-2">
              Words Exchanged
            </span>
            <p className="text-xs font-serif text-emerald-100/90 leading-relaxed">
              Averaging {avgWordsPerMessage} words per message across the whole conversation.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[9px] font-mono text-emerald-100">
            <span>Vocabulary</span>
            <span className="border border-white/30 px-2 py-0.5 rounded-full text-white">
              Length
            </span>
          </div>
        </div>

        {/* Tile 4: Sunflower Yellow Peak Surge Tile (Digital Transformation Style) */}
        <div className="md:col-span-6 lg:col-span-3 rounded-3xl bg-[#FACC15] text-[#1C1917] border border-[#EAB308] p-5 sm:p-7 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:scale-[1.01]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded-full bg-[#1C1917] text-[#FACC15] text-[8px] font-mono font-bold uppercase tracking-wider">
                BUSIEST DAY
              </span>
              <Sparkles className="w-4 h-4 text-[#1C1917]" />
            </div>

            <span className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] block font-normal tracking-tight mb-1">
              {analytics.peakDay.count.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#1C1917]/80 uppercase tracking-wider block mb-2">
              Most Active 24 Hours
            </span>
            <p className="text-xs font-serif text-[#1C1917]/80 leading-relaxed truncate">
              {analytics.peakDay.formattedDate || 'Record day'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-black/15 flex items-center justify-between text-[9px] font-mono text-[#1C1917]">
            <span>Peak Activity</span>
            <span className="border border-black/20 px-2 py-0.5 rounded-full text-[#1C1917]">
              Record
            </span>
          </div>
        </div>

        {/* Tile 5: Deep Midnight Slate Cloud Tile (Late Night Shift) */}
        <div className="md:col-span-6 lg:col-span-4 rounded-3xl bg-[#0F172A] text-white border border-[#1E293B] p-5 sm:p-7 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:border-[#334155]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-[#6366F1] text-white text-[8px] font-mono font-bold uppercase tracking-wider">
                LATE NIGHT
              </span>
              <Cloud className="w-5 h-5 text-white/70" />
            </div>

            <span className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white block font-normal tracking-tight mb-1">
              {analytics.lateNightTotal.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Messages Between Midnight and 5 AM
            </span>
            <p className="text-xs font-serif text-slate-300 leading-relaxed">
              Late-night thoughts, replies, and conversations after dark.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>Night Owls</span>
            <span className="border border-white/20 px-2 py-0.5 rounded-full text-white">
              Late Night
            </span>
          </div>
        </div>

        {/* Tile 6: Media Attachments Archive Tile */}
        <div className="md:col-span-6 lg:col-span-4 rounded-3xl bg-[#EFECE6] border border-[#E2DDD3] p-5 sm:p-7 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:border-[#D5CDBC]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white text-[8px] font-mono font-bold uppercase tracking-wider">
                PHOTOS & MEDIA
              </span>
              <ImageIcon className="w-4 h-4 text-[#1C1917]/40" />
            </div>

            <span className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] block font-normal tracking-tight mb-1">
              {analytics.totalMedia.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#78716C] uppercase tracking-wider block mb-2">
              Photos, Videos & Voice Notes
            </span>
            <p className="text-xs font-serif text-[#57534E] leading-relaxed">
              Visual and audio moments shared throughout the conversation.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2DDD3] flex items-center justify-between text-[9px] font-mono text-[#78716C]">
            <span>Shared Moments</span>
            <span className="border border-[#1C1917]/20 px-2 py-0.5 rounded-full text-[#1C1917]">
              Media
            </span>
          </div>
        </div>

        {/* Tile 7: Primary Speaker Spotlight Card */}
        {topSpeaker && (
          <div className="md:col-span-12 lg:col-span-4 rounded-3xl bg-[#1C1917] text-white border border-black/10 p-5 sm:p-7 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:border-white/20">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#EA580C] text-white text-[8px] font-mono font-bold uppercase tracking-wider">
                  TOP CONTRIBUTOR · 01
                </span>
                <span className="font-serif text-xl sm:text-2xl text-[#FACC15] font-light">
                  {topSpeaker.percentage}%
                </span>
              </div>

              <h4 className="font-serif text-xl sm:text-2xl font-normal text-white mb-1 truncate">
                {resolveSenderName(topSpeaker.name)}
              </h4>
              <span className="text-xs font-mono text-stone-400 uppercase tracking-wider block mb-2">
                Most Active Voice
              </span>
              <p className="text-xs font-serif text-stone-300 leading-relaxed">
                Sent {topSpeaker.messageCount.toLocaleString()} messages, making up {topSpeaker.percentage}% of all messages in the chat.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-stone-400">
              <span>{topSpeaker.medianResponseMinutes > 0 ? `Replies in ~${topSpeaker.medianResponseMinutes} mins` : 'Replies almost instantly'}</span>
              <span className="border border-white/20 px-2 py-0.5 rounded-full text-white">
                Top Voice
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. PRIMARY FEATURE ROW: RELATIONAL TOPOLOGY (Full-Width Museum Frame)     */}
      {/* ========================================================================= */}
      <NetworkGraph analytics={analytics} />

      {/* ========================================================================= */}
      {/* 4. ASYMMETRIC DYNAMICS & CHRONOLOGY (7 / 5 Rhythm Break)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (7 cols): Timeline Rhythm */}
        <div className="lg:col-span-7">
          <TimelineChart timeline={analytics.timeline} />
        </div>

        {/* Right (5 cols): Hourly Diurnal Clock */}
        <div className="lg:col-span-5">
          <HourlyHeatmap data={analytics.hourlyDistribution} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PARTICIPANTS & LEADERSHIP DYNAMICS                                     */}
      {/* ========================================================================= */}
      <DynamicsLeaderboard participants={analytics.participants} />

      {/* ========================================================================= */}
      {/* 6. NOTABLE CHAT MOMENTS & EXCHANGES                                       */}
      {/* ========================================================================= */}
      <NotableMoments moments={analytics.notableMoments} />

      {/* ========================================================================= */}
      {/* 7. SOCIOMETRIC DISTINCTIONS (Accolades & Badges Bento Grid)               */}
      {/* ========================================================================= */}
      <ArchetypeCard badges={analytics.badges} />

      {/* ========================================================================= */}
      {/* 7. LEXICON & VOCABULARY FREQUENCY                                         */}
      {/* ========================================================================= */}
      <EmojiLeaderboard
        emojis={analytics.topOverallEmojis}
        words={analytics.topWords}
      />
    </div>
  );
};
