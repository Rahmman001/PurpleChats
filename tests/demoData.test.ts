import { describe, it, expect } from 'vitest';
import { DEMO_CHAT_TEXT } from '../src/utils/demoData';
import { parseWhatsAppChat } from '../src/utils/parser';
import { computeChatAnalytics } from '../src/utils/analytics';
import { assignBadges } from '../src/utils/badges';

describe('Demo Chat End-to-End Pipeline', () => {
  it('should parse demo chat text and generate complete analytics & badges', () => {
    const messages = parseWhatsAppChat(DEMO_CHAT_TEXT);
    expect(messages.length).toBeGreaterThan(15);

    const analytics = computeChatAnalytics(messages);
    expect(analytics.totalMessages).toBe(messages.length);
    expect(analytics.participants.length).toBe(3); // Alex, Maya, Jordan
    expect(analytics.totalMedia).toBeGreaterThan(0);

    const badges = assignBadges(analytics);
    expect(badges.length).toBeGreaterThan(0);

    // Verify presence of expected badges in demo chat
    const badgeTitles = badges.map(b => b.title);
    expect(badgeTitles).toContain('Insomnia Metric'); // Alex at 2 AM
    expect(badgeTitles).toContain('Keyboard Philosopher');
    expect(badgeTitles).toContain('Tactical Brevity'); // Jordan with "k", "cool", "nice"
  });
});
