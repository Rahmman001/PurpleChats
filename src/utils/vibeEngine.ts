import { ChatAnalytics } from '../types/chat';

export interface GroupVibe {
  title: string;
  tagline: string;
  pillColor: string;
}

/**
 * Derives a flattering, culturally witty group dynamic archetype
 * based on conversational velocity, diurnal timing, lexicon, and media density.
 */
export function computeGroupVibe(analytics: ChatAnalytics): GroupVibe {
  const totalMsgs = Math.max(1, analytics.totalMessages);
  const lateNightPct = Math.round((analytics.lateNightTotal / totalMsgs) * 100);
  const msgsPerDay = Math.round(analytics.totalMessages / Math.max(1, analytics.totalDays));
  const wordsPerMsg = Math.round(analytics.totalWords / totalMsgs);
  const mediaPct = Math.round((analytics.totalMedia / totalMsgs) * 100);

  // 1. High late night proportion (> 18%)
  if (lateNightPct >= 18) {
    return {
      title: 'Nocturnal Think Tank',
      tagline: `${lateNightPct}% of all messages sent after midnight`,
      pillColor: 'bg-[#6366F1] text-white',
    };
  }

  // 2. High velocity (> 80 messages per day)
  if (msgsPerDay >= 80) {
    return {
      title: 'High-Velocity Frequency',
      tagline: `Fast-moving conversation averaging ${msgsPerDay} messages every day`,
      pillColor: 'bg-[#EA580C] text-white',
    };
  }

  // 3. High visual/media ratio (> 20%)
  if (mediaPct >= 20) {
    return {
      title: 'Visual Chaos Matrix',
      tagline: `${mediaPct}% of messages are photos, voice notes, or media`,
      pillColor: 'bg-[#15803D] text-white',
    };
  }

  // 4. Concise / tactical brevity (< 5 words/message)
  if (wordsPerMsg <= 5) {
    return {
      title: 'Tactical Brevity & Chaos',
      tagline: `Short and punchy: averaging just ${wordsPerMsg} words per message`,
      pillColor: 'bg-[#FACC15] text-[#1C1917]',
    };
  }

  // 5. Deep talkers / lengthy dissertations (>= 14 words/message)
  if (wordsPerMsg >= 14) {
    return {
      title: 'Philosophical Salon',
      tagline: `Thoughtful discussions averaging ${wordsPerMsg} words per message`,
      pillColor: 'bg-[#1C1917] text-[#F5F2EB]',
    };
  }

  // 6. Long-standing historical bond (>= 180 active days)
  if (analytics.totalDays >= 180) {
    return {
      title: 'Enduring Fellowship',
      tagline: `Staying connected consistently across ${analytics.totalDays} days`,
      pillColor: 'bg-[#16A34A] text-white',
    };
  }

  // Default balanced warm dynamic
  return {
    title: 'Harmonic Sync Wave',
    tagline: `A steady, balanced conversational flow across all ${analytics.participants.length} members`,
    pillColor: 'bg-[#16A34A] text-white',
  };
}
