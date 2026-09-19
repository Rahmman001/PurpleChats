import { describe, it, expect } from 'vitest';
import { computeGroupVibe } from '../src/utils/vibeEngine';
import { ChatAnalytics } from '../src/types/chat';

function mockAnalytics(partial: Partial<ChatAnalytics>): ChatAnalytics {
  return {
    totalMessages: 100,
    totalWords: 700,
    totalMedia: 5,
    totalDays: 10,
    startDate: '2024-01-01',
    endDate: '2024-01-10',
    participants: [],
    timeline: [],
    hourlyDistribution: [],
    topOverallEmojis: [],
    topWords: [],
    peakDay: { date: '2024-01-05', count: 20, formattedDate: 'Jan 5, 2024' },
    lateNightTotal: 5,
    badges: [],
    connections: [],
    ...partial,
  };
}

describe('computeGroupVibe', () => {
  it('detects Nocturnal Think Tank for high late-night dispatches', () => {
    const analytics = mockAnalytics({
      totalMessages: 100,
      lateNightTotal: 30, // 30%
    });
    const vibe = computeGroupVibe(analytics);
    expect(vibe.title).toBe('Nocturnal Think Tank');
  });

  it('detects High-Velocity Frequency for high messages per day', () => {
    const analytics = mockAnalytics({
      totalMessages: 1000,
      totalDays: 5, // 200 msgs/day
      lateNightTotal: 0,
    });
    const vibe = computeGroupVibe(analytics);
    expect(vibe.title).toBe('High-Velocity Frequency');
  });

  it('detects Tactical Brevity & Chaos for short messages', () => {
    const analytics = mockAnalytics({
      totalMessages: 100,
      totalWords: 300, // 3 words/msg
      totalDays: 20,
      lateNightTotal: 0,
    });
    const vibe = computeGroupVibe(analytics);
    expect(vibe.title).toBe('Tactical Brevity & Chaos');
  });

  it('detects Philosophical Salon for verbose dispatches', () => {
    const analytics = mockAnalytics({
      totalMessages: 50,
      totalWords: 1000, // 20 words/msg
      totalDays: 20,
      lateNightTotal: 0,
    });
    const vibe = computeGroupVibe(analytics);
    expect(vibe.title).toBe('Philosophical Salon');
  });

  it('detects Enduring Fellowship for historical chats', () => {
    const analytics = mockAnalytics({
      totalMessages: 500,
      totalWords: 3500,
      totalDays: 250, // 250 days
      lateNightTotal: 0,
    });
    const vibe = computeGroupVibe(analytics);
    expect(vibe.title).toBe('Enduring Fellowship');
  });
});
