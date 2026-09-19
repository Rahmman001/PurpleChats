import { ChatMessage } from '../types/chat';

// Regex patterns for WhatsApp exports
// iOS: [14/01/24, 09:16:05 AM] or [1/14/24, 9:16:05 PM] or [14.01.24, 09:16:05]
const IOS_REGEX = /^\[(\d{1,4}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:[\s\u202F]?[APap][Mm])?)\]\s+(.*)$/;

// Android: 14/01/2024, 09:16 - or 1/14/24, 9:16 am -
const ANDROID_REGEX = /^(\d{1,4}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:[\s\u202F]?[APap][Mm])?)\s+-\s+(.*)$/;

// Media indicators
const MEDIA_PATTERNS = [
  '<media omitted>',
  'image omitted',
  'video omitted',
  'audio omitted',
  'sticker omitted',
  'document omitted',
  'contact card omitted',
  'gif omitted',
  'voice call',
  'video call'
];

// System message indicators
const SYSTEM_PATTERNS = [
  'messages and calls are end-to-end encrypted',
  'added',
  'removed',
  'left',
  'created group',
  'changed the group',
  'changed this group',
  'security code changed',
  'you deleted this message',
  'this message was deleted'
];

function parseDate(dateStr: string, timeStr: string): Date {
  try {
    const dateParts = dateStr.split(/[/.-]/).map(p => parseInt(p, 10));
    let day = dateParts[0];
    let month = dateParts[1] - 1; // 0-indexed
    let year = dateParts[2];

    if (year < 100) {
      year += 2000;
    }

    // Heuristic: if month > 11, it was probably MM/DD/YYYY format
    if (month > 11 && day <= 12) {
      const temp = day;
      day = dateParts[1];
      month = temp - 1;
    }

    const cleanTime = timeStr.replace(/[\u202F\u00A0]/g, ' ').trim();
    const isPM = /[Pp][Mm]/.test(cleanTime);
    const isAM = /[Aa][Mm]/.test(cleanTime);

    const timeDigits = cleanTime.replace(/[APap][Mm]/g, '').trim().split(':').map(p => parseInt(p, 10));
    let hours = timeDigits[0] || 0;
    const minutes = timeDigits[1] || 0;
    const seconds = timeDigits[2] || 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return new Date(year, month, day, hours, minutes, seconds);
  } catch {
    return new Date();
  }
}

export function parseWhatsAppChat(rawText: string): ChatMessage[] {
  const lines = rawText.split(/\r?\n/);
  const messages: ChatMessage[] = [];
  let currentMsg: ChatMessage | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    let match = line.match(IOS_REGEX);
    if (!match) {
      match = line.match(ANDROID_REGEX);
    }

    if (match) {
      if (currentMsg && !currentMsg.isSystem) {
        messages.push(currentMsg);
      }

      const [, dateStr, timeStr, rest] = match;
      const colonIdx = rest.indexOf(': ');

      let sender = '';
      let content = '';
      let isSystem = false;

      if (colonIdx > 0) {
        sender = rest.substring(0, colonIdx).trim();
        content = rest.substring(colonIdx + 2).trim();

        // Check if sender is actually a system message (e.g. encryption warning)
        const lowerRest = rest.toLowerCase();
        if (SYSTEM_PATTERNS.some(p => lowerRest.includes(p))) {
          isSystem = true;
        }
      } else {
        // No colon -> system message
        isSystem = true;
        content = rest.trim();
      }

      const lowerContent = content.toLowerCase();
      const isMedia = MEDIA_PATTERNS.some(p => lowerContent.includes(p));

      // Calculate words and letters
      const wordCount = isMedia || isSystem ? 0 : content.split(/\s+/).filter(Boolean).length;
      const letterCount = isMedia || isSystem ? 0 : content.replace(/\s+/g, '').length;

      const timestamp = parseDate(dateStr, timeStr);

      currentMsg = {
        id: `msg-${messages.length + 1}`,
        timestamp,
        dateStr,
        timeStr,
        sender,
        content,
        isMedia,
        isSystem,
        wordCount,
        letterCount,
      };
    } else if (currentMsg && !currentMsg.isSystem) {
      // Continuation of multi-line message
      currentMsg.content += '\n' + line;
      if (!currentMsg.isMedia) {
        currentMsg.wordCount += line.split(/\s+/).filter(Boolean).length;
        currentMsg.letterCount += line.replace(/\s+/g, '').length;
      }
    }
  }

  if (currentMsg && !currentMsg.isSystem) {
    messages.push(currentMsg);
  }

  return messages;
}
