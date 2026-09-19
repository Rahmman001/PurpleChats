import { parseWhatsAppChat } from '../utils/parser';
import { computeChatAnalytics } from '../utils/analytics';
import { assignBadges } from '../utils/badges';

self.onmessage = (event: MessageEvent<{ rawText: string }>) => {
  const { rawText } = event.data;

  try {
    self.postMessage({ phase: 'parsing', percentage: 20, messageCount: 0 });

    const messages = parseWhatsAppChat(rawText);

    self.postMessage({ phase: 'analyzing', percentage: 60, messageCount: messages.length });

    const analytics = computeChatAnalytics(messages);
    const badges = assignBadges(analytics);
    analytics.badges = badges;

    self.postMessage({
      phase: 'complete',
      percentage: 100,
      messageCount: messages.length,
      analytics,
    });
  } catch (error) {
    self.postMessage({
      phase: 'error',
      error: error instanceof Error ? error.message : 'Failed to parse chat export',
    });
  }
};
