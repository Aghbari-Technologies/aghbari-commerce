import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
const sections = ['catalog', 'orders', 'finance', 'templates', 'account', 'notifications'] as const;

describe('customer portal section coverage', () => {
  it('keeps every logical portal section represented in metadata, navigation and rendering', () => {
    for (const section of sections) {
      expect(source).toContain(section + ':{');
      expect(source).toContain("navigate('" + section + "')");
      expect(source).toContain('navigate("' + section + '")');
      expect(source).toContain("section==='" + section + "'");
    }
    expect(source).toContain("const PORTAL_SECTIONS = new Set<PortalSection>");
    expect(source).toContain("new Set<PortalSection>(['catalog', 'orders', 'finance', 'templates', 'account', 'notifications'])");
  });

  it('keeps the six-section PortalSection union aligned with the canonical set', () => {
    expect(source).toContain("type PortalSection = 'catalog' | 'orders' | 'finance' | 'templates' | 'account' | 'notifications'");
  });
});
