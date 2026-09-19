/**
 * Utility functions for extracting WhatsApp push names and smart partial masking
 * of unsaved phone numbers for privacy and clean UI presentation.
 */

// Strip invisible bidi Unicode characters that WhatsApp uses around phone numbers & names
export function cleanSenderString(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[\u200E\u200F\u202A-\u202E\u2060]/g, '')
    .replace(/[\u00A0\u202F]/g, ' ')
    .trim();
}

/**
 * Normalizes phone number to digits only (with leading + if international)
 * for map keys and consistent matching.
 */
export function normalizePhoneKey(phoneStr: string): string {
  const clean = cleanSenderString(phoneStr);
  const hasPlus = clean.startsWith('+');
  const digits = clean.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Checks if a sender string represents a phone number rather than a human name.
 * A phone number has 7+ digits, no alphabet letters (outside optional push name),
 * and standard phone punctuation (+, -, (), spaces).
 */
export function isPhoneNumber(str: string): boolean {
  const clean = cleanSenderString(str);
  // If it has letters, it's not a pure phone number (unless it's a push name container)
  const letters = clean.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 0) return false;

  const digits = clean.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 16;
}

/**
 * Extracts push name and/or phone number from a raw sender string.
 * Examples:
 *   "+1 (555) 123-4567 (~Alex Doe)" -> { pushName: "Alex Doe", phone: "+1 (555) 123-4567", isPhone: true }
 *   "~Alex"                        -> { pushName: "Alex", phone: null, isPhone: false }
 *   "+1 555 123-4567"              -> { pushName: null, phone: "+1 555 123-4567", isPhone: true }
 *   "Maya"                         -> { pushName: null, phone: null, isPhone: false }
 */
export function extractSenderDetails(rawSender: string): {
  pushName: string | null;
  phone: string | null;
  isPhone: boolean;
} {
  const clean = cleanSenderString(rawSender);

  // Pattern 1: sender contains parens with a push name e.g. "+1 (555) 019-2834 (~Alex)" or "(Alex)"
  const parenMatch = clean.match(/^(.*?)\s*(?:\(|\/)\s*~?\s*([^()]+)\s*\)?$/);
  if (parenMatch) {
    const prefix = parenMatch[1].trim();
    const potentialPush = parenMatch[2].replace(/^~/, '').trim();

    // Verify prefix is phone number and inside parens is actually a name (contains letters)
    if (isPhoneNumber(prefix) && /[a-zA-Z]/.test(potentialPush)) {
      return {
        pushName: potentialPush,
        phone: prefix,
        isPhone: true,
      };
    }
  }

  // Pattern 2: starts with ~ e.g. "~Alex" or "~ Alex Smith"
  if (clean.startsWith('~')) {
    const pushName = clean.replace(/^~\s*/, '').trim();
    if (pushName.length > 0) {
      return {
        pushName,
        phone: null,
        isPhone: false,
      };
    }
  }

  // Pattern 3: Pure phone number
  if (isPhoneNumber(clean)) {
    return {
      pushName: null,
      phone: clean,
      isPhone: true,
    };
  }

  // Pattern 4: Regular contact name (e.g. "Maya", "Jordan Smith")
  return {
    pushName: null,
    phone: null,
    isPhone: false,
  };
}

/**
 * Applies smart partial masking to a phone number.
 * Preserves country code and last 4 digits for recognition, masks the middle with bullet glyphs.
 * Examples:
 *   "+1 (555) 234-5678" -> "+1 •••• 5678"
 *   "+91 98765 43210"   -> "+91 •••• 3210"
 *   "+44 7911 123456"   -> "+44 •••• 3456"
 *   "+971 50 123 4567"  -> "+971 •••• 4567"
 *   "5552345678"        -> "555 •••• 5678"
 */
export function maskPhoneNumber(phoneStr: string): string {
  const clean = cleanSenderString(phoneStr);
  const digits = clean.replace(/\D/g, '');

  if (digits.length < 7) {
    return clean;
  }

  const last4 = digits.slice(-4);

  // International number with '+'
  if (clean.startsWith('+')) {
    // Determine country code prefix (1 to 3 digits)
    let countryCode = digits.slice(0, 1); // e.g. +1, +7

    // Common 2-digit country codes or check if remaining digits leave at least 4-6 digits
    if (digits.length >= 11 && !['1', '7'].includes(countryCode)) {
      countryCode = digits.slice(0, 2);
    }
    if (digits.length >= 12 && ['353', '971', '966', '880', '972', '351', '358', '354', '370', '371', '372'].includes(digits.slice(0, 3))) {
      countryCode = digits.slice(0, 3);
    }

    return `+${countryCode} •••• ${last4}`;
  }

  // Local phone number without '+'
  const prefix = digits.slice(0, 3);
  return `${prefix} •••• ${last4}`;
}

/**
 * Formats a push name with a single leading tilde (~), matching WhatsApp convention.
 * e.g. "Alex Doe" -> "~ Alex Doe"
 *      "~Alex"    -> "~ Alex"
 */
export function formatPushName(name: string): string {
  const clean = cleanSenderString(name).replace(/^~+\s*/, '').trim();
  return `~ ${clean}`;
}

/**
 * Resolves a raw sender name:
 * 1. Prioritizes push name if known or extracted (prefixed with ~).
 * 2. If it's a phone number with no push name, applies Smart Partial Masking.
 * 3. Otherwise returns the clean name as is.
 */
export function resolveSenderName(
  rawSender: string,
  knownPhoneToPushMap?: Map<string, string>
): string {
  const details = extractSenderDetails(rawSender);

  // 1. Direct push name in this message
  if (details.pushName) {
    return formatPushName(details.pushName);
  }

  // 2. Phone number check
  if (details.phone) {
    const key = normalizePhoneKey(details.phone);
    // Check if we learned a push name for this phone number elsewhere in the chat
    if (knownPhoneToPushMap && knownPhoneToPushMap.has(key)) {
      return formatPushName(knownPhoneToPushMap.get(key)!);
    }
    // No push name known -> Smart Partial Masking
    return maskPhoneNumber(details.phone);
  }

  // 3. Normal contact name
  return cleanSenderString(rawSender);
}

