import {
  ChatMessage,
  ChatAnalytics,
  ParticipantSummary,
  HourlyDistribution,
  DayDistribution,
  TimelineDataPoint,
  PeakDay,
} from '../types/chat';

const PARTICIPANT_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#a855f7', // Purple
];

const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
  'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
  'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
  'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
  'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like',
  'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
  'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look',
  'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
  'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us', 'are', 'was', 'were', 'been',
  'has', 'had', 'am', 'is', 'im', 'ur', 'ok', 'k', 'yeah', 'yes', 'no'
]);

// Extended regex for standard & compound emojis
const EMOJI_REGEX = /(?:\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/gu;

export function computeChatAnalytics(messages: ChatMessage[]): ChatAnalytics {
  if (!messages.length) {
    return {
      isGroup: false,
      totalMessages: 0,
      totalWords: 0,
      totalMedia: 0,
      totalDays: 0,
      startDate: '',
      endDate: '',
      participants: [],
      hourlyDistribution: [],
      dayDistribution: [],
      timeline: [],
      peakDay: { date: '', count: 0, formattedDate: '' },
      topOverallEmojis: [],
      topWords: [],
      badges: [],
      lateNightTotal: 0,
    };
  }

  // Sort messages by timestamp
  const sorted = [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Aggregate participant names
  const participantMap = new Map<string, {
    messageCount: number;
    wordCount: number;
    mediaCount: number;
    latencies: number[];
    initiations: number;
    doubleTexts: number;
    nightOwl: number;
    earlyBird: number;
    emojiMap: Map<string, number>;
  }>();

  const hourlyCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dayNameMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const dateMap = new Map<string, number>();
  const timelineMap = new Map<string, { total: number; [sender: string]: number }>();
  const overallEmojiMap = new Map<string, number>();
  const wordFrequencyMap = new Map<string, number>();

  let totalWords = 0;
  let totalMedia = 0;
  let lateNightTotal = 0;

  // Track conversational dynamics
  let previousMessage: ChatMessage | null = null;
  let currentStreakSender = '';
  let currentStreakCount = 0;

  for (let i = 0; i < sorted.length; i++) {
    const msg = sorted[i];
    const sender = msg.sender || 'Unknown';

    if (!participantMap.has(sender)) {
      participantMap.set(sender, {
        messageCount: 0,
        wordCount: 0,
        mediaCount: 0,
        latencies: [],
        initiations: 0,
        doubleTexts: 0,
        nightOwl: 0,
        earlyBird: 0,
        emojiMap: new Map(),
      });
    }

    const pData = participantMap.get(sender)!;
    pData.messageCount++;
    pData.wordCount += msg.wordCount;
    totalWords += msg.wordCount;

    if (msg.isMedia) {
      pData.mediaCount++;
      totalMedia++;
    }

    // Time calculations
    const hour = msg.timestamp.getHours();
    hourlyCounts[hour]++;

    const dayOfWeek = msg.timestamp.getDay();
    dayCounts[dayOfWeek]++;

    // Night owl (00:00 - 05:00) & Early bird (05:00 - 08:00)
    if (hour >= 0 && hour < 5) {
      pData.nightOwl++;
      lateNightTotal++;
    } else if (hour >= 5 && hour < 8) {
      pData.earlyBird++;
    }

    // Peak day tracking
    const ymd = msg.timestamp.toISOString().split('T')[0];
    dateMap.set(ymd, (dateMap.get(ymd) || 0) + 1);

    // Monthly timeline tracking (YYYY-MM)
    const yearMonth = ymd.substring(0, 7);
    if (!timelineMap.has(yearMonth)) {
      timelineMap.set(yearMonth, { total: 0 });
    }
    const tEntry = timelineMap.get(yearMonth)!;
    tEntry.total++;
    tEntry[sender] = (tEntry[sender] || 0) + 1;

    // Response latency & Conversational Initiations
    if (previousMessage) {
      const gapMinutes = (msg.timestamp.getTime() - previousMessage.timestamp.getTime()) / (1000 * 60);

      // Initiation: gap > 240 mins (4 hours)
      if (gapMinutes >= 240) {
        pData.initiations++;

        // End streak if any
        if (currentStreakCount >= 3 && currentStreakSender) {
          participantMap.get(currentStreakSender)!.doubleTexts++;
        }
        currentStreakSender = sender;
        currentStreakCount = 1;
      } else {
        // Double text streak check
        if (sender === currentStreakSender) {
          currentStreakCount++;
        } else {
          if (currentStreakCount >= 3 && currentStreakSender) {
            participantMap.get(currentStreakSender)!.doubleTexts++;
          }
          currentStreakSender = sender;
          currentStreakCount = 1;
        }

        // Response latency between different participants (< 6 hours)
        if (sender !== previousMessage.sender && gapMinutes <= 360 && gapMinutes >= 0) {
          pData.latencies.push(gapMinutes);
        }
      }
    } else {
      // Very first message in the chat = initiation
      pData.initiations++;
      currentStreakSender = sender;
      currentStreakCount = 1;
    }

    previousMessage = msg;

    // Emojis extraction
    const emojiMatches = msg.content.match(EMOJI_REGEX);
    if (emojiMatches) {
      for (const emoji of emojiMatches) {
        pData.emojiMap.set(emoji, (pData.emojiMap.get(emoji) || 0) + 1);
        overallEmojiMap.set(emoji, (overallEmojiMap.get(emoji) || 0) + 1);
      }
    }

    // Vocabulary / Words extraction (if not media)
    if (!msg.isMedia) {
      const words = msg.content
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));

      for (const word of words) {
        wordFrequencyMap.set(word, (wordFrequencyMap.get(word) || 0) + 1);
      }
    }
  }

  // Flush final streak if any
  if (currentStreakCount >= 3 && currentStreakSender) {
    participantMap.get(currentStreakSender)!.doubleTexts++;
  }

  // Format participant summaries
  const totalMsgs = sorted.length;
  let colorIdx = 0;
  const participants: ParticipantSummary[] = [];

  for (const [name, data] of participantMap.entries()) {
    // Median response time
    const sortedLatencies = [...data.latencies].sort((a, b) => a - b);
    let median = 0;
    let avg = 0;
    if (sortedLatencies.length > 0) {
      const mid = Math.floor(sortedLatencies.length / 2);
      median = sortedLatencies.length % 2 !== 0
        ? sortedLatencies[mid]
        : (sortedLatencies[mid - 1] + sortedLatencies[mid]) / 2;
      avg = sortedLatencies.reduce((acc, v) => acc + v, 0) / sortedLatencies.length;
    }

    // Top emojis per participant
    const topEmojis = Array.from(data.emojiMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emoji, count]) => ({ emoji, count }));

    participants.push({
      name,
      messageCount: data.messageCount,
      wordCount: data.wordCount,
      mediaCount: data.mediaCount,
      percentage: totalMsgs > 0 ? Math.round((data.messageCount / totalMsgs) * 100) : 0,
      color: PARTICIPANT_COLORS[colorIdx % PARTICIPANT_COLORS.length],
      medianResponseMinutes: Math.round(median * 10) / 10,
      averageResponseMinutes: Math.round(avg * 10) / 10,
      initiationCount: data.initiations,
      doubleTextCount: data.doubleTexts,
      nightOwlCount: data.nightOwl,
      earlyBirdCount: data.earlyBird,
      topEmojis,
      badges: [], // Filled in Task 5
    });

    colorIdx++;
  }

  // Sort participants by message count descending
  participants.sort((a, b) => b.messageCount - a.messageCount);

  // Hourly distribution
  const hourlyDistribution: HourlyDistribution[] = hourlyCounts.map((count, hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return {
      hour,
      label: `${displayHour} ${period}`,
      count,
    };
  });

  // Day of week distribution (reorder starting Monday = index 1)
  const reorderedDayIndices = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun
  const dayDistribution: DayDistribution[] = reorderedDayIndices.map(dayIndex => ({
    day: dayNameMap[dayIndex],
    dayIndex,
    count: dayCounts[dayIndex],
  }));

  // Timeline (sorted chronologically)
  const timeline: TimelineDataPoint[] = Array.from(timelineMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({
      date,
      ...data,
    }));

  // Peak day
  let peakDate = '';
  let peakCount = 0;
  for (const [d, c] of dateMap.entries()) {
    if (c > peakCount) {
      peakCount = c;
      peakDate = d;
    }
  }

  const peakDay: PeakDay = {
    date: peakDate,
    count: peakCount,
    formattedDate: peakDate
      ? new Date(peakDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '',
  };

  // Overall top emojis
  const topOverallEmojis = Array.from(overallEmojiMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([emoji, count]) => ({ emoji, count }));

  // Top words
  const topWords = Array.from(wordFrequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  const firstDate = sorted[0].timestamp;
  const lastDate = sorted[sorted.length - 1].timestamp;
  const diffDays = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    isGroup: participants.length > 2,
    totalMessages: totalMsgs,
    totalWords,
    totalMedia,
    totalDays: diffDays,
    startDate: firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    endDate: lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    participants,
    hourlyDistribution,
    dayDistribution,
    timeline,
    peakDay,
    topOverallEmojis,
    topWords,
    badges: [],
    lateNightTotal,
  };
}
