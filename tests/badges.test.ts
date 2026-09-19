import { describe, it, expect } from 'vitest';
import { assignBadges } from '../src/utils/badges';
import { ParticipantSummary, ChatAnalytics } from '../src/types/chat';

describe('Personality Archetypes & Badges Engine', () => {
  const mockParticipants: ParticipantSummary[] = [
    {
      name: 'Alice',
      messageCount: 100,
      wordCount: 2500, // 25 words/msg -> Novelist
      mediaCount: 10,
      percentage: 50,
      color: '#10b981',
      medianResponseMinutes: 0.8, // < 1 min -> Quick Draw
      averageResponseMinutes: 1.2,
      initiationCount: 15, // The Spark
      doubleTextCount: 5,
      nightOwlCount: 22, // The Night Owl
      earlyBirdCount: 0,
      topEmojis: [{ emoji: '🦉', count: 10 }],
      badges: [],
    },
    {
      name: 'Bob',
      messageCount: 100,
      wordCount: 300, // 3 words/msg -> One worder
      mediaCount: 2,
      percentage: 50,
      color: '#06b6d4',
      medianResponseMinutes: 45.0, // > 30 min -> Phantom
      averageResponseMinutes: 60.0,
      initiationCount: 2,
      doubleTextCount: 1,
      nightOwlCount: 0,
      earlyBirdCount: 18, // The Early Bird
      topEmojis: [{ emoji: '👍', count: 30 }],
      badges: [],
    }
  ];

  const mockAnalytics: Partial<ChatAnalytics> = {
    participants: mockParticipants,
    totalMessages: 200,
  };

  it('should assign appropriate badges based on behavioral metrics', () => {
    const badges = assignBadges(mockAnalytics as ChatAnalytics);

    expect(badges.length).toBeGreaterThan(0);

    const nightOwl = badges.find(b => b.title === 'The Night Owl');
    expect(nightOwl).toBeDefined();
    expect(nightOwl?.recipientName).toBe('Alice');

    const earlyBird = badges.find(b => b.title === 'The Early Bird');
    expect(earlyBird).toBeDefined();
    expect(earlyBird?.recipientName).toBe('Bob');

    const novelist = badges.find(b => b.title === 'The Novelist');
    expect(novelist).toBeDefined();
    expect(novelist?.recipientName).toBe('Alice');

    const phantom = badges.find(b => b.title === 'The Phantom');
    expect(phantom).toBeDefined();
    expect(phantom?.recipientName).toBe('Bob');
  });
});
