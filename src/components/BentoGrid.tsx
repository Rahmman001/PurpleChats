import React from 'react';
import { MessageSquare, Type, Image, Calendar, Play, Sparkles } from 'lucide-react';
import { ChatAnalytics } from '../types/chat';
import { MetricCard } from './MetricCard';
import { TimelineChart } from './TimelineChart';
import { HourlyHeatmap } from './HourlyHeatmap';
import { DynamicsLeaderboard } from './DynamicsLeaderboard';
import { EmojiLeaderboard } from './EmojiLeaderboard';
import { ArchetypeCard } from './ArchetypeCard';

interface BentoGridProps {
  analytics: ChatAnalytics;
  onOpenWrapped: () => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ analytics, onOpenWrapped }) => {
  const avgMessagesPerDay = Math.round(analytics.totalMessages / Math.max(1, analytics.totalDays));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Launch Spotify Wrapped */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-brand-emerald/20 via-surface-elevated to-cyan-500/10 border border-brand-emerald/30 shadow-[0_10px_35px_rgba(16,185,129,0.15)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-emerald/20 text-brand-emerald text-xs font-bold font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-brand-emerald" />
            <span>Story Mode Ready</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Your WhatsApp Wrapped is ready to watch.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg">
            A 6-slide cinematic story celebrating your biggest chatterbox, 3 AM confessions, and shareable 9:16 cards.
          </p>
        </div>

        <button
          onClick={onOpenWrapped}
          className="flex-shrink-0 flex items-center space-x-3 px-7 py-4 rounded-2xl bg-brand-emerald hover:bg-brand-hover text-black font-extrabold text-base shadow-[0_6px_25px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Play className="w-5 h-5 fill-black" />
          <span>Launch Wrapped</span>
        </button>
      </div>

      {/* Row 1: Executive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Messages"
          value={analytics.totalMessages.toLocaleString()}
          subValue={`~${avgMessagesPerDay} msgs/day average`}
          icon={<MessageSquare className="w-4 h-4" />}
          accentColor="#10b981"
        />
        <MetricCard
          title="Total Words"
          value={analytics.totalWords.toLocaleString()}
          subValue={`${Math.round(analytics.totalWords / Math.max(1, analytics.totalMessages))} words/msg avg`}
          icon={<Type className="w-4 h-4" />}
          accentColor="#06b6d4"
        />
        <MetricCard
          title="Media Shared"
          value={analytics.totalMedia.toLocaleString()}
          subValue="Photos, videos, audio notes"
          icon={<Image className="w-4 h-4" />}
          accentColor="#8b5cf6"
        />
        <MetricCard
          title="Active Date Span"
          value={`${analytics.totalDays} Days`}
          subValue={`${analytics.startDate} - ${analytics.endDate}`}
          icon={<Calendar className="w-4 h-4" />}
          accentColor="#f59e0b"
        />
      </div>

      {/* Row 2: Conversational Dynamics & Ghosting */}
      <DynamicsLeaderboard participants={analytics.participants} />

      {/* Row 3: Timeline Chart & Hourly Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <TimelineChart timeline={analytics.timeline} />
        </div>
        <div className="lg:col-span-5">
          <HourlyHeatmap data={analytics.hourlyDistribution} />
        </div>
      </div>

      {/* Row 4: Personality Badges & Archetypes */}
      <ArchetypeCard badges={analytics.badges} />

      {/* Row 5: Emoji & Vocabulary Frequency */}
      <EmojiLeaderboard
        emojis={analytics.topOverallEmojis}
        words={analytics.topWords}
      />
    </div>
  );
};
