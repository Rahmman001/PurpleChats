import { describe, it, expect } from 'vitest';
import { computeChatAnalytics } from '../src/utils/analytics';
import { ChatMessage } from '../src/types/chat';

describe('Chat Analytics Engine', () => {
  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      timestamp: new Date(2024, 0, 14, 9, 0, 0),
      dateStr: '14/01/2024',
      timeStr: '09:00',
      sender: 'Alice',
      content: 'Good morning everyone! ☀️',
      isMedia: false,
      isSystem: false,
      wordCount: 3,
      letterCount: 22,
    },
    {
      id: '2',
      timestamp: new Date(2024, 0, 14, 9, 2, 0), // 2 min reply
      dateStr: '14/01/2024',
      timeStr: '09:02',
      sender: 'Bob',
      content: 'Morning Alice! ☕',
      isMedia: false,
      isSystem: false,
      wordCount: 2,
      letterCount: 13,
    },
    {
      id: '3',
      timestamp: new Date(2024, 0, 14, 15, 0, 0), // 5.97 hours later (> 4 hours -> Bob initiated)
      dateStr: '14/01/2024',
      timeStr: '15:00',
      sender: 'Bob',
      content: 'Are we doing lunch?',
      isMedia: false,
      isSystem: false,
      wordCount: 4,
      letterCount: 16,
    },
    {
      id: '4',
      timestamp: new Date(2024, 0, 14, 15, 1, 0),
      dateStr: '14/01/2024',
      timeStr: '15:01',
      sender: 'Bob',
      content: 'I am starving',
      isMedia: false,
      isSystem: false,
      wordCount: 3,
      letterCount: 11,
    },
    {
      id: '5',
      timestamp: new Date(2024, 0, 14, 15, 2, 0), // 3 consecutive Bob messages -> 1 double-text streak
      dateStr: '14/01/2024',
      timeStr: '15:02',
      sender: 'Bob',
      content: 'Hello??',
      isMedia: false,
      isSystem: false,
      wordCount: 1,
      letterCount: 7,
    },
    {
      id: '6',
      timestamp: new Date(2024, 0, 15, 2, 30, 0), // 2:30 AM -> Night Owl
      dateStr: '15/01/2024',
      timeStr: '02:30',
      sender: 'Alice',
      content: 'Still working on this code 🦉',
      isMedia: false,
      isSystem: false,
      wordCount: 5,
      letterCount: 25,
    }
  ];

  it('should compute aggregate stats correctly', () => {
    const stats = computeChatAnalytics(mockMessages);
    expect(stats.totalMessages).toBe(6);
    expect(stats.totalWords).toBe(18);
    expect(stats.participants).toHaveLength(2);
    expect(stats.isGroup).toBe(false); // 2 participants = 1-on-1
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
});
