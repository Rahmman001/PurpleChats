import { describe, it, expect } from 'vitest';
import { parseWhatsAppChat } from '../src/utils/parser';
import { computeChatAnalytics } from '../src/utils/analytics';

describe('Large Group Stress Test', () => {
  it('processes 100 participants and 30,000 messages efficiently without crashing', () => {
    const participants = Array.from({ length: 100 }, (_, i) => `User_${i + 1}`);
    const sampleTexts = [
      'Hey everyone, good morning!',
      'Has anyone reviewed the document yet?',
      'Yes, looking at it now.',
      'Looks good to me 👍',
      'Can we reschedule the call?',
      'Sure, let us do 3pm.',
      'Perfect, see you then.',
    ];

    const lines: string[] = [];
    const baseTime = new Date('2024-01-01T08:00:00Z').getTime();

    // Generate 30,000 messages spread over 60 days among 100 participants
    for (let i = 0; i < 30000; i++) {
      const p = participants[i % 100];
      const time = new Date(baseTime + i * 180000); // every 3 mins
      const dateStr = `${String(time.getMonth() + 1).padStart(2, '0')}/${String(time.getDate()).padStart(2, '0')}/${String(time.getFullYear()).slice(-2)}`;
      const hour = time.getHours() % 12 || 12;
      const ampm = time.getHours() >= 12 ? 'pm' : 'am';
      const timeStr = `${hour}:${String(time.getMinutes()).padStart(2, '0')}\u202F${ampm}`;
      const text = sampleTexts[i % sampleTexts.length];
      lines.push(`[${dateStr}, ${timeStr}] ${p}: ${text}`);
    }

    const rawChat = lines.join('\n');
    console.log(`Generated sample chat with ${lines.length} messages (${(rawChat.length / 1024 / 1024).toFixed(2)} MB)`);

    const parseStart = performance.now();
    const parsed = parseWhatsAppChat(rawChat);
    const parseEnd = performance.now();
    console.log(`Parsing took: ${(parseEnd - parseStart).toFixed(2)} ms. Parsed ${parsed.length} messages.`);

    expect(parsed.length).toBe(30000);

    const analyticsStart = performance.now();
    const analytics = computeChatAnalytics(parsed);
    const analyticsEnd = performance.now();
    console.log(`Analytics computation took: ${(analyticsEnd - analyticsStart).toFixed(2)} ms.`);
    console.log(`Participants: ${analytics.participants.length}, Connections: ${analytics.connections.length}`);

    expect(analytics.participants.length).toBe(100);
    expect(analytics.connections.length).toBeGreaterThan(0);
    expect(analyticsStart - parseStart).toBeLessThan(5000); // Under 5 seconds total
  });
});
