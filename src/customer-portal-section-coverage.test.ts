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


import { filterAndSortTemplates, paginateTemplates } from './customer-template-view';

describe('customer template collection view', () => {
  const templates = [
    { id:'1', name:'طلب الأرز', branchLabel:'فرع صنعاء', lines:[{productId:'p1',sku:'R1',name:'أرز',unit:'كيس',quantity:4}], updatedAt:'2026-09-28T03:00:00Z' },
    { id:'2', name:'مشروبات أسبوعية', branchLabel:'المركز', lines:[{productId:'p2',sku:'J1',name:'عصير',unit:'كرتون',quantity:2},{productId:'p3',sku:'J2',name:'ماء',unit:'كرتون',quantity:5}], updatedAt:'2026-09-27T03:00:00Z' },
  ] as const;
  it('searches template names, branches and line metadata', () => {
    expect(filterAndSortTemplates(templates as any, 'SKU J2', 'updated').map(x=>x.id)).toEqual(['2']);
    expect(filterAndSortTemplates(templates as any, 'صنعاء', 'updated').map(x=>x.id)).toEqual(['1']);
  });
  it('sorts by name and line count deterministically', () => {
    expect(filterAndSortTemplates(templates as any, '', 'name').map(x=>x.id)).toEqual(['1','2']);
    expect(filterAndSortTemplates(templates as any, '', 'largest').map(x=>x.id)).toEqual(['2','1']);
  });
  it('paginates without exposing an invalid page', () => {
    expect(paginateTemplates(templates as any, 9, 1).page).toBe(2);
    expect(paginateTemplates(templates as any, 1, 1).items[0].id).toBe('1');
  });
});
