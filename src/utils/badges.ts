import { ChatAnalytics, BadgeProfile } from '../types/chat';

export function assignBadges(analytics: ChatAnalytics): BadgeProfile[] {
  const participants = analytics.participants;
  if (!participants || participants.length === 0) return [];

  const badges: BadgeProfile[] = [];

  // 1. 🦉 The Night Owl - Most messages sent between midnight and 5:00 AM
  const nightOwls = [...participants].filter(p => p.nightOwlCount > 0).sort((a, b) => b.nightOwlCount - a.nightOwlCount);
  if (nightOwls.length > 0) {
    badges.push({
      id: 'night-owl',
      title: 'The Night Owl',
      emoji: '🦉',
      description: 'Thrives in the darkness. Sent the most messages between midnight and 5:00 AM.',
      recipientName: nightOwls[0].name,
      value: `${nightOwls[0].nightOwlCount} late-night msgs`,
    });
  }

  // 2. 🌅 The Early Bird - Most messages sent between 5:00 AM and 8:00 AM
  const earlyBirds = [...participants].filter(p => p.earlyBirdCount > 0).sort((a, b) => b.earlyBirdCount - a.earlyBirdCount);
  if (earlyBirds.length > 0) {
    badges.push({
      id: 'early-bird',
      title: 'The Early Bird',
      emoji: '🌅',
      description: 'Up with the sun. Sent the most messages between 5:00 AM and 8:00 AM.',
      recipientName: earlyBirds[0].name,
      value: `${earlyBirds[0].earlyBirdCount} sunrise msgs`,
    });
  }

  // 3. 📜 The Novelist - Highest average words per message
  const novelists = [...participants]
    .filter(p => p.messageCount >= 5)
    .sort((a, b) => (b.wordCount / b.messageCount) - (a.wordCount / a.messageCount));
  if (novelists.length > 0) {
    const avgWords = Math.round((novelists[0].wordCount / novelists[0].messageCount) * 10) / 10;
    badges.push({
      id: 'novelist',
      title: 'The Novelist',
      emoji: '📜',
      description: 'Does not send texts; sends essays. Highest average words per message.',
      recipientName: novelists[0].name,
      value: `${avgWords} words/msg`,
    });
  }

  // 4. 👍 The One-Worder - Lowest average words per message
  const concise = [...participants]
    .filter(p => p.messageCount >= 5)
    .sort((a, b) => (a.wordCount / a.messageCount) - (b.wordCount / b.messageCount));
  if (concise.length > 0 && concise[0].name !== (novelists[0]?.name)) {
    const avgWords = Math.round((concise[0].wordCount / concise[0].messageCount) * 10) / 10;
    badges.push({
      id: 'one-worder',
      title: 'The One-Worder',
      emoji: '👍',
      description: 'Why waste time say lot word when few word do trick? Lowest average words.',
      recipientName: concise[0].name,
      value: `${avgWords} words/msg`,
    });
  }

  // 5. ⚡ The Quick Draw - Shortest median response time (< 5 mins)
  const repliers = [...participants]
    .filter(p => p.medianResponseMinutes > 0 && p.medianResponseMinutes < 5.0)
    .sort((a, b) => a.medianResponseMinutes - b.medianResponseMinutes);
  if (repliers.length > 0) {
    badges.push({
      id: 'quick-draw',
      title: 'The Quick Draw',
      emoji: '⚡',
      description: 'Living on their phone. Median reply latency under 5 minutes.',
      recipientName: repliers[0].name,
      value: `${repliers[0].medianResponseMinutes}m reply time`,
    });
  }

  // 6. 👻 The Phantom - Longest median response time (> 20 mins)
  const phantoms = [...participants]
    .filter(p => p.medianResponseMinutes >= 20.0)
    .sort((a, b) => b.medianResponseMinutes - a.medianResponseMinutes);
  if (phantoms.length > 0) {
    badges.push({
      id: 'phantom',
      title: 'The Phantom',
      emoji: '👻',
      description: 'Serial ghoster. Leaves messages lingering for hours before appearing.',
      recipientName: phantoms[0].name,
      value: `${phantoms[0].medianResponseMinutes}m reply time`,
    });
  }

  // 7. 🚀 The Spark - Most conversation initiations
  const sparks = [...participants].sort((a, b) => b.initiationCount - a.initiationCount);
  if (sparks.length > 0 && sparks[0].initiationCount > 0) {
    badges.push({
      id: 'spark',
      title: 'The Spark',
      emoji: '🚀',
      description: 'The conversation resuscitation champion. Most revivals after silence.',
      recipientName: sparks[0].name,
      value: `${sparks[0].initiationCount} starters`,
    });
  }

  // 8. 💬 The Megaphone - Most total messages
  if (participants.length > 1) {
    badges.push({
      id: 'megaphone',
      title: 'The Megaphone',
      emoji: '📣',
      description: 'Dominates the airwaves with the sheer volume of messages.',
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
