import { ChatAnalytics, BadgeProfile } from '../types/chat';

export function assignBadges(analytics: ChatAnalytics): BadgeProfile[] {
  const participants = analytics.participants;
  if (!participants || participants.length === 0) return [];

  const badges: BadgeProfile[] = [];

  // 1. 🦇 Insomnia Metric - Most messages sent between midnight and 5:00 AM
  const nightOwls = [...participants].filter(p => p.nightOwlCount > 0).sort((a, b) => b.nightOwlCount - a.nightOwlCount);
  if (nightOwls.length > 0) {
    badges.push({
      id: 'night-owl',
      title: 'Insomnia Metric',
      emoji: '🦇',
      description: 'Sends messages when almost everyone else is fast asleep.',
      recipientName: nightOwls[0].name,
      value: `${nightOwls[0].nightOwlCount} late-night msgs`,
    });
  }

  // 2. ☕ 5AM Club - Most messages sent between 5:00 AM and 8:00 AM
  const earlyBirds = [...participants].filter(p => p.earlyBirdCount > 0).sort((a, b) => b.earlyBirdCount - a.earlyBirdCount);
  if (earlyBirds.length > 0) {
    badges.push({
      id: 'early-bird',
      title: '5AM Club',
      emoji: '☕',
      description: 'Up and texting before alarms go off. An early riser.',
      recipientName: earlyBirds[0].name,
      value: `${earlyBirds[0].earlyBirdCount} sunrise msgs`,
    });
  }

  // 3. 📝 The Keyboard Philosopher - Highest average words per message
  const novelists = [...participants]
    .filter(p => p.messageCount >= 5)
    .sort((a, b) => (b.wordCount / b.messageCount) - (a.wordCount / a.messageCount));
  if (novelists.length > 0) {
    const avgWords = Math.round((novelists[0].wordCount / novelists[0].messageCount) * 10) / 10;
    badges.push({
      id: 'novelist',
      title: 'Keyboard Philosopher',
      emoji: '📝',
      description: 'Sends thoughtful, multi-sentence paragraphs instead of quick one-liners.',
      recipientName: novelists[0].name,
      value: `${avgWords} words/msg`,
    });
  }

  // 4. 🪨 Tactical Brevity - Lowest average words per message
  const concise = [...participants]
    .filter(p => p.messageCount >= 5)
    .sort((a, b) => (a.wordCount / a.messageCount) - (b.wordCount / b.messageCount));
  if (concise.length > 0 && concise[0].name !== (novelists[0]?.name)) {
    const avgWords = Math.round((concise[0].wordCount / concise[0].messageCount) * 10) / 10;
    badges.push({
      id: 'one-worder',
      title: 'Tactical Brevity',
      emoji: '🪨',
      description: 'Master of the short reply. Keeps things brief with "K", "Yeah", and "No".',
      recipientName: concise[0].name,
      value: `${avgWords} words/msg`,
    });
  }

  // 5. ⏱️ Zero Latency - Shortest median response (< 5 mins)
  const repliers = [...participants]
    .filter(p => p.medianResponseMinutes > 0 && p.medianResponseMinutes < 5.0)
    .sort((a, b) => a.medianResponseMinutes - b.medianResponseMinutes);
  if (repliers.length > 0) {
    badges.push({
      id: 'quick-draw',
      title: 'Zero Latency',
      emoji: '⏱️',
      description: 'Replies in seconds. Almost impossible to leave anyone on read.',
      recipientName: repliers[0].name,
      value: `${repliers[0].medianResponseMinutes}m reply time`,
    });
  }

  // 6. 📭 Asynchronous - Longest median response time (> 20 mins)
  const phantoms = [...participants]
    .filter(p => p.medianResponseMinutes >= 20.0)
    .sort((a, b) => b.medianResponseMinutes - a.medianResponseMinutes);
  if (phantoms.length > 0) {
    badges.push({
      id: 'phantom',
      title: 'Asynchronous',
      emoji: '📭',
      description: 'Takes their time to reply—sometimes hours later, but always thoughtful.',
      recipientName: phantoms[0].name,
      value: `${phantoms[0].medianResponseMinutes}m reply time`,
    });
  }

  // 7. ⚡ The Defibrillator - Most conversation initiations
  const sparks = [...participants].sort((a, b) => b.initiationCount - a.initiationCount);
  if (sparks.length > 0 && sparks[0].initiationCount > 0) {
    badges.push({
      id: 'spark',
      title: 'The Defibrillator',
      emoji: '⚡',
      description: 'Revives the chat whenever things go quiet for more than a day.',
      recipientName: sparks[0].name,
      value: `${sparks[0].initiationCount} starters`,
    });
  }

  // 8. 👑 The Main Character - Most total messages
  if (participants.length > 1) {
    badges.push({
      id: 'megaphone',
      title: 'Main Character',
      emoji: '👑',
      description: 'Brings the energy and volume, sending the largest share of messages.',
      recipientName: participants[0].name,
      value: `${participants[0].percentage}% of chat`,
    });
  }

  // Distribute badges back to individual participant profiles
  for (const p of participants) {
    p.badges = badges.filter(b => b.recipientName === p.name);
  }

  return badges;
}
