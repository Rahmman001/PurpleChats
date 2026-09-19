import { describe, it, expect } from 'vitest';
import { computeChatAnalytics } from '../src/utils/analytics';
import { ChatMessage } from '../src/types/chat';

describe('Chat Analytics Engine', () => {
  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      timestamp: new Date(2024, 0, 14, 9, 0, 0),
      sender: 'Alice',
      content: 'Good morning everyone! ☀️',
      isMedia: false,
      isSystem: false,
      wordCount: 3,
    },
    {
      id: '2',
      timestamp: new Date(2024, 0, 14, 9, 2, 0), // 2 min reply
      sender: 'Bob',
      content: 'Morning Alice! ☕',
      isMedia: false,
      isSystem: false,
      wordCount: 2,
    },
    {
      id: '3',
      timestamp: new Date(2024, 0, 14, 15, 0, 0), // 5.97 hours later (> 4 hours -> Bob initiated)
      sender: 'Bob',
      content: 'Are we doing lunch?',
      isMedia: false,
      isSystem: false,
      wordCount: 4,
    },
    {
      id: '4',
      timestamp: new Date(2024, 0, 14, 15, 1, 0),
      sender: 'Bob',
      content: 'I am starving',
      isMedia: false,
      isSystem: false,
      wordCount: 3,
    },
    {
      id: '5',
      timestamp: new Date(2024, 0, 14, 15, 2, 0), // 3 consecutive Bob messages -> 1 double-text streak
      sender: 'Bob',
      content: 'Hello??',
      isMedia: false,
      isSystem: false,
      wordCount: 1,
    },
    {
      id: '6',
      timestamp: new Date(2024, 0, 15, 2, 30, 0), // 2:30 AM -> Night Owl
      sender: 'Alice',
      content: 'Still working on this code 🦉',
      isMedia: false,
      isSystem: false,
      wordCount: 5,
    }
  ];

  it('should compute aggregate stats correctly', () => {
    const stats = computeChatAnalytics(mockMessages);
    expect(stats.totalMessages).toBe(6);
    expect(stats.totalWords).toBe(18);
    expect(stats.participants).toHaveLength(2);
  });

  it('should calculate conversation initiations (> 4 hour gap)', () => {
    const stats = computeChatAnalytics(mockMessages);
    const alice = stats.participants.find(p => p.name === 'Alice')!;
    const bob = stats.participants.find(p => p.name === 'Bob')!;

    // First message starts the chat (1) + Message 6 at 2:30 AM after 11.5 hr silence (2) -> Alice gets 2
    expect(alice.initiationCount).toBe(2);
    // Message 3 is 6 hours after Message 2 -> Bob gets 1
    expect(bob.initiationCount).toBe(1);
  });

  it('should track double-text streaks (3+ consecutive messages)', () => {
    const stats = computeChatAnalytics(mockMessages);
    const bob = stats.participants.find(p => p.name === 'Bob')!;
    expect(bob.doubleTextCount).toBe(1);
  });

  it('should track night owl messages (00:00 - 05:00)', () => {
    const stats = computeChatAnalytics(mockMessages);
    const alice = stats.participants.find(p => p.name === 'Alice')!;
    expect(alice.nightOwlCount).toBe(1);
    expect(stats.lateNightTotal).toBe(1);
  });

  it('should extract top emojis accurately', () => {
    const stats = computeChatAnalytics(mockMessages);
    const emojis = stats.topOverallEmojis.map(e => e.emoji);
    expect(emojis).toContain('☕');
    expect(emojis).toContain('☀️');
    expect(emojis).toContain('🦉');
  });

  it('should calculate pairwise participant connections and synergy', () => {
    const stats = computeChatAnalytics(mockMessages);
    expect(stats.connections.length).toBeGreaterThan(0);
    const aliceBob = stats.connections.find(
      c => (c.source === 'Alice' && c.target === 'Bob') || (c.source === 'Bob' && c.target === 'Alice')
    );
    expect(aliceBob).toBeDefined();
    expect(aliceBob?.exchangeCount).toBeGreaterThan(0);
    expect(aliceBob?.avgLatencyMinutes).toBeDefined();
  });

  it('should handle large groups with 15+ participants without crashing', () => {
    const largeGroupMessages: ChatMessage[] = [];
    const names = Array.from({ length: 15 }, (_, i) => `User_${i + 1}`);
    for (let i = 0; i < 60; i++) {
      const sender = names[i % 15];
      largeGroupMessages.push({
        id: String(i),
        timestamp: new Date(2024, 0, 15, 10, i, 0),
        sender,
        content: `Message ${i}`,
        isMedia: false,
        isSystem: false,
        wordCount: 2,
      });
    }

    const stats = computeChatAnalytics(largeGroupMessages);
    expect(stats.participants.length).toBe(15);
    expect(stats.connections.length).toBeGreaterThan(0);
    // Verified sorted descending by exchangeCount
    for (let i = 1; i < stats.connections.length; i++) {
      expect(stats.connections[i - 1].exchangeCount).toBeGreaterThanOrEqual(stats.connections[i].exchangeCount);
    }
  });

  it('should extract notable chat moments (most reactions, lightning rally, late night)', () => {
    const stats = computeChatAnalytics(mockMessages);
    expect(stats.notableMoments).toBeDefined();
    expect(stats.notableMoments!.length).toBeGreaterThan(0);

    const mostReactions = stats.notableMoments!.find(m => m.id === 'most_reactions');
    expect(mostReactions).toBeDefined();
    expect(mostReactions?.metric).toContain('reaction');

    const lateNight = stats.notableMoments!.find(m => m.id === 'late_night');
    expect(lateNight).toBeDefined();
    expect(lateNight?.sender).toBe('Alice');
  });
});
