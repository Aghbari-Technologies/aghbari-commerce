import { describe, expect, it } from 'vitest';
import { DEFAULT_PORTAL_ACCENT_COLOR, normalizePortalAccentColor } from './customerPolicy';

describe('portal theme contract', () => {
  it('accepts and normalizes valid six-digit hex colors', () => {
    expect(normalizePortalAccentColor('#A1B2C3')).toBe('#a1b2c3');
  });

  it('falls back to the canonical brand accent for malformed colors', () => {
    expect(normalizePortalAccentColor('red')).toBe(DEFAULT_PORTAL_ACCENT_COLOR);
    expect(normalizePortalAccentColor('#12345')).toBe(DEFAULT_PORTAL_ACCENT_COLOR);
    expect(normalizePortalAccentColor('#1234567')).toBe(DEFAULT_PORTAL_ACCENT_COLOR);
    expect(normalizePortalAccentColor(null)).toBe(DEFAULT_PORTAL_ACCENT_COLOR);
  });
});
