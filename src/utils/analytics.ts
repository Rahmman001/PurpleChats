import {
  ChatMessage,
  ChatAnalytics,
  ParticipantSummary,
  HourlyDistribution,
  TimelineDataPoint,
  PeakDay,
  ParticipantConnection,
  NotableMoment,
} from '../types/chat';

const PARTICIPANT_COLORS = [
  '#D3968C', // Rosy brown
  '#839958', // Moss green
  '#105666', // Midnight green
  '#F7F4D5', // Beige
  '#C48579', // Darker rosy
  '#9DB070', // Light moss
  '#1A7A8A', // Lighter teal
  '#5E7340', // Dark moss
];

const STOP_WORDS = new Set([
  // Common English
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
  'has', 'had', 'am', 'is', 'im', 'ur', 'ok', 'k', 'yeah', 'yes', 'no', 'got',
  'too', 'much', 'very', 'really', 'let', 'did', 'does', 'doing', 'dont', 'didnt',
  'cant', 'wont', 'ive', 'ill', 'youre', 'theyre', 'weve', 'isnt', 'arent',
  'hasnt', 'havent', 'should', 'wouldnt', 'couldnt', 'thats', 'theres', 'heres',
  'where', 'why', 'who', 'whom', 'whose', 'those', 'these',
  
  // WhatsApp & Tech Artifacts
  'omitted', 'image', 'video', 'audio', 'sticker', 'gif', 'document', 'contact',
  'card', 'missed', 'call', 'voice', 'deleted', 'message', 'https', 'http', 'com',
  'www', 'null', 'undefined', 'true', 'false', 'pm', 'am',
  
  // Common Chat/Hinglish Filler (Optional but helpful for many chats)
  'hai', 'ki', 'ko', 'se', 'toh', 'ka', 'ke', 'bhi', 'aur', 'ye', 'kya',
  'nahi', 'ab', 'hi', 'na', 'ho', 'tha', 'thi', 'the', 'hain', 'mein', 'mera',
  'meri', 'mere', 'liye', 'karna', 'karo', 'koi', 'kuch', 'raha', 'rahi', 'wale',
  'wali', 'bata', 'diya', 'pe', 'par'
]);

// Extended regex for standard & compound emojis
const EMOJI_REGEX = /(?:\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/gu;

// Regex to detect links/URLs and system artifacts
const URL_REGEX = /(?:https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/[^\s]*)/i;
const SYSTEM_ARTIFACT_REGEX = /(?:omitted|deleted|end-to-end encrypted|security code changed|added|removed|left|created group|changed to|changed the (?:subject|group|icon|description))/i;

function isValidMomentText(content: string): boolean {
  if (!content) return false;
  const trimmed = content.trim();
  if (trimmed.length < 5) return false;
  if (URL_REGEX.test(trimmed)) return false;
  if (SYSTEM_ARTIFACT_REGEX.test(trimmed)) return false;
  return true;
}

export function computeChatAnalytics(messages: ChatMessage[]): ChatAnalytics {
  if (!messages.length) {
    return {
      totalMessages: 0,
      totalWords: 0,
      totalMedia: 0,
      totalDays: 0,
      startDate: '',
      endDate: '',
      participants: [],
      hourlyDistribution: [],
      timeline: [],
      peakDay: { date: '', count: 0, formattedDate: '' },
      topOverallEmojis: [],
      topWords: [],
      badges: [],
      lateNightTotal: 0,
      connections: [],
    };
  }

  // Sort messages by timestamp
  const sorted = [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Aggregate participant names
  const participantMap = new Map<string, {
    messageCount: number;
    wordCount: number;
    latencies: number[];
    initiations: number;
    doubleTexts: number;
    nightOwl: number;
    earlyBird: number;
    emojiMap: Map<string, number>;
  }>();

  const hourlyCounts = new Array(24).fill(0);

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

  // Track notable moments
  let mostReactionsCandidate: { sender: string; snippet: string; reactionCount: number; timestamp: string } | null = null;
  let highestEmojiCandidate: { sender: string; snippet: string; emojiCount: number; timestamp: string } | null = null;
  let longestMsgCandidate: { sender: string; snippet: string; wordCount: number; timestamp: string } | null = null;
  let lateNightCandidate: { sender: string; snippet: string; timestamp: string; diffFrom330: number } | null = null;
  let fastestRallyCandidate: { source: string; target: string; snippet: string; seconds: number; timestamp: string } | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const msg = sorted[i];
    const sender = msg.sender || 'Unknown';

    if (!participantMap.has(sender)) {
      participantMap.set(sender, {
        messageCount: 0,
        wordCount: 0,
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
      totalMedia++;
    }

    // Track longest monologue candidate (must not contain URLs or system artifacts)
    if (!msg.isMedia && !msg.isSystem && msg.wordCount > (longestMsgCandidate?.wordCount || 0) && isValidMomentText(msg.content)) {
      longestMsgCandidate = {
        sender,
        snippet: msg.content.trim().length > 160 ? msg.content.trim().slice(0, 160) + '...' : msg.content.trim(),
        wordCount: msg.wordCount,
        timestamp: msg.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    }

    // Time calculations
    const hour = msg.timestamp.getHours();
    hourlyCounts[hour]++;

    // Night owl (00:00 - 05:00) & Early bird (05:00 - 08:00)
    if (hour >= 0 && hour < 5) {
      pData.nightOwl++;
      lateNightTotal++;

      if (!msg.isMedia && !msg.isSystem && isValidMomentText(msg.content)) {
        const min = msg.timestamp.getMinutes();
        const diffFrom330 = Math.abs((hour * 60 + min) - 210);
        if (!lateNightCandidate || diffFrom330 < lateNightCandidate.diffFrom330) {
          lateNightCandidate = {
            sender,
            snippet: msg.content.trim().length > 140 ? msg.content.trim().slice(0, 140) + '...' : msg.content.trim(),
            timestamp: msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            diffFrom330,
          };
        }
      }
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

      // Track lightning counter-volley between two different speakers (no links or artifacts)
      if (
        previousMessage.sender !== sender &&
        !previousMessage.isMedia &&
        !previousMessage.isSystem &&
        !msg.isMedia &&
        !msg.isSystem &&
        isValidMomentText(previousMessage.content) &&
        isValidMomentText(msg.content)
      ) {
        const secDiff = Math.round((msg.timestamp.getTime() - previousMessage.timestamp.getTime()) / 1000);
        if (secDiff > 0 && secDiff <= 90) {
          if (!fastestRallyCandidate || secDiff < fastestRallyCandidate.seconds) {
            const prevSnippet = previousMessage.content.trim().slice(0, 45);
            const currSnippet = msg.content.trim().slice(0, 45);
            fastestRallyCandidate = {
              source: previousMessage.sender,
              target: sender,
              seconds: secDiff,
              snippet: `"${prevSnippet}" → "${currSnippet}"`,
              timestamp: msg.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            };
          }
        }
      }

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
    const emojiCount = emojiMatches ? emojiMatches.length : 0;
    if (emojiMatches) {
      for (const emoji of emojiMatches) {
        pData.emojiMap.set(emoji, (pData.emojiMap.get(emoji) || 0) + 1);
        overallEmojiMap.set(emoji, (overallEmojiMap.get(emoji) || 0) + 1);
      }
    }

    // Track message with highest emoji count
    if (
      !msg.isMedia &&
      !msg.isSystem &&
      emojiCount > (highestEmojiCandidate?.emojiCount || 0) &&
      !URL_REGEX.test(msg.content) &&
      !SYSTEM_ARTIFACT_REGEX.test(msg.content)
    ) {
      highestEmojiCandidate = {
        sender,
        snippet: msg.content.trim().length > 160 ? msg.content.trim().slice(0, 160) + '...' : msg.content.trim(),
        emojiCount,
        timestamp: msg.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    }

    // Track message that sparked the most immediate reactions/replies from other members
    if (!msg.isMedia && !msg.isSystem && isValidMomentText(msg.content)) {
      let reactionCount = 0;
      const origTime = msg.timestamp.getTime();
      let lastTime = origTime;

      for (let j = i + 1; j < sorted.length; j++) {
        const nextMsg = sorted[j];
        const nextTime = nextMsg.timestamp.getTime();
        // Break if conversational pause exceeds 10 minutes
        if (nextTime - lastTime > 10 * 60 * 1000) break;
        // Break if reaction burst exceeds 30 minutes
        if (nextTime - origTime > 30 * 60 * 1000) break;
        lastTime = nextTime;

        if (nextMsg.sender !== sender && !nextMsg.isSystem) {
          reactionCount++;
        }
      }

      if (reactionCount > (mostReactionsCandidate?.reactionCount || 0)) {
        mostReactionsCandidate = {
          sender,
          snippet: msg.content.trim().length > 160 ? msg.content.trim().slice(0, 160) + '...' : msg.content.trim(),
          reactionCount,
          timestamp: msg.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
      }
    }

    // Vocabulary / Words extraction (if not media or system, strip URLs first)
    if (!msg.isMedia && !msg.isSystem) {
      const sanitizedWordsContent = msg.content.replace(URL_REGEX, ' ');
      const words = sanitizedWordsContent
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

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
    if (sortedLatencies.length > 0) {
      const mid = Math.floor(sortedLatencies.length / 2);
      median = sortedLatencies.length % 2 !== 0
        ? sortedLatencies[mid]
        : (sortedLatencies[mid - 1] + sortedLatencies[mid]) / 2;
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
      percentage: totalMsgs > 0 ? Math.round((data.messageCount / totalMsgs) * 100) : 0,
      color: PARTICIPANT_COLORS[colorIdx % PARTICIPANT_COLORS.length],
      medianResponseMinutes: Math.round(median * 10) / 10,
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
      ? new Date(peakDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

  // Compute pairwise participant connections
  const pairMap = new Map<string, { latencies: number[]; count: number; sourceStarts: number; targetStarts: number }>();
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev.sender && curr.sender && prev.sender !== curr.sender) {
      const diffMinutes = (curr.timestamp.getTime() - prev.timestamp.getTime()) / (1000 * 60);
      if (diffMinutes >= 0 && diffMinutes <= 60) {
        const [p1, p2] = [prev.sender, curr.sender].sort();
        const key = `${p1}:::${p2}`;
        const existing = pairMap.get(key) || { latencies: [], count: 0, sourceStarts: 0, targetStarts: 0 };
        existing.count += 1;
        existing.latencies.push(diffMinutes);
        if (prev.sender === p1) {
          existing.sourceStarts += 1;
        } else {
          existing.targetStarts += 1;
        }
        pairMap.set(key, existing);
      }
    }
  }

  let maxExchanges = 1;
  for (const { count } of pairMap.values()) {
    if (count > maxExchanges) maxExchanges = count;
  }

  const connections: ParticipantConnection[] = [];
  for (const [key, data] of pairMap.entries()) {
    const [source, target] = key.split(':::');
    const sortedLatencies = [...data.latencies].sort((a, b) => a - b);
    const medianLatency = sortedLatencies.length
      ? Math.round(sortedLatencies[Math.floor(sortedLatencies.length / 2)] * 10) / 10
      : 0;
    const strength = Math.min(1, Math.max(0.2, data.count / maxExchanges));

    let synergyLabel = 'Active Frequency';
    if (data.count === maxExchanges && data.count >= 4) {
      synergyLabel = 'Strongest Synergy';
    } else if (medianLatency <= 2.5 && data.count >= 2) {
      synergyLabel = 'Zero Latency';
    } else if (medianLatency > 20) {
      synergyLabel = 'Asynchronous Orbit';
    } else if (data.count >= 6) {
      synergyLabel = 'High Velocity';
    }

    // Duo badge determination
    const sourceRatio = data.sourceStarts / Math.max(1, data.count);
    let duoBadge = {
      title: 'The Dynamic Duo',
      emoji: '🪞',
      description: 'A high-frequency, dependable conversational bond.',
    };

    if (sourceRatio >= 0.72) {
      duoBadge = {
        title: 'The Backpack Carrier',
        emoji: '🎒',
        description: `${source} started ${Math.round(sourceRatio * 100)}% of exchanges, keeping this dialogue alive.`,
      };
    } else if (sourceRatio <= 0.28) {
      duoBadge = {
        title: 'The Backpack Carrier',
        emoji: '🎒',
        description: `${target} started ${Math.round((1 - sourceRatio) * 100)}% of exchanges, carrying the thread.`,
      };
    } else if (medianLatency <= 2.0 && data.count >= 2) {
      duoBadge = {
        title: 'The Hive Mind',
        emoji: '⚡',
        description: 'Sub-2-minute reflex times. Practically sharing the same nervous system.',
      };
    } else if (sourceRatio >= 0.44 && sourceRatio <= 0.56 && data.count >= 3) {
      duoBadge = {
        title: 'The Tennis Match',
        emoji: '🎾',
        description: 'A synchronized, 50/50 volley of mutual effort.',
      };
    } else if (medianLatency >= 20) {
      duoBadge = {
        title: 'The Glacial Orbit',
        emoji: '🧊',
        description: 'Replies arrive at the contemplative pace of overseas airmail.',
      };
    }

    connections.push({
      source,
      target,
      exchangeCount: data.count,
      avgLatencyMinutes: medianLatency,
      synergyLabel,
      strength,
      sourceInitiatedCount: data.sourceStarts,
      targetInitiatedCount: data.targetStarts,
      duoBadge,
    });
  }
  connections.sort((a, b) => b.exchangeCount - a.exchangeCount);

  const notableMoments: NotableMoment[] = [];
  if (mostReactionsCandidate && mostReactionsCandidate.reactionCount > 0) {
    notableMoments.push({
      id: 'most_reactions',
      title: 'Most Reactions',
      kicker: 'Reaction Record',
      sender: mostReactionsCandidate.sender,
      snippet: mostReactionsCandidate.snippet,
      metric: `${mostReactionsCandidate.reactionCount} ${mostReactionsCandidate.reactionCount === 1 ? 'reaction' : 'reactions'}`,
      timestamp: mostReactionsCandidate.timestamp,
    });
  } else if (highestEmojiCandidate && highestEmojiCandidate.emojiCount > 0) {
    notableMoments.push({
      id: 'highest_emoji',
      title: 'Most Emojis',
      kicker: 'Emoji Record',
      sender: highestEmojiCandidate.sender,
      snippet: highestEmojiCandidate.snippet,
      metric: `${highestEmojiCandidate.emojiCount} ${highestEmojiCandidate.emojiCount === 1 ? 'emoji' : 'emojis'}`,
      timestamp: highestEmojiCandidate.timestamp,
    });
  } else if (longestMsgCandidate && longestMsgCandidate.wordCount >= 3) {
    notableMoments.push({
      id: 'longest_monologue',
      title: 'The Unabridged Monologue',
      kicker: 'Length Record',
      sender: longestMsgCandidate.sender,
      snippet: longestMsgCandidate.snippet,
      metric: `${longestMsgCandidate.wordCount} words`,
      timestamp: longestMsgCandidate.timestamp,
    });
  }
  if (fastestRallyCandidate) {
    notableMoments.push({
      id: 'lightning_rally',
      title: 'Lightning Counter-Volley',
      kicker: 'Fastest Exchange',
      sender: fastestRallyCandidate.source,
      target: fastestRallyCandidate.target,
      snippet: fastestRallyCandidate.snippet,
      metric: `${fastestRallyCandidate.seconds}s reply`,
      timestamp: fastestRallyCandidate.timestamp,
    });
  }
  if (lateNightCandidate) {
    notableMoments.push({
      id: 'late_night',
      title: 'The 3 AM Dispatch',
      kicker: 'Deep Night Owl',
      sender: lateNightCandidate.sender,
      snippet: lateNightCandidate.snippet,
      metric: lateNightCandidate.timestamp,
      timestamp: 'Overnight',
    });
  }

  return {
    totalMessages: totalMsgs,
    totalWords,
    totalMedia,
    totalDays: diffDays,
    startDate: firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    endDate: lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    participants,
    hourlyDistribution,
    timeline,
    peakDay,
    topOverallEmojis,
    topWords,
    badges: [],
    lateNightTotal,
    connections,
    notableMoments,
  };
}
