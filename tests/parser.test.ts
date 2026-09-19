import { describe, it, expect } from 'vitest';
import { parseWhatsAppChat } from '../src/utils/parser';

describe('WhatsApp Chat Parser', () => {
  it('should parse standard iOS bracketed format with 12-hour AM/PM', () => {
    const chat = `[14/01/24, 09:16:05 AM] Maya: Morning everyone!
[14/01/24, 09:16:40 AM] Alex: Absolutely! Let's build.`;

    const messages = parseWhatsAppChat(chat);
    expect(messages).toHaveLength(2);

    expect(messages[0].sender).toBe('Maya');
    expect(messages[0].content).toBe('Morning everyone!');
    expect(messages[0].isMedia).toBe(false);
    expect(messages[0].isSystem).toBe(false);

    expect(messages[1].sender).toBe('Alex');
    expect(messages[1].content).toBe("Absolutely! Let's build.");
  });

  it('should parse standard Android dash format', () => {
    const chat = `14/01/2024, 09:16 - Maya: Hey there Android!
14/01/2024, 09:17 - Alex: Working smoothly`;

    const messages = parseWhatsAppChat(chat);
    expect(messages).toHaveLength(2);
    expect(messages[0].sender).toBe('Maya');
    expect(messages[0].content).toBe('Hey there Android!');
    expect(messages[1].sender).toBe('Alex');
  });

  it('should preserve multi-line messages for the same sender', () => {
    const chat = `[16/01/24, 02:14:30 AM] Alex: Check this code out:
function add(a, b) {
  return a + b;
}
[16/01/24, 02:15:00 AM] Maya: Nice function!`;

    const messages = parseWhatsAppChat(chat);
    expect(messages).toHaveLength(2);
    expect(messages[0].sender).toBe('Alex');
    expect(messages[0].content).toContain('function add(a, b)');
    expect(messages[0].content).toContain('return a + b;');
    expect(messages[1].sender).toBe('Maya');
  });

  it('should filter out system messages', () => {
    const chat = `[14/01/24, 09:15:22 AM] Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
[14/01/24, 09:16:05 AM] Maya: Hello!
[14/01/24, 09:17:00 AM] Maya added Jordan to the group`;

    const messages = parseWhatsAppChat(chat);
    expect(messages).toHaveLength(1);
    expect(messages[0].sender).toBe('Maya');
    expect(messages[0].content).toBe('Hello!');
  });

  it('should identify media omissions as isMedia = true', () => {
    const chat = `[15/01/24, 01:14:02 PM] Jordan: <Media omitted>
[15/01/24, 01:15:00 PM] Alex: image omitted`;

    const messages = parseWhatsAppChat(chat);
    expect(messages).toHaveLength(2);
    expect(messages[0].isMedia).toBe(true);
    expect(messages[1].isMedia).toBe(true);
    expect(messages[0].wordCount).toBe(0);
  });

  it('should extract push names and prioritize them over phone numbers', () => {
    const chat = `[14/01/24, 09:16:05 AM] +1 (555) 123-4567 (~Alex): Hey everyone!
[14/01/24, 09:17:00 AM] +1 (555) 123-4567: Did you get my push name?
[14/01/24, 09:18:00 AM] ~ Maya: Yes, I see it!`;

    const messages = parseWhatsAppChat(chat);
    expect(messages).toHaveLength(3);
    // Both messages from the phone number should resolve to the extracted push name "~ Alex"
    expect(messages[0].sender).toBe('~ Alex');
    expect(messages[1].sender).toBe('~ Alex');
    // ~ Maya resolves to ~ Maya
    expect(messages[2].sender).toBe('~ Maya');
  });

  it('should apply smart partial masking when a phone number has no push name', () => {
    const chat = `[14/01/24, 09:16:05 AM] +91 98765 43210: Hello from India!
[14/01/24, 09:17:00 AM] +44 7911 123456: Cheers from London!`;

    const messages = parseWhatsAppChat(chat);
    expect(messages).toHaveLength(2);
    expect(messages[0].sender).toBe('+91 •••• 3210');
    expect(messages[1].sender).toBe('+44 •••• 3456');
  });

  it('should strip invisible unicode LTR/RTL marks commonly found in iOS exports', () => {
    // Unicode \u200E (LTR mark) prefixed before bracket
    const chat = `\u200E[14/01/24, 09:16:05 AM] Maya: Invisible unicode test!
\u200F[14/01/24, 09:17:00 AM] Alex: Received and parsed.`;

    const messages = parseWhatsAppChat(chat);
    expect(messages).toHaveLength(2);
    expect(messages[0].sender).toBe('Maya');
    expect(messages[0].content).toBe('Invisible unicode test!');
    expect(messages[1].sender).toBe('Alex');
    expect(messages[1].content).toBe('Received and parsed.');
  });

  it('should correctly parse ISO YYYY-MM-DD date formats without year corruption', () => {
    const chat = `2024-05-12, 14:30 - Maya: Testing ISO date
2024/05/12, 14:35 - Alex: Clean year parsing`;

    const messages = parseWhatsAppChat(chat);
    expect(messages).toHaveLength(2);
    expect(messages[0].timestamp.getFullYear()).toBe(2024);
    expect(messages[0].timestamp.getMonth()).toBe(4); // 0-indexed May
    expect(messages[0].timestamp.getDate()).toBe(12);

    expect(messages[1].timestamp.getFullYear()).toBe(2024);
    expect(messages[1].timestamp.getMonth()).toBe(4);
    expect(messages[1].timestamp.getDate()).toBe(12);
  });
});
