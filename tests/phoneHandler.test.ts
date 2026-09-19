import { describe, it, expect } from 'vitest';
import {
  cleanSenderString,
  isPhoneNumber,
  extractSenderDetails,
  maskPhoneNumber,
  resolveSenderName,
  normalizePhoneKey,
} from '../src/utils/phoneHandler';

describe('Phone & Push Name Handler', () => {
  describe('cleanSenderString', () => {
    it('strips invisible bidi Unicode marks', () => {
      const raw = '\u202A+1 (555) 123-4567\u202C';
      expect(cleanSenderString(raw)).toBe('+1 (555) 123-4567');
    });

    it('cleans non-breaking and narrow spaces', () => {
      const raw = '+91\u00A098765\u202F43210';
      expect(cleanSenderString(raw)).toBe('+91 98765 43210');
    });
  });

  describe('isPhoneNumber', () => {
    it('detects standard international phone numbers', () => {
      expect(isPhoneNumber('+1 (555) 234-5678')).toBe(true);
      expect(isPhoneNumber('+91 98765 43210')).toBe(true);
      expect(isPhoneNumber('+44 7911 123456')).toBe(true);
      expect(isPhoneNumber('+971 50 123 4567')).toBe(true);
      expect(isPhoneNumber('+33 6 12 34 56 78')).toBe(true);
    });

    it('detects local phone numbers without plus', () => {
      expect(isPhoneNumber('07911 123456')).toBe(true);
      expect(isPhoneNumber('9876543210')).toBe(true);
    });

    it('returns false for regular contact names', () => {
      expect(isPhoneNumber('Maya')).toBe(false);
      expect(isPhoneNumber('Alex Smith')).toBe(false);
      expect(isPhoneNumber('Jordan (Work)')).toBe(false);
    });
  });

  describe('extractSenderDetails', () => {
    it('extracts push name from phone with parenthesized push name', () => {
      const result = extractSenderDetails('+1 (555) 123-4567 (~Alex Doe)');
      expect(result.pushName).toBe('Alex Doe');
      expect(result.phone).toBe('+1 (555) 123-4567');
      expect(result.isPhone).toBe(true);
    });

    it('extracts push name without tilde inside parens', () => {
      const result = extractSenderDetails('+44 7911 123456 (Sarah)');
      expect(result.pushName).toBe('Sarah');
      expect(result.phone).toBe('+44 7911 123456');
    });

    it('extracts push name when sender starts with tilde', () => {
      const result = extractSenderDetails('~ Jordan');
      expect(result.pushName).toBe('Jordan');
      expect(result.phone).toBeNull();
      expect(result.isPhone).toBe(false);
    });

    it('identifies bare phone number with no push name', () => {
      const result = extractSenderDetails('+91 98765 43210');
      expect(result.pushName).toBeNull();
      expect(result.phone).toBe('+91 98765 43210');
      expect(result.isPhone).toBe(true);
    });

    it('identifies regular contact name', () => {
      const result = extractSenderDetails('Maya Lin');
      expect(result.pushName).toBeNull();
      expect(result.phone).toBeNull();
      expect(result.isPhone).toBe(false);
    });
  });

  describe('maskPhoneNumber', () => {
    it('masks international numbers keeping country code and last 4 digits', () => {
      expect(maskPhoneNumber('+1 (555) 234-5678')).toBe('+1 •••• 5678');
      expect(maskPhoneNumber('+91 98765 43210')).toBe('+91 •••• 3210');
      expect(maskPhoneNumber('+44 7911 123456')).toBe('+44 •••• 3456');
      expect(maskPhoneNumber('+971 50 123 4567')).toBe('+971 •••• 4567');
    });

    it('masks local numbers without country code', () => {
      expect(maskPhoneNumber('5552345678')).toBe('555 •••• 5678');
    });
  });

  describe('resolveSenderName', () => {
    it('prioritizes direct push name over phone number with ~ prefix', () => {
      const resolved = resolveSenderName('+1 (555) 123-4567 (~Alex Doe)');
      expect(resolved).toBe('~ Alex Doe');
    });

    it('prioritizes tilde prefix push name and ensures single ~ format', () => {
      const resolved = resolveSenderName('~ Elena');
      expect(resolved).toBe('~ Elena');
    });

    it('falls back to smart partial masking when no push name is present', () => {
      const resolved = resolveSenderName('+1 (555) 123-4567');
      expect(resolved).toBe('+1 •••• 4567');
    });

    it('resolves bare phone number using global known phone map with ~ prefix', () => {
      const map = new Map<string, string>();
      map.set(normalizePhoneKey('+1 (555) 123-4567'), 'Alex Doe');

      const resolved = resolveSenderName('+1 555 123 4567', map);
      expect(resolved).toBe('~ Alex Doe');
    });

    it('preserves normal human names untouched', () => {
      expect(resolveSenderName('Maya')).toBe('Maya');
      expect(resolveSenderName('Jordan Cooper')).toBe('Jordan Cooper');
    });
  });
});
