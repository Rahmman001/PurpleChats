export interface ChatMessage {
  id: string;
  timestamp: Date;
  sender: string;
  content: string;
  isMedia: boolean;
  isSystem: boolean;
  wordCount: number;
}

export interface ParticipantSummary {
  name: string;
  messageCount: number;
  wordCount: number;
  percentage: number;
  color: string;
  medianResponseMinutes: number;
  initiationCount: number;
  doubleTextCount: number;
  nightOwlCount: number; // messages between 00:00 - 05:00
  earlyBirdCount: number; // messages between 05:00 - 08:00
  topEmojis: { emoji: string; count: number }[];
  badges: BadgeProfile[];
}

export interface BadgeProfile {
  id: string;
  title: string;
  emoji: string;
  description: string;
  recipientName: string;
  value: string | number;
}

export interface HourlyDistribution {
  hour: number;
  label: string;
  count: number;
}

export interface TimelineDataPoint {
  date: string; // YYYY-MM
  total: number;
  [sender: string]: number | string;
}

export interface PeakDay {
  date: string;
  count: number;
  formattedDate: string;
}

export interface ParticipantConnection {
  source: string;
  target: string;
  exchangeCount: number;
  avgLatencyMinutes: number;
  synergyLabel: string;
  strength: number; // 0 to 1
  sourceInitiatedCount: number;
  targetInitiatedCount: number;
  duoBadge: {
    title: string;
    emoji: string;
    description: string;
  };
}

export interface NotableMoment {
  id: 'most_reactions' | 'highest_emoji' | 'longest_monologue' | 'lightning_rally' | 'late_night';
  title: string;
  kicker: string;
  sender: string;
  target?: string;
  snippet: string;
  metric: string;
  timestamp: string;
}

export interface ChatAnalytics {
  totalMessages: number;
  totalWords: number;
  totalMedia: number;
  totalDays: number;
  startDate: string;
  endDate: string;
  participants: ParticipantSummary[];
  hourlyDistribution: HourlyDistribution[];
  timeline: TimelineDataPoint[];
  peakDay: PeakDay;
  topOverallEmojis: { emoji: string; count: number }[];
  topWords: { word: string; count: number }[];
  badges: BadgeProfile[];
  lateNightTotal: number; // 00:00 - 05:00 across all
  connections: ParticipantConnection[];
  notableMoments?: NotableMoment[];
}

export interface ParsingProgress {
  phase: 'reading' | 'parsing' | 'analyzing' | 'complete';
  percentage: number;
  messageCount: number;
}

