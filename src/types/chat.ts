export interface ChatMessage {
  id: string;
  timestamp: Date;
  dateStr: string;
  timeStr: string;
  sender: string;
  content: string;
  isMedia: boolean;
  isSystem: boolean;
  wordCount: number;
  letterCount: number;
}

export interface ParticipantSummary {
  name: string;
  messageCount: number;
  wordCount: number;
  mediaCount: number;
  percentage: number;
  color: string;
  medianResponseMinutes: number;
  averageResponseMinutes: number;
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

export interface DayDistribution {
  day: string;
  dayIndex: number;
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

export interface ChatAnalytics {
  isGroup: boolean;
  totalMessages: number;
  totalWords: number;
  totalMedia: number;
  totalDays: number;
  startDate: string;
  endDate: string;
  participants: ParticipantSummary[];
  hourlyDistribution: HourlyDistribution[];
  dayDistribution: DayDistribution[];
  timeline: TimelineDataPoint[];
  peakDay: PeakDay;
  topOverallEmojis: { emoji: string; count: number }[];
  topWords: { word: string; count: number }[];
  badges: BadgeProfile[];
  lateNightTotal: number; // 00:00 - 05:00 across all
}

export interface ParsingProgress {
  phase: 'reading' | 'parsing' | 'analyzing' | 'complete';
  percentage: number;
  messageCount: number;
}
