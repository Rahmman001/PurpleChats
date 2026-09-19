import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  Clock,
  Moon,
  Flame,
  Volume2
} from 'lucide-react';
import { ChatAnalytics } from '../types/chat';
import { exportStoryCard } from '../utils/exportImage';

interface WrappedStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: ChatAnalytics;
}

const TOTAL_SLIDES = 6;
const SLIDE_DURATION_MS = 6000;

export const WrappedStoryModal: React.FC<WrappedStoryModalProps> = ({
  isOpen,
  onClose,
  analytics,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [anonymize, setAnonymize] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // Helper to get display name based on anonymizer toggle
  const getDisplayName = useCallback((name: string, index = 0) => {
    if (!anonymize) return name;
    return `Friend ${String.fromCharCode(65 + (index % 26))}`;
  }, [anonymize]);

  // Navigate slides
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev < TOTAL_SLIDES - 1) {
        return prev + 1;
      } else {
        return prev;
      }
    });
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose]);

  // Trigger confetti on the final slide
  useEffect(() => {
    if (isOpen && currentSlide === TOTAL_SLIDES - 1) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'],
        });
      } catch {
        // Fallback gracefully if canvas context fails
      }
    }
  }, [isOpen, currentSlide]);

  // Auto-progress timer
  useEffect(() => {
    if (!isOpen || isPaused || isExporting) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      if (currentSlide < TOTAL_SLIDES - 1) {
        nextSlide();
      }
    }, SLIDE_DURATION_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, currentSlide, isPaused, isExporting, nextSlide]);

  if (!isOpen) return null;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!slideRef.current) return;
    setIsExporting(true);
    try {
      await exportStoryCard(slideRef.current, `whatsapp-wrapped-slide-${currentSlide + 1}`);
    } catch {
      alert('Failed to save story card. Try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const topSpeaker = analytics.participants[0];
  const quickestReplier = [...analytics.participants]
    .filter((p) => p.medianResponseMinutes > 0)
    .sort((a, b) => a.medianResponseMinutes - b.medianResponseMinutes)[0];
  const slowestReplier = [...analytics.participants]
    .filter((p) => p.medianResponseMinutes > 0)
    .sort((a, b) => b.medianResponseMinutes - a.medianResponseMinutes)[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between max-w-[420px] mx-auto z-20 text-white">
        <button
          onClick={() => setAnonymize((prev) => !prev)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-surface-elevated/80 border border-white/10 text-xs font-semibold hover:bg-surface-elevated transition-colors"
          title="Toggle privacy anonymizer"
        >
          {anonymize ? <EyeOff className="w-3.5 h-3.5 text-brand-emerald" /> : <Eye className="w-3.5 h-3.5 text-zinc-400" />}
          <span>{anonymize ? 'Names Hidden' : 'Hide Names'}</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-brand-emerald text-black text-xs font-bold hover:bg-brand-hover shadow-lg transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Saving...' : 'Save Card'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-surface-elevated/80 border border-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 9:16 Vertical Story Container */}
      <div
        ref={slideRef}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="relative w-full max-w-[420px] h-[90dvh] max-h-[840px] rounded-3xl overflow-hidden glass-card-elevated border border-white/15 shadow-2xl flex flex-col justify-between p-6 sm:p-8 select-none"
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #080c14 100%)',
        }}
      >
        {/* Progress Bars */}
        <div className="w-full flex space-x-1.5 pt-2 z-10">
          {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-1 rounded-full bg-white/15 overflow-hidden"
            >
              <div
                className={`h-full bg-brand-emerald transition-all duration-300 ${
                  idx < currentSlide
                    ? 'w-full'
                    : idx === currentSlide
                    ? 'w-full animate-pulse'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Ambient background glow matching slide */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-emerald/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Slide Content */}
        <div className="my-auto py-6 z-10">
          {/* SLIDE 1: The Mileage */}
          {currentSlide === 0 && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-xs font-mono font-bold text-brand-emerald uppercase">
                <Sparkles className="w-3.5 h-3.5 fill-brand-emerald" />
                <span>The Journey</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                You had quite a year of chatting.
              </h2>

              <div className="py-4 space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-4xl sm:text-5xl font-black font-mono text-brand-emerald tracking-tight block mb-1">
                    {analytics.totalMessages.toLocaleString()}
                  </span>
                  <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                    Total Messages Exchanged
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xl font-bold font-mono text-white block">
                      {analytics.totalWords.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-zinc-400">Total Words</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xl font-bold font-mono text-cyan-400 block">
                      {analytics.totalDays} Days
                    </span>
                    <span className="text-[11px] text-zinc-400">Days of Chatting</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-400 italic">
                From {analytics.startDate} to {analytics.endDate}
              </p>
            </div>
          )}

          {/* SLIDE 2: The Megaphone */}
          {currentSlide === 1 && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-xs font-mono font-bold text-cyan-400 uppercase">
                <Volume2 className="w-3.5 h-3.5" />
                <span>The Megaphone</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Who dominated the airwaves?
              </h2>

              {topSpeaker && (
                <div className="py-4 space-y-4">
                  <div className="p-5 rounded-2xl bg-cyan-400/10 border border-cyan-400/25">
                    <span className="text-5xl sm:text-6xl font-black font-mono text-cyan-400 tracking-tight block mb-1">
                      {topSpeaker.percentage}%
                    </span>
                    <span className="text-sm font-bold text-white block mb-0.5">
                      {getDisplayName(topSpeaker.name, 0)}
                    </span>
                    <span className="text-xs text-zinc-400">
                      Sent {topSpeaker.messageCount.toLocaleString()} messages alone!
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    {analytics.participants.slice(0, 3).map((p, i) => (
                      <div
                        key={p.name}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                      >
                        <span className="font-semibold text-white">
                          #{i + 1} {getDisplayName(p.name, i)}
                        </span>
                        <span className="font-mono text-zinc-300">
                          {p.messageCount.toLocaleString()} msgs ({p.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SLIDE 3: Peak Chaos Day */}
          {currentSlide === 2 && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-400/10 border border-orange-400/30 text-xs font-mono font-bold text-orange-400 uppercase">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Peak Chaos</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                The day everything popped off.
              </h2>

              <div className="py-6 space-y-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs uppercase font-mono tracking-widest text-zinc-400 block mb-1">
                    Most Active Day in History
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-white block mb-3">
                    {analytics.peakDay.formattedDate || 'Record Day'}
                  </span>
                  <span className="text-5xl font-mono font-black text-orange-400 block mb-1">
                    {analytics.peakDay.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    Messages sent in a single 24-hour frenzy
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-400">
                That is about 1 message every couple of minutes!
              </p>
            </div>
          )}

          {/* SLIDE 4: 3 AM Confessions */}
          {currentSlide === 3 && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-xs font-mono font-bold text-amber-400 uppercase">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span>3 AM Confessions</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                The late-night conversations.
              </h2>

              <div className="py-4 space-y-4">
                <div className="p-5 rounded-2xl bg-amber-400/10 border border-amber-400/20">
                  <span className="text-5xl font-mono font-black text-amber-400 block mb-1">
                    {analytics.lateNightTotal.toLocaleString()}
                  </span>
                  <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                    Messages sent between 12:00 AM & 5:00 AM
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Top Night Owls
                  </p>
                  {analytics.participants
                    .filter((p) => p.nightOwlCount > 0)
                    .slice(0, 2)
                    .map((p, i) => (
                      <div
                        key={p.name}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
                      >
                        <span className="font-semibold text-white">
                          🦉 {getDisplayName(p.name, i)}
                        </span>
                        <span className="font-mono text-amber-400 font-bold">
                          {p.nightOwlCount} 3 AM msgs
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: Response Time & Ghosting */}
          {currentSlide === 4 && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-xs font-mono font-bold text-brand-emerald uppercase">
                <Clock className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Speed vs. Ghosting</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Who replies instantly?
              </h2>

              <div className="py-4 space-y-3">
                {quickestReplier && (
                  <div className="p-4 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/20 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-brand-emerald uppercase">
                        ⚡ Quickest Replier
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        {quickestReplier.medianResponseMinutes}m median
                      </span>
                    </div>
                    <span className="text-lg font-bold text-white">
                      {getDisplayName(quickestReplier.name, 0)}
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Barely puts their phone down.
                    </p>
                  </div>
                )}

                {slowestReplier && slowestReplier.name !== quickestReplier?.name && (
                  <div className="p-4 rounded-2xl bg-red-400/10 border border-red-400/20 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-red-400 uppercase">
                        👻 Serial Ghoster
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        {slowestReplier.medianResponseMinutes}m median
                      </span>
                    </div>
                    <span className="text-lg font-bold text-white">
                      {getDisplayName(slowestReplier.name, 1)}
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Takes hours to formulate a response.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SLIDE 6: Archetypes & Finale */}
          {currentSlide === 5 && (
            <div className="space-y-5 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-xs font-mono font-bold text-brand-emerald uppercase">
                <Award className="w-3.5 h-3.5 text-brand-emerald" />
                <span>The Honors</span>
              </div>

              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                Your Chat Badges
              </h2>

              <div className="space-y-2 py-2 max-h-[340px] overflow-y-auto">
                {analytics.badges.slice(0, 4).map((b, i) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-left flex items-center space-x-3"
                  >
                    <span className="text-2xl">{b.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{b.title}</span>
                        <span className="text-[10px] font-mono text-brand-emerald font-bold">
                          {getDisplayName(b.recipientName, i)}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleDownload}
                  className="w-full py-3 rounded-xl bg-brand-emerald hover:bg-brand-hover text-black font-extrabold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Your 2024 Wrapped Card</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Brand Watermark */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-[11px] font-mono text-zinc-500 z-10">
          <span>WhatsApp Chat Analyzer v2</span>
          <span>100% In-Browser</span>
        </div>

        {/* Clickable tap zones for Story Navigation */}
        <div
          onClick={prevSlide}
          className="absolute left-0 top-16 bottom-16 w-1/3 z-0 cursor-pointer"
          title="Previous slide"
        />
        <div
          onClick={nextSlide}
          className="absolute right-0 top-16 bottom-16 w-2/3 z-0 cursor-pointer"
          title="Next slide"
        />
      </div>

      {/* Desktop Chevron Navigation */}
      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className="hidden md:flex absolute left-8 p-3 rounded-full bg-surface-elevated/80 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        disabled={currentSlide === TOTAL_SLIDES - 1}
        className="hidden md:flex absolute right-8 p-3 rounded-full bg-surface-elevated/80 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};
