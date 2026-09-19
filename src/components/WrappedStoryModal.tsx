import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Cloud,
  Clock,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Layers,
  Copy,
  Share2,
  Check,
  Edit2,
} from 'lucide-react';
import { ChatAnalytics } from '../types/chat';
import { exportStoryCard, copyCardToClipboard, shareStoryCard } from '../utils/exportImage';
import { resolveSenderName } from '../utils/phoneHandler';
import { computeGroupVibe } from '../utils/vibeEngine';
import { SearchableParticipantSelector } from './SearchableParticipantSelector';
import { fireConfetti } from '../utils/confetti';

interface WrappedStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: ChatAnalytics;
}

const TOTAL_SLIDES = 6;
const SLIDE_DURATION_MS = 7500;

export const WrappedStoryModal: React.FC<WrappedStoryModalProps> = ({
  isOpen,
  onClose,
  analytics,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'story' | 'bento'>('story');
  const [isPaused, setIsPaused] = useState(false);
  const [anonymize, setAnonymize] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Personalized Shareability States
  const [chatTitle, setChatTitle] = useState('Chat Dossier');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const storyCardRef = useRef<HTMLDivElement>(null);
  const bentoBoardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const groupVibe = useMemo(() => computeGroupVibe(analytics), [analytics]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  const getDisplayName = useCallback(
    (name: string, index = 0) => {
      if (anonymize) return `Member ${String.fromCharCode(65 + (index % 26))}`;
      return resolveSenderName(name);
    },
    [anonymize]
  );

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev < TOTAL_SLIDES - 1) return prev + 1;
      return prev;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingTitle) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (viewMode === 'story') nextSlide();
      } else if (e.key === 'ArrowLeft') {
        if (viewMode === 'story') prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewMode, nextSlide, prevSlide, onClose, isEditingTitle]);

  useEffect(() => {
    if (isOpen && currentSlide === TOTAL_SLIDES - 1 && viewMode === 'story') {
      try {
        fireConfetti();
      } catch {
        // graceful fallback
      }
    }
  }, [isOpen, currentSlide, viewMode]);

  useEffect(() => {
    if (!isOpen || isPaused || isExporting || isEditingTitle || viewMode !== 'story') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (currentSlide < TOTAL_SLIDES - 1) nextSlide();
    }, SLIDE_DURATION_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, currentSlide, isPaused, isExporting, isEditingTitle, viewMode, nextSlide]);

  // 1. Download Action
  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetElement = viewMode === 'story' ? storyCardRef.current : bentoBoardRef.current;
    if (!targetElement) return;

    setIsExporting(true);
    try {
      const filename =
        viewMode === 'story'
          ? `${chatTitle.toLowerCase().replace(/\s+/g, '-')}-slide-${currentSlide + 1}`
          : `${chatTitle.toLowerCase().replace(/\s+/g, '-')}-full-dossier`;
      await exportStoryCard(targetElement, filename);
    } catch {
      alert('Failed to save dossier card. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Clipboard Copy Action (Cmd+V into WhatsApp Web / Slack)
  const handleCopyCard = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetElement = viewMode === 'story' ? storyCardRef.current : bentoBoardRef.current;
    if (!targetElement) return;

    setIsExporting(true);
    try {
      const success = await copyCardToClipboard(targetElement);
      if (success) {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2500);
      } else {
        setCopyStatus('failed');
        setTimeout(() => setCopyStatus('idle'), 2500);
      }
    } catch {
      setCopyStatus('failed');
      setTimeout(() => setCopyStatus('idle'), 2500);
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Native OS Share Action (Share to WhatsApp / Instagram on iOS & Android)
  const handleNativeShare = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetElement = viewMode === 'story' ? storyCardRef.current : bentoBoardRef.current;
    if (!targetElement) return;

    setIsExporting(true);
    try {
      const success = await shareStoryCard(targetElement, chatTitle);
      if (!success) {
        // Fallback to download if user didn't share or not supported
        await handleDownload();
      }
    } catch {
      await handleDownload();
    } finally {
      setIsExporting(false);
    }
  };

  const topSpeaker = analytics.participants[0];
  const runnerUps = analytics.participants.slice(1, 3);
  const quickestReplier = [...analytics.participants]
    .filter((p) => p.medianResponseMinutes > 0)
    .sort((a, b) => a.medianResponseMinutes - b.medianResponseMinutes)[0];
  const slowestReplier = [...analytics.participants]
    .filter((p) => p.medianResponseMinutes > 0)
    .sort((a, b) => b.medianResponseMinutes - a.medianResponseMinutes)[0];

  // If user picked a persona, find their participant summary
  const selectedParticipant = selectedUser
    ? analytics.participants.find((p) => p.name === selectedUser)
    : null;
  const selectedParticipantIndex = selectedUser
    ? analytics.participants.findIndex((p) => p.name === selectedUser)
    : -1;

  // Personal insights for selected member
  const topBond = useMemo(() => {
    if (!selectedUser || !analytics.connections) return null;
    const conns = analytics.connections
      .filter((c) => c.source === selectedUser || c.target === selectedUser)
      .map((c) => ({
        ...c,
        partner: c.source === selectedUser ? c.target : c.source,
      }))
      .sort((a, b) => b.exchangeCount - a.exchangeCount);
    return conns[0] || null;
  }, [analytics.connections, selectedUser]);

  const reflexPercentile = useMemo(() => {
    if (!selectedParticipant || selectedParticipant.medianResponseMinutes <= 0) return 50;
    const responders = analytics.participants.filter((p) => p.medianResponseMinutes > 0);
    if (responders.length <= 1) return 99;
    const slowerCount = responders.filter(
      (p) => p.medianResponseMinutes > selectedParticipant.medianResponseMinutes
    ).length;
    return Math.min(99, Math.max(1, Math.round((slowerCount / (responders.length - 1)) * 100)));
  }, [analytics.participants, selectedParticipant]);

  const personalBadges = useMemo(() => {
    if (!selectedParticipant) return [];
    const earned = analytics.badges.filter((b) => b.recipientName === selectedParticipant.name);
    if (earned.length > 0) return earned;

    const fallbacks = [];
    if (selectedParticipant.initiationCount > 0) {
      fallbacks.push({
        id: 'the-catalyst',
        title: 'The Catalyst',
        emoji: '⚡',
        description: `Ignited new discussions and broke the silence ${selectedParticipant.initiationCount} times.`,
        recipientName: selectedParticipant.name,
        value: `${selectedParticipant.initiationCount} starts`,
      });
    }
    if (selectedParticipant.medianResponseMinutes > 0 && selectedParticipant.medianResponseMinutes <= 5) {
      fallbacks.push({
        id: 'quickdraw',
        title: 'Quickdraw Reflex',
        emoji: '🎯',
        description: 'Maintains rapid response speeds across discussions.',
        recipientName: selectedParticipant.name,
        value: `${selectedParticipant.medianResponseMinutes}m reflex`,
      });
    } else if (selectedParticipant.wordCount / Math.max(1, selectedParticipant.messageCount) > 8) {
      fallbacks.push({
        id: 'orator',
        title: 'Thoughtful Orator',
        emoji: '📜',
        description: 'Prefers deep, complete paragraphs over single-word answers.',
        recipientName: selectedParticipant.name,
        value: `${Math.round(selectedParticipant.wordCount / Math.max(1, selectedParticipant.messageCount))} words/msg`,
      });
    } else {
      fallbacks.push({
        id: 'group-pillar',
        title: 'Group Pillar',
        emoji: '⚓',
        description: `Contributed ${selectedParticipant.percentage}% of total conversation volume.`,
        recipientName: selectedParticipant.name,
        value: `${selectedParticipant.messageCount} msgs`,
      });
    }
    return fallbacks;
  }, [analytics.badges, selectedParticipant]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#23201E]/95 backdrop-blur-md overflow-hidden">
      {/* Top Utility Controls Bar */}
      <header className="w-full shrink-0 px-3 py-2 sm:px-6 sm:py-3 border-b border-white/10 bg-[#1E1B19]/90 backdrop-blur-sm z-30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Row 1: Mode Switcher, Mask, Persona Selector & Mobile Close */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* View Mode Switcher Pill */}
              <div className="flex items-center bg-[#1E1B19] border border-white/10 p-0.5 rounded-full text-xs font-mono shrink-0">
                <button
                  onClick={() => setViewMode('story')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
                    viewMode === 'story'
                      ? 'bg-[#F5F2EB] text-[#1C1917] font-semibold shadow-sm'
                      : 'text-[#A8A29E] hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Story</span>
                </button>
                <button
                  onClick={() => setViewMode('bento')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
                    viewMode === 'bento'
                      ? 'bg-[#F5F2EB] text-[#1C1917] font-semibold shadow-sm'
                      : 'text-[#A8A29E] hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Bento</span>
                </button>
              </div>

              {/* Mask Toggle Pill */}
              <button
                onClick={() => setAnonymize((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#1E1B19] border border-white/10 text-xs font-mono text-[#D6D3D1] hover:text-white transition-colors cursor-pointer shrink-0"
                title="Toggle identity masking"
              >
                {anonymize ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-[#A8A29E]" />}
                <span className="hidden md:inline">{anonymize ? 'Masked' : 'Mask Names'}</span>
              </button>

              {/* "I Am..." Main Character Persona Picker */}
              <SearchableParticipantSelector
                participants={analytics.participants}
                selectedParticipant={selectedUser}
                onSelectParticipant={setSelectedUser}
                theme="dark"
                placeholder="I am: (All)"
                showAllOption
                anonymize={anonymize}
              />
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-full bg-[#1E1B19] border border-white/10 text-[#A8A29E] hover:text-white transition-colors cursor-pointer shrink-0"
              title="Close dossier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
            {/* Copy Card to Clipboard */}
            <button
              onClick={handleCopyCard}
              disabled={isExporting}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E1B19] hover:bg-[#2A2725] border border-white/10 text-white font-mono text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              title="Copy high-res card to clipboard"
            >
              {copyStatus === 'copied' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#A8A29E]" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Native Share Sheet */}
            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                disabled={isExporting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-mono text-xs font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                title="Share directly via WhatsApp or Instagram"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            )}

            {/* Download PNG Button */}
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer ${
                canNativeShare
                  ? 'bg-[#1E1B19] hover:bg-[#2A2725] border border-white/10 text-white'
                  : 'bg-[#16A34A] hover:bg-[#15803D] text-white'
              }`}
              title="Download PNG to disk"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Saving...' : 'Export'}</span>
            </button>

            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className="hidden sm:block p-1.5 rounded-full bg-[#1E1B19] border border-white/10 text-[#A8A29E] hover:text-white transition-colors cursor-pointer shrink-0"
              title="Close dossier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MODE 1: STORY SLIDES (July Fund Editorial 9:16 Story Card)                 */}
      {/* ========================================================================= */}
      {viewMode === 'story' && (
        <div className="relative flex-1 min-h-0 w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div
            id="wrapped-story-card"
            ref={storyCardRef}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="relative w-full max-w-[410px] h-full max-h-[720px] rounded-3xl overflow-hidden bg-[#F5F2EB] border border-[#E7E2D8] flex flex-col justify-between p-4 sm:p-7 select-none shadow-[0_20px_50px_rgba(0,0,0,0.45)] text-[#1C1917]"
          >
            {/* Top Safe-Zone & Progress Bars */}
            <div className="space-y-3 z-20">
              <div className="flex gap-1.5 w-full">
                {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
                  <div key={idx} className="flex-1 h-1 rounded-full bg-[#E5E0D6] overflow-hidden">
                    <div
                      className={`h-full bg-[#1C1917] transition-all duration-300 ${
                        idx < currentSlide ? 'w-full' : idx === currentSlide ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Top Tag & Slide Progress */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest font-bold bg-[#16A34A] text-white">
                  {currentSlide === 0 && 'OVERVIEW'}
                  {currentSlide === 1 && 'TOP VOICE'}
                  {currentSlide === 2 && 'BUSIEST DAY'}
                  {currentSlide === 3 && 'LATE NIGHT'}
                  {currentSlide === 4 && 'REPLY SPEED'}
                  {currentSlide === 5 && 'SUPERLATIVES'}
                </span>

                <div className="flex items-center gap-2">
                  {selectedUser && (
                    <span className="px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[8px] font-mono uppercase font-semibold">
                      {resolveSenderName(selectedUser)}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-[#78716C] tracking-wider">
                    0{currentSlide + 1} / 0{TOTAL_SLIDES}
                  </span>
                </div>
              </div>
            </div>

            {/* Slide Body */}
            <div className="my-auto py-2 z-20">
              {/* SLIDE 1: OVERVIEW / TRAJECTORY */}
              {currentSlide === 0 && (
                <div className="space-y-3.5 text-center">
                  {/* Tap-to-Edit Chat Title */}
                  <div className="relative group inline-block max-w-full">
                    {isEditingTitle ? (
                      <input
                        type="text"
                        value={chatTitle}
                        onChange={(e) => setChatTitle(e.target.value)}
                        onBlur={() => setIsEditingTitle(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                        autoFocus
                        className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal text-center bg-transparent border-b border-[#1C1917] outline-none w-full"
                      />
                    ) : (
                      <h2
                        onClick={() => setIsEditingTitle(true)}
                        className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight leading-tight cursor-pointer hover:opacity-80 flex items-center justify-center gap-1.5"
                        title="Click to customize title"
                      >
                        <span>
                          {selectedParticipant
                            ? `${resolveSenderName(selectedParticipant.name)}'s Wrapped`
                            : chatTitle}
                        </span>
                        <Edit2 className="w-3.5 h-3.5 text-[#78716C] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h2>
                    )}
                  </div>

                  {/* Stamp / Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E2DDD3] text-[10px] font-mono text-[#1C1917]">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span>
                      {selectedParticipant
                        ? `Rank #${selectedParticipantIndex + 1} of ${analytics.participants.length} Members`
                        : groupVibe.title}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {/* Hero Volume Card */}
                    <div className="p-5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] text-center relative overflow-hidden">
                      <span className="inline-block mb-1 px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[9px] font-mono font-semibold uppercase tracking-wider">
                        {selectedParticipant ? 'YOUR ACTIVITY' : 'MESSAGES'}
                      </span>
                      <span className="font-serif text-5xl sm:text-6xl text-[#1C1917] block font-normal tracking-tight my-1">
                        {selectedParticipant
                          ? selectedParticipant.messageCount.toLocaleString()
                          : analytics.totalMessages.toLocaleString()}
                      </span>
                      <span className="text-xs font-mono text-[#78716C] uppercase tracking-wider block">
                        {selectedParticipant ? 'Your Messages Sent' : 'Total Messages Sent'}
                      </span>
                      <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#1C1917]/20 text-[10px] font-mono text-[#1C1917]">
                        {selectedParticipant
                          ? `${selectedParticipant.percentage}% of all group activity`
                          : 'Private On-Device'}
                      </div>
                    </div>

                    {/* Twin Companion Bento Cards */}
                    <div className="grid grid-cols-2 gap-2.5 text-left">
                      <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] flex flex-col justify-between">
                        <span className="inline-block self-start px-2 py-0.5 rounded-full bg-[#16A34A] text-white text-[8px] font-mono font-semibold uppercase tracking-wider mb-2">
                          WORDS
                        </span>
                        <span className="font-serif text-2xl text-[#1C1917] block font-normal leading-none mb-1">
                          {selectedParticipant
                            ? selectedParticipant.wordCount.toLocaleString()
                            : analytics.totalWords.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono text-[#78716C] uppercase">
                          {selectedParticipant
                            ? `Avg ${(selectedParticipant.wordCount / Math.max(1, selectedParticipant.messageCount)).toFixed(0)} words/msg`
                            : 'Words Exchanged'}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] flex flex-col justify-between">
                        <div className="w-6 h-0.5 bg-[#1C1917]/30 mb-2" />
                        <span className="font-serif text-3xl text-[#1C1917] block font-normal leading-none mb-1">
                          {selectedParticipant ? selectedParticipant.initiationCount : analytics.totalDays}
                        </span>
                        <span className="text-[10px] font-mono text-[#78716C] uppercase">
                          {selectedParticipant ? 'Threads Started' : 'Active Days'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-mono text-[#A8A29E] tracking-wider pt-0.5">
                    {analytics.startDate} — {analytics.endDate}
                  </p>
                </div>
              )}

              {/* SLIDE 2: STANDING & CLOSEST BOND */}
              {currentSlide === 1 && (
                <div className="space-y-4 text-center">
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight leading-tight">
                    {selectedParticipant ? 'Your Standing & Bond' : 'Top Voice'}
                  </h2>
                  <p className="text-xs text-[#78716C] font-serif italic max-w-xs mx-auto">
                    {selectedParticipant
                      ? 'Your share of the room and your closest conversational ally.'
                      : 'The defining voice leading the group conversation.'}
                  </p>

                  {selectedParticipant ? (
                    <div className="space-y-2.5 pt-2">
                      {/* Dark Personal Rank & Share Card */}
                      <div className="p-5 rounded-2xl bg-[#1C1917] text-[#F5F2EB] border border-black/10 text-left relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full bg-[#6366F1] text-white text-[9px] font-mono font-semibold uppercase tracking-wider">
                            RANK · 0{selectedParticipantIndex + 1}
                          </span>
                          <span className="font-serif text-3xl font-light text-[#FACC15]">
                            {selectedParticipant.percentage}%
                          </span>
                        </div>

                        <h3 className="font-serif text-2xl font-normal text-white mb-1 truncate">
                          {resolveSenderName(selectedParticipant.name)}
                        </h3>
                        <p className="text-xs font-mono text-[#A8A29E] mb-3">
                          {selectedParticipant.messageCount.toLocaleString()} messages sent out of {analytics.totalMessages.toLocaleString()}
                        </p>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono text-white/80">
                          <span>{selectedParticipantIndex === 0 ? 'Top Contributor' : `Rank #${selectedParticipantIndex + 1} Voice`}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      {/* Closest Bond & Synergy Bento */}
                      <div className="grid grid-cols-2 gap-2.5 text-left">
                        <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] flex flex-col justify-between">
                          <span className="inline-block self-start px-2 py-0.5 rounded-full bg-[#16A34A] text-white text-[8px] font-mono font-semibold uppercase tracking-wider mb-2">
                            CLOSEST BOND
                          </span>
                          <span className="font-serif text-base font-normal text-[#1C1917] truncate mb-0.5">
                            {topBond ? resolveSenderName(topBond.partner) : 'Whole Group'}
                          </span>
                          <span className="text-[10px] font-mono text-[#78716C]">
                            {topBond ? `${topBond.exchangeCount} direct replies` : 'Evenly active'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] flex flex-col justify-between">
                          <span className="inline-block self-start px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[8px] font-mono font-semibold uppercase tracking-wider mb-2">
                            SYNERGY
                          </span>
                          <span className="font-serif text-base font-normal text-[#1C1917] truncate mb-0.5">
                            {topBond ? topBond.synergyLabel : 'Balanced Talk'}
                          </span>
                          <span className="text-[10px] font-mono text-[#78716C]">
                            {topBond ? `~${topBond.avgLatencyMinutes}m speed` : `${selectedParticipant.medianResponseMinutes}m reflex`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : topSpeaker && (
                    <div className="space-y-2.5 pt-2">
                      <div className="p-5 rounded-2xl bg-[#1C1917] text-[#F5F2EB] border border-black/10 text-left relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full bg-[#6366F1] text-white text-[9px] font-mono font-semibold uppercase tracking-wider">
                            RANK · 01
                          </span>
                          <span className="font-serif text-3xl font-light text-[#FACC15]">
                            {topSpeaker.percentage}%
                          </span>
                        </div>

                        <h3 className="font-serif text-2xl font-normal text-white mb-1 truncate">
                          {getDisplayName(topSpeaker.name, 0)}
                        </h3>
                        <p className="text-xs font-mono text-[#A8A29E] mb-3">
                          {topSpeaker.messageCount.toLocaleString()} total messages sent
                        </p>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono text-white/80">
                          <span>Top Contributor</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-left">
                        {runnerUps.map((p, idx) => (
                          <div
                            key={p.name}
                            className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] flex flex-col justify-between"
                          >
                            <span className="inline-block self-start px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[8px] font-mono font-semibold uppercase tracking-wider mb-2">
                              RANK 0{idx + 2}
                            </span>
                            <span className="font-serif text-base font-normal text-[#1C1917] truncate mb-0.5">
                              {getDisplayName(p.name, idx + 1)}
                            </span>
                            <span className="text-[10px] font-mono text-[#78716C]">
                              {p.messageCount.toLocaleString()} msgs ({p.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SLIDE 3: TEXTING STYLE / HABITS */}
              {currentSlide === 2 && (
                <div className="space-y-4 text-center">
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight leading-tight">
                    {selectedParticipant ? 'Your Texting Style' : 'Busiest Day'}
                  </h2>
                  <p className="text-xs text-[#78716C] font-serif italic max-w-xs mx-auto">
                    {selectedParticipant
                      ? 'How you structure thoughts, break the ice, and follow up.'
                      : 'The single day with the highest conversation volume.'}
                  </p>

                  {selectedParticipant ? (
                    <div className="space-y-2.5 pt-2">
                      <div className="p-5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] text-center">
                        <div className="w-8 h-0.5 bg-[#1C1917]/20 mx-auto mb-2" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] block mb-1">
                          AVERAGE MESSAGE LENGTH
                        </span>
                        <span className="font-serif text-5xl sm:text-6xl text-[#1C1917] block font-normal tracking-tight my-1">
                          {(selectedParticipant.wordCount / Math.max(1, selectedParticipant.messageCount)).toFixed(1)}
                        </span>
                        <span className="text-xs font-mono text-[#78716C] uppercase tracking-wider block mb-3">
                          Words Per Message
                        </span>
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#1C1917]/20 text-[10px] font-mono text-[#1C1917]">
                          {selectedParticipant.wordCount / Math.max(1, selectedParticipant.messageCount) > 8
                            ? 'The Novelist · Deep & Thoughtful'
                            : 'The Snappy Texter · Quick & Punchy'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-left">
                        <div className="p-3.5 rounded-2xl bg-[#FACC15] text-[#1C1917] border border-[#EAB308] flex flex-col justify-between">
                          <span className="inline-block self-start px-2 py-0.5 rounded-full bg-[#1C1917] text-[#FACC15] text-[8px] font-mono font-bold uppercase tracking-wider mb-2">
                            INITIATIONS
                          </span>
                          <span className="font-serif text-2xl font-normal text-[#1C1917] leading-none mb-1">
                            {selectedParticipant.initiationCount}
                          </span>
                          <span className="text-[10px] font-mono text-[#1C1917]/80">Conversations started</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] flex flex-col justify-between">
                          <span className="inline-block self-start px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[8px] font-mono font-semibold uppercase tracking-wider mb-2">
                            DOUBLE TEXTS
                          </span>
                          <span className="font-serif text-2xl font-normal text-[#1C1917] leading-none mb-1">
                            {selectedParticipant.doubleTextCount}
                          </span>
                          <span className="text-[10px] font-mono text-[#78716C]">Back-to-back texts</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 pt-2">
                      <div className="p-5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] text-center">
                        <div className="w-8 h-0.5 bg-[#1C1917]/20 mx-auto mb-2" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] block mb-1">
                          {analytics.peakDay.formattedDate || 'Record Day'}
                        </span>
                        <span className="font-serif text-5xl sm:text-6xl text-[#1C1917] block font-normal tracking-tight my-1">
                          {analytics.peakDay.count.toLocaleString()}
                        </span>
                        <span className="text-xs font-mono text-[#78716C] uppercase tracking-wider block mb-3">
                          Messages in 24 Hours
                        </span>
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#1C1917]/20 text-[10px] font-mono text-[#1C1917]">
                          Record Activity
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FACC15] text-[#1C1917] border border-[#EAB308] text-left flex items-center justify-between">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#1C1917] text-[#FACC15] text-[8px] font-mono font-bold uppercase tracking-wider mb-1">
                            SURGE
                          </span>
                          <h4 className="font-serif text-lg font-medium leading-tight text-[#1C1917]">
                            Conversation Peak
                          </h4>
                          <p className="text-[11px] font-serif text-[#1C1917]/80">
                            Volume reached {Math.round((analytics.peakDay.count / Math.max(1, analytics.totalMessages / Math.max(1, analytics.totalDays))) * 10) / 10}x typical daily average.
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-black/20 flex items-center justify-center shrink-0 ml-3">
                          <Sparkles className="w-4 h-4 text-black" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SLIDE 4: NOCTURNAL / ACTIVE CLOCK */}
              {currentSlide === 3 && (
                <div className="space-y-4 text-center">
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight leading-tight">
                    {selectedParticipant ? 'Your After-Hours Clock' : 'Late Night Hours'}
                  </h2>
                  <p className="text-xs text-[#78716C] font-serif italic max-w-xs mx-auto">
                    {selectedParticipant
                      ? 'Your texting habits between midnight and dawn.'
                      : 'Thoughts, banter, and replies sent between midnight and 5:00 AM.'}
                  </p>

                  {selectedParticipant ? (
                    <div className="space-y-2.5 pt-2">
                      <div className="p-5 rounded-2xl bg-[#0F172A] text-white border border-[#1E293B] text-center relative overflow-hidden">
                        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
                          <Cloud className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-serif text-5xl sm:text-6xl text-white block font-normal tracking-tight my-1">
                          {selectedParticipant.nightOwlCount.toLocaleString()}
                        </span>
                        <span className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider block mb-3">
                          Your Late-Night Texts (12 AM – 5 AM)
                        </span>
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono text-white/80">
                          {selectedParticipant.nightOwlCount > selectedParticipant.earlyBirdCount
                            ? 'Nocturnal Chat Habit'
                            : 'Normal Daylight Sleeper'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-left">
                        <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] flex flex-col justify-between">
                          <span className="inline-block self-start px-2 py-0.5 rounded-full bg-[#6366F1] text-white text-[8px] font-mono font-semibold uppercase tracking-wider mb-2">
                            SUNRISE (5–8 AM)
                          </span>
                          <span className="font-serif text-2xl font-normal text-[#1C1917] leading-none mb-1">
                            {selectedParticipant.earlyBirdCount}
                          </span>
                          <span className="text-[10px] font-mono text-[#78716C]">Early morning texts</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] flex flex-col justify-between">
                          <span className="inline-block self-start px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[8px] font-mono font-semibold uppercase tracking-wider mb-2">
                            NIGHT RATIO
                          </span>
                          <span className="font-serif text-2xl font-normal text-[#1C1917] leading-none mb-1">
                            {selectedParticipant.messageCount > 0
                              ? Math.round((selectedParticipant.nightOwlCount / selectedParticipant.messageCount) * 100)
                              : 0}%
                          </span>
                          <span className="text-[10px] font-mono text-[#78716C]">Of your total messages</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 pt-2">
                      <div className="p-5 rounded-2xl bg-[#0F172A] text-white border border-[#1E293B] text-center relative overflow-hidden">
                        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
                          <Cloud className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-serif text-5xl sm:text-6xl text-white block font-normal tracking-tight my-1">
                          {analytics.lateNightTotal.toLocaleString()}
                        </span>
                        <span className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider block mb-3">
                          Messages Sent After Midnight
                        </span>
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono text-white/80">
                          Late-Night Chat
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-left">
                        {analytics.participants
                          .filter((p) => p.nightOwlCount > 0)
                          .slice(0, 2)
                          .map((p, idx) => (
                            <div
                              key={p.name}
                              className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] flex flex-col justify-between"
                            >
                              <span className="inline-block self-start px-2 py-0.5 rounded-full bg-[#6366F1] text-white text-[8px] font-mono font-semibold uppercase tracking-wider mb-2">
                                NIGHT OWL
                              </span>
                              <span className="font-serif text-base font-normal text-[#1C1917] truncate mb-0.5">
                                {getDisplayName(p.name, idx)}
                              </span>
                              <span className="text-[10px] font-mono text-[#78716C]">
                                {p.nightOwlCount} late-night texts
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SLIDE 5: REFLEX SPEED & PACING */}
              {currentSlide === 4 && (
                <div className="space-y-4 text-center">
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight leading-tight">
                    {selectedParticipant ? 'Your Reply Reflex' : 'Pacing & Replies'}
                  </h2>
                  <p className="text-xs text-[#78716C] font-serif italic max-w-xs mx-auto">
                    {selectedParticipant
                      ? 'How quickly you answer compared to the group.'
                      : 'Comparing the fastest responder with the most thoughtful thinker.'}
                  </p>

                  {selectedParticipant ? (
                    <div className="space-y-2.5 pt-2">
                      <div className="p-5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] text-left">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-[#16A34A] text-white text-[9px] font-mono font-semibold uppercase tracking-wider">
                            YOUR REFLEX SPEED
                          </span>
                          <span className="font-serif text-3xl font-normal text-[#1C1917]">
                            {selectedParticipant.medianResponseMinutes}m
                          </span>
                        </div>
                        <h3 className="font-serif text-xl text-[#1C1917] mb-1">
                          {selectedParticipant.medianResponseMinutes <= 3
                            ? 'Lightning Quick Responder'
                            : selectedParticipant.medianResponseMinutes <= 12
                            ? 'Dependable Response Pace'
                            : 'Thoughtful & Unhurried Pacer'}
                        </h3>
                        <p className="text-[11px] font-serif text-[#78716C] mb-2">
                          Faster reflex than ~{reflexPercentile}% of chat participants who reply in this group.
                        </p>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#1C1917]/20 text-[9px] font-mono text-[#1C1917]">
                          Median Reflex: {selectedParticipant.medianResponseMinutes} min
                        </div>
                      </div>

                      {quickestReplier && (
                        <div className="p-4 rounded-2xl bg-[#1C1917] text-white border border-black/10 text-left flex items-center justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[8px] font-mono font-semibold uppercase tracking-wider mb-1 inline-block">
                              {quickestReplier.name === selectedParticipant.name ? 'YOU LEAD THE CHAT' : 'FASTEST IN CHAT'}
                            </span>
                            <h4 className="font-serif text-lg font-normal text-white truncate">
                              {resolveSenderName(quickestReplier.name)}
                            </h4>
                            <p className="text-[10px] font-mono text-[#A8A29E]">
                              Answers in ~{quickestReplier.medianResponseMinutes}m on average
                            </p>
                          </div>
                          <span className="font-serif text-2xl font-light text-[#FACC15] shrink-0 ml-3">
                            {quickestReplier.medianResponseMinutes}m
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5 pt-2">
                      {quickestReplier && (
                        <div className="p-4 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] text-left">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-[#16A34A] text-white text-[9px] font-mono font-semibold uppercase tracking-wider">
                              FASTEST TO REPLY
                            </span>
                            <span className="font-serif text-2xl font-normal text-[#1C1917]">
                              {quickestReplier.medianResponseMinutes}m
                            </span>
                          </div>
                          <h3 className="font-serif text-xl text-[#1C1917] mb-1 truncate">
                            {getDisplayName(quickestReplier.name, 0)}
                          </h3>
                          <p className="text-[11px] font-serif text-[#78716C] mb-2">
                            Median time to reply to messages across the whole chat.
                          </p>
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#1C1917]/20 text-[9px] font-mono text-[#1C1917]">
                            Rapid Responder
                          </div>
                        </div>
                      )}

                      {slowestReplier && slowestReplier.name !== quickestReplier?.name && (
                        <div className="p-4 rounded-2xl bg-[#1C1917] text-white border border-black/10 text-left">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[9px] font-mono font-semibold uppercase tracking-wider">
                              TAKES THEIR TIME
                            </span>
                            <span className="font-serif text-2xl font-normal text-white">
                              {slowestReplier.medianResponseMinutes}m
                            </span>
                          </div>
                          <h3 className="font-serif text-xl text-white mb-1 truncate">
                            {getDisplayName(slowestReplier.name, 1)}
                          </h3>
                          <p className="text-[11px] font-serif text-[#A8A29E] mb-2">
                            Takes their time to craft thoughtful, unhurried replies.
                          </p>
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-white/20 text-[9px] font-mono text-white/80">
                            Thoughtful Responder
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SLIDE 6: ACCOLADES & SIGNATURE EMOJIS */}
              {currentSlide === 5 && (
                <div className="space-y-3.5 text-center">
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight leading-tight">
                    {selectedParticipant ? 'Your Accolades & Emojis' : 'Chat Superlatives'}
                  </h2>
                  <p className="text-xs text-[#78716C] font-serif italic max-w-xs mx-auto">
                    {selectedParticipant
                      ? 'Badges you earned and your most iconic signature emojis.'
                      : 'Special badges earned through timing, habit, and chat personality.'}
                  </p>

                  {selectedParticipant ? (
                    <div className="space-y-2.5 pt-1">
                      {/* Personal Accolade Badges */}
                      <div className="grid grid-cols-2 gap-2 text-left">
                        {personalBadges.slice(0, 2).map((badge, idx) => (
                          <div
                            key={badge.id}
                            className={`p-3 rounded-2xl ${
                              idx === 0
                                ? 'bg-[#15803D] text-white border border-[#166534]'
                                : 'bg-[#1C1917] text-white border border-black/10'
                            } flex flex-col justify-between`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider bg-white/20 text-white">
                                ACCOLADE 0{idx + 1}
                              </span>
                              <span className="text-base">{badge.emoji}</span>
                            </div>
                            <h4 className="font-serif text-sm font-medium leading-tight text-white mb-0.5">
                              {badge.title}
                            </h4>
                            <p className="text-[9px] font-serif text-white/80 line-clamp-2">
                              {badge.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Top Emojis Card */}
                      <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] text-left">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-[#78716C] font-semibold">
                            YOUR SIGNATURE EMOJIS
                          </span>
                          <span className="text-[9px] font-mono text-[#78716C]">
                            {selectedParticipant.topEmojis.reduce((acc, e) => acc + e.count, 0)} emoji reactions
                          </span>
                        </div>

                        {selectedParticipant.topEmojis.length > 0 ? (
                          <div className="flex items-center justify-around py-1">
                            {selectedParticipant.topEmojis.slice(0, 4).map((item, idx) => (
                              <div key={idx} className="flex flex-col items-center">
                                <span className="text-2xl mb-1 filter drop-shadow-sm">{item.emoji}</span>
                                <span className="text-[9px] font-mono font-medium text-[#1C1917] bg-white/60 px-2 py-0.5 rounded-full">
                                  {item.count}x
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-serif italic text-[#78716C] text-center py-2">
                            Words over symbols — no heavy emoji usage detected!
                          </p>
                        )}
                      </div>

                      {/* Share & Download Row */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={handleCopyCard}
                          className="flex-1 py-2.5 px-3 rounded-full bg-[#EFECE6] hover:bg-[#EAE5DB] text-[#1C1917] border border-[#E2DDD3] font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copyStatus === 'copied' ? 'Copied!' : 'Copy Card'}</span>
                        </button>

                        <button
                          onClick={canNativeShare ? handleNativeShare : handleDownload}
                          className="flex-1 py-2.5 px-3 rounded-full bg-[#1C1917] hover:bg-[#2E2A27] text-white font-mono text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                        >
                          {canNativeShare ? <Share2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                          <span>{canNativeShare ? 'Share to Story' : 'Download Card'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-2 text-left pt-1">
                        {analytics.badges.slice(0, 4).map((badge, idx) => {
                          const cardStyles = [
                            { bg: 'bg-[#EFECE6]', text: 'text-[#1C1917]', pillBg: 'bg-[#EA580C]', border: 'border-[#E2DDD3]' },
                            { bg: 'bg-[#15803D]', text: 'text-white', pillBg: 'bg-white text-[#15803D]', border: 'border-[#166534]' },
                            { bg: 'bg-[#FACC15]', text: 'text-[#1C1917]', pillBg: 'bg-[#1C1917] text-[#FACC15]', border: 'border-[#EAB308]' },
                            { bg: 'bg-[#312E81]', text: 'text-white', pillBg: 'bg-[#6366F1] text-white', border: 'border-[#3730A3]' },
                          ][idx % 4];

                          return (
                            <div
                              key={badge.id}
                              className={`p-3 rounded-2xl ${cardStyles.bg} ${cardStyles.border} border flex flex-col justify-between`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider ${cardStyles.pillBg}`}>
                                  BADGE 0{idx + 1}
                                </span>
                                {idx === 1 && <span className="text-[10px] tracking-widest text-white/80">● ● ●</span>}
                              </div>
                              <div>
                                <h4 className={`font-serif text-sm font-medium leading-tight truncate ${cardStyles.text}`}>
                                  {badge.title}
                                </h4>
                                <p className={`text-[10px] font-mono truncate mt-0.5 opacity-80 ${cardStyles.text}`}>
                                  {getDisplayName(badge.recipientName, idx)}
                                </p>
                              </div>
                              <p className={`text-[9px] font-serif line-clamp-2 mt-1.5 opacity-70 ${cardStyles.text}`}>
                                {badge.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Share & Download Row */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={handleCopyCard}
                          className="flex-1 py-2.5 px-3 rounded-full bg-[#EFECE6] hover:bg-[#EAE5DB] text-[#1C1917] border border-[#E2DDD3] font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copyStatus === 'copied' ? 'Copied!' : 'Copy Card'}</span>
                        </button>

                        <button
                          onClick={canNativeShare ? handleNativeShare : handleDownload}
                          className="flex-1 py-2.5 px-3 rounded-full bg-[#1C1917] hover:bg-[#2E2A27] text-white font-mono text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                        >
                          {canNativeShare ? <Share2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                          <span>{canNativeShare ? 'Share to Story' : 'Download Card'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Metadata (Safe-Zone Respected) */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E0D6] text-[10px] font-mono text-[#78716C] z-20">
              <span className="tracking-wider">WHATSAPP WRAPPED</span>
              <span>100% PRIVATE & ON-DEVICE</span>
            </div>

            {/* Tap Navigation Zones */}
            <div
              onClick={prevSlide}
              className="absolute left-0 top-14 bottom-14 w-1/3 z-10 cursor-pointer"
              title="Previous slide"
            />
            <div
              onClick={nextSlide}
              className="absolute right-0 top-14 bottom-14 w-2/3 z-10 cursor-pointer"
              title="Next slide"
            />
          </div>

          {/* Desktop Arrow Buttons */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="hidden md:flex absolute left-8 p-3 rounded-full bg-[#1E1B19] border border-white/10 text-white hover:bg-[#2A2725] disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === TOTAL_SLIDES - 1}
            className="hidden md:flex absolute right-8 p-3 rounded-full bg-[#1E1B19] border border-white/10 text-white hover:bg-[#2A2725] disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: BENTO DOSSIER BOARD (Full Poster Experience with Personalization)  */}
      {/* ========================================================================= */}
      {viewMode === 'bento' && (
        <div className="flex-1 min-h-0 w-full overflow-y-auto py-4 px-2 sm:px-6 custom-scrollbar flex justify-center">
          <div
            ref={bentoBoardRef}
            className="w-full max-w-4xl p-4 sm:p-8 md:p-10 rounded-3xl bg-[#262320] border border-white/10 text-[#F5F2EB] space-y-5 sm:space-y-6 select-none my-auto"
          >
            {/* Header Hero Card */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#F5F2EB] text-[#1C1917] border border-[#E7E2D8] text-center relative">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-[#16A34A] text-white text-[9px] font-mono font-bold uppercase tracking-widest">
                  ARCHIVE
                </span>
                <span className="inline-block px-3 py-1 rounded-full bg-[#FACC15] text-[#1C1917] text-[9px] font-mono font-bold uppercase tracking-wider">
                  {groupVibe.title}
                </span>
              </div>

              {/* Editable Title */}
              <div className="relative group inline-block max-w-full">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={chatTitle}
                    onChange={(e) => setChatTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    autoFocus
                    className="font-serif text-4xl sm:text-6xl text-[#1C1917] font-normal text-center bg-transparent border-b-2 border-[#1C1917] outline-none w-full mb-3"
                  />
                ) : (
                  <h1
                    onClick={() => setIsEditingTitle(true)}
                    className="font-serif text-4xl sm:text-6xl text-[#1C1917] font-normal tracking-tight mb-3 cursor-pointer hover:opacity-80 inline-flex items-center gap-2"
                    title="Click to customize title"
                  >
                    <span>{selectedUser ? `${resolveSenderName(selectedUser)}'s Dossier` : chatTitle}</span>
                    <Edit2 className="w-4 h-4 text-[#78716C] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h1>
                )}
              </div>

              <div className="max-w-md mx-auto text-xs font-serif text-[#57534E] leading-relaxed mb-6">
                <span className="font-mono text-[10px] uppercase tracking-wider block font-semibold text-[#1C1917] mb-1">
                  About
                </span>
                {groupVibe.tagline}. A breakdown of your conversation volume, reply speeds, late-night chats, and group superlatives.
              </div>

              {/* Control Pill */}
              <div className="inline-flex items-center bg-[#E5E0D6] p-1 rounded-full text-[10px] font-mono">
                <button
                  onClick={() => setViewMode('story')}
                  className="px-3 py-1 rounded-full text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                >
                  Slides
                </button>
                <span className="px-3 py-1 rounded-full bg-[#1C1917] text-white font-medium shadow-sm">
                  Full Bento
                </span>
              </div>
            </div>

            {/* Personal Main-Character Highlight Card (When user selects "I am...") */}
            {selectedParticipant && (
              <div className="p-6 rounded-2xl bg-[#EA580C] text-white border border-[#C2410C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[#EA580C] text-[8px] font-mono font-bold uppercase tracking-wider block self-start mb-2">
                    PERSONAL STORY · RANK #{selectedParticipantIndex + 1}
                  </span>
                  <h3 className="font-serif text-3xl font-normal text-white">
                    {resolveSenderName(selectedParticipant.name)}
                  </h3>
                  <p className="text-xs font-serif text-orange-100 mt-1">
                    Sent {selectedParticipant.messageCount.toLocaleString()} messages ({selectedParticipant.percentage}% of the chat).{' '}
                    {selectedParticipant.medianResponseMinutes > 0 ? `Replies in ~${selectedParticipant.medianResponseMinutes} minutes on average.` : 'Replies almost instantly.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-mono">
                    {selectedParticipant.initiationCount} Started Conversations
                  </span>
                </div>
              </div>
            )}

            {/* Bento Grid: 3 Columns of Editorial Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Row 1, Col 1: Top Speaker Card */}
              {topSpeaker && (
                <div className="p-6 rounded-2xl bg-[#EFECE6] text-[#1C1917] border border-[#E2DDD3] flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EA580C] text-white text-[8px] font-mono font-bold uppercase tracking-wider mb-3">
                      RANK · 01
                    </span>
                    <h3 className="font-serif text-2xl font-normal text-[#1C1917] mb-1 truncate">
                      {getDisplayName(topSpeaker.name, 0)}
                    </h3>
                    <p className="text-xs font-serif text-[#57534E] leading-relaxed mb-4">
                      Sent {topSpeaker.messageCount.toLocaleString()} messages, contributing {topSpeaker.percentage}% of everything said in the group.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 self-start px-3 py-1 rounded-full border border-black/20 text-[10px] font-mono text-[#1C1917]">
                    Top Voice
                  </div>
                </div>
              )}

              {/* Row 1, Col 2: Runner-up Speaker Card */}
              {runnerUps[0] && (
                <div className="p-6 rounded-2xl bg-[#EFECE6] text-[#1C1917] border border-[#E2DDD3] flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EA580C] text-white text-[8px] font-mono font-bold uppercase tracking-wider mb-3">
                      RANK · 02
                    </span>
                    <h3 className="font-serif text-2xl font-normal text-[#1C1917] mb-1 truncate">
                      {getDisplayName(runnerUps[0].name, 1)}
                    </h3>
                    <p className="text-xs font-serif text-[#57534E] leading-relaxed mb-4">
                      Sent {runnerUps[0].messageCount.toLocaleString()} messages ({runnerUps[0].percentage}% of chat), keeping the conversation lively.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 self-start px-3 py-1 rounded-full border border-black/20 text-[10px] font-mono text-[#1C1917]">
                    Active Voice
                  </div>
                </div>
              )}

              {/* Row 1, Col 3: Words Exchanged Card */}
              <div className="p-6 rounded-2xl bg-[#1C1917] text-white border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white text-[8px] font-mono font-bold uppercase tracking-wider mb-3">
                    WORDS
                  </span>
                  <span className="font-serif text-3xl font-light text-white block mb-1">
                    {analytics.totalWords.toLocaleString()}
                  </span>
                  <h3 className="font-serif text-xl font-normal text-white/90 mb-1">
                    Total Words Exchanged
                  </h3>
                  <p className="text-xs font-serif text-stone-400 leading-relaxed mb-4">
                    Averaging {Math.round(analytics.totalWords / Math.max(1, analytics.totalMessages))} words per message across all participants.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 self-start px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono text-white/80">
                  Vocabulary
                </div>
              </div>

              {/* Row 2, Col 1: Trends Card */}
              <div className="p-6 rounded-2xl bg-[#6366F1] text-white border border-[#4F46E5] flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                    <span className="text-white text-xs">▶</span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[8px] font-mono font-bold uppercase tracking-wider mb-2">
                    TRENDS
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-white mb-2">
                    Total Messages
                  </h3>
                  <p className="text-xs font-serif text-indigo-100 leading-relaxed mb-4">
                    {analytics.totalMessages.toLocaleString()} messages sent across {analytics.totalDays} active days.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 self-start px-3 py-1 rounded-full border border-white/30 text-[10px] font-mono text-white">
                  Trajectory
                </div>
              </div>

              {/* Row 2, Col 2: Ambient Date Range Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FAF5EE] to-[#E5DEC9] text-[#1C1917] border border-[#D5CDBC] flex flex-col items-center justify-center text-center">
                <Clock className="w-5 h-5 text-[#1C1917]/50 mb-2" />
                <h4 className="font-serif text-xl font-normal text-[#1C1917]">
                  Conversation Span
                </h4>
                <p className="text-xs font-mono text-[#57534E] mt-1">
                  {analytics.startDate}
                </p>
                <span className="text-[10px] font-mono text-[#78716C]">— to —</span>
                <p className="text-xs font-mono text-[#57534E]">
                  {analytics.endDate}
                </p>
              </div>

              {/* Row 2, Col 3: Synthesis School Dark Card */}
              <div className="p-6 rounded-2xl bg-[#111111] text-white border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white text-[8px] font-mono font-bold uppercase tracking-wider mb-3">
                    PEAK 24H
                  </span>
                  <span className="font-serif text-3xl font-light text-white block mb-1">
                    {analytics.peakDay.count.toLocaleString()} msgs
                  </span>
                  <p className="text-xs font-serif text-stone-400 leading-relaxed mb-4">
                    Highest single day recorded on {analytics.peakDay.formattedDate || 'Record day'}.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 self-start px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono text-white/80">
                  Record Day
                </div>
              </div>

              {/* Row 3, Col 1: Calendar Tile */}
              <div className="p-6 rounded-2xl bg-[#F5F2EB] text-[#1C1917] border border-[#E7E2D8] flex flex-col justify-between">
                <div>
                  <div className="w-8 h-0.5 bg-[#1C1917]/20 mb-3" />
                  <span className="font-serif text-6xl font-light text-[#1C1917] block mb-1">
                    {analytics.totalDays}
                  </span>
                  <span className="text-xs font-mono text-[#78716C] uppercase tracking-wider block">
                    Active Days in Chat
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 self-start px-3 py-1 rounded-full border border-black/20 text-[10px] font-mono text-[#1C1917]">
                  Calendar Span
                </div>
              </div>

              {/* Row 3, Col 2: Sunflower Yellow Card */}
              <div className="p-6 rounded-2xl bg-[#FACC15] text-[#1C1917] border border-[#EAB308] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#1C1917] text-[#FACC15] text-[8px] font-mono font-bold uppercase tracking-wider">
                      SURGE
                    </span>
                    <Sparkles className="w-4 h-4 text-black" />
                  </div>
                  <h3 className="font-serif text-2xl font-medium text-[#1C1917] mb-2 leading-tight">
                    Daily Pace
                  </h3>
                  <p className="text-xs font-serif text-[#1C1917]/80 leading-relaxed mb-4">
                    Averaged {Math.round(analytics.totalMessages / Math.max(1, analytics.totalDays))} messages daily across the group.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 self-start px-3 py-1 rounded-full border border-black/20 text-[10px] font-mono text-[#1C1917]">
                  Pace
                </div>
              </div>

              {/* Row 3, Col 3: Midnight Cloud Card */}
              <div className="p-6 rounded-2xl bg-[#0F172A] text-white border border-[#1E293B] flex flex-col justify-between">
                <div>
                  <Cloud className="w-6 h-6 text-white/70 mb-3" />
                  <h3 className="font-serif text-2xl font-normal text-white mb-1">
                    Late Night Hours
                  </h3>
                  <p className="text-xs font-serif text-slate-300 leading-relaxed mb-4">
                    {analytics.lateNightTotal.toLocaleString()} messages sent in the late hours between midnight and 5:00 AM.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 self-start px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono text-white/80">
                  Late Night
                </div>
              </div>

              {/* Row 4, Col 1: Kelly Green Card */}
              <div className="p-6 rounded-2xl bg-[#15803D] text-white border border-[#166534] flex flex-col justify-between">
                <div>
                  <div className="text-white text-base tracking-widest font-bold mb-3">
                    ● ● ●
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white text-[#15803D] text-[8px] font-mono font-bold uppercase tracking-wider mb-2">
                    SPEED
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-white mb-2">
                    Fastest to Reply
                  </h3>
                  {quickestReplier && (
                    <p className="text-xs font-serif text-emerald-100 leading-relaxed mb-4">
                      {getDisplayName(quickestReplier.name, 0)} replies within ~{quickestReplier.medianResponseMinutes} minutes on average.
                    </p>
                  )}
                </div>
                <div className="inline-flex items-center gap-1 self-start px-3 py-1 rounded-full border border-white/30 text-[10px] font-mono text-white">
                  Quick Reflex
                </div>
              </div>

              {/* Row 4, Col 2: Thoughtful Responder Card */}
              <div className="p-6 rounded-2xl bg-[#EFECE6] text-[#1C1917] border border-[#E2DDD3] flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EA580C] text-white text-[8px] font-mono font-bold uppercase tracking-wider mb-3">
                    DELIBERATE
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-[#1C1917] mb-2">
                    Thoughtful Responder
                  </h3>
                  {slowestReplier && (
                    <p className="text-xs font-serif text-[#57534E] leading-relaxed mb-4">
                      {getDisplayName(slowestReplier.name, 1)} takes ~{slowestReplier.medianResponseMinutes} minutes on average to send a thoughtful reply.
                    </p>
                  )}
                </div>
                <div className="inline-flex items-center gap-1 self-start px-3 py-1 rounded-full border border-black/20 text-[10px] font-mono text-[#1C1917]">
                  Thoughtful
                </div>
              </div>

              {/* Row 4, Col 3: Accolades Badges Card */}
              <div className="p-6 rounded-2xl bg-[#312E81] text-white border border-[#3730A3] flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#6366F1] text-white text-[8px] font-mono font-bold uppercase tracking-wider mb-3">
                    HONORS
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-white mb-2">
                    Chat Superlatives
                  </h3>
                  <p className="text-xs font-serif text-indigo-200 leading-relaxed mb-4">
                    {analytics.badges.length} badges earned by group members based on chat habits and personalities.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 self-start px-3 py-1 rounded-full border border-white/30 text-[10px] font-mono text-white">
                  Superlatives
                </div>
              </div>
            </div>

            {/* Footer Card with 1-Tap Copy & Export Controls */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#F5F2EB] text-[#1C1917] border border-[#E7E2D8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] block">
                  Private On-Device Summary
                </span>
                <h4 className="font-serif text-lg font-medium text-[#1C1917]">
                  100% Private (On-Device)
                </h4>
                <p className="text-xs font-serif text-[#57534E]">
                  Zero cloud telemetry · Zero external servers · Your chat never leaves this device.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCard}
                  className="px-4 py-2.5 rounded-full bg-[#EFECE6] hover:bg-[#EAE5DB] text-[#1C1917] border border-[#E2DDD3] font-mono text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copyStatus === 'copied' ? 'Copied to Clipboard!' : 'Copy Poster'}</span>
                </button>

                <button
                  onClick={canNativeShare ? handleNativeShare : handleDownload}
                  className="px-6 py-2.5 rounded-full bg-[#1C1917] hover:bg-[#2E2A27] text-white font-mono text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {canNativeShare ? <Share2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  <span>{canNativeShare ? 'Share Full Poster' : 'Export Full Poster'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
