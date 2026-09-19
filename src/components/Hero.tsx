import React from 'react';
import { Play, HelpCircle, Lock, Zap, Sparkles } from 'lucide-react';
import { DropZone } from './DropZone';
import { ParsingProgress } from '../types/chat';

interface HeroProps {
  onFileSelected: (file: File) => void;
  onLoadDemo: () => void;
  onOpenGuide: () => void;
  progress: ParsingProgress | null;
  error: string | null;
}

export const Hero: React.FC<HeroProps> = ({
  onFileSelected,
  onLoadDemo,
  onOpenGuide,
  progress,
  error,
}) => {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-12 flex flex-col justify-center min-h-[calc(100dvh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column (55%) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Privacy Signal Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-xs font-semibold text-brand-emerald shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero Server Upload · 100% Client-Side Privacy</span>
          </div>

          {/* Value Prop Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            See what your WhatsApp chats <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald via-emerald-400 to-cyan-400">actually say</span> about you.
          </h1>

          {/* Subtext under 20 words */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
            Response latencies, ghosting streaks, 3 AM late-night habits, and your custom Spotify-style Wrapped recap.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={onLoadDemo}
              className="flex items-center space-x-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-brand-emerald hover:bg-brand-hover text-black shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Try Demo Chat</span>
            </button>

            <button
              onClick={onOpenGuide}
              className="flex items-center space-x-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-surface-elevated hover:bg-white/10 text-zinc-200 border border-white/10 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-zinc-400" />
              <span>How to Export (1 min)</span>
            </button>
          </div>

          {/* Feature Micro-Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/5 max-w-lg">
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <Zap className="w-4 h-4 text-brand-emerald" />
              <span>Instant Web Worker</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <Play className="w-4 h-4 text-cyan-400" />
              <span>Spotify Wrapped</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <span className="text-base">🦉</span>
              <span>8 Personality Badges</span>
            </div>
          </div>
        </div>

        {/* Right Column (45%) Ingestion Bay */}
        <div className="lg:col-span-5 w-full">
          <DropZone
            onFileSelected={onFileSelected}
            progress={progress}
            error={error}
          />
        </div>
      </div>
    </section>
  );
};
