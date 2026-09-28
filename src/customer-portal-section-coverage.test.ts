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
import type { OrderTemplate } from './services/orderTemplates';

describe('customer template collection view', () => {
  const templates = [
    { id:'1', name:'طلب الأرز', branchLabel:'فرع صنعاء', lines:[{productId:'p1',sku:'R1',name:'أرز',unit:'كيس',quantity:4}], updatedAt:'2026-09-28T03:00:00Z' },
    { id:'2', name:'مشروبات أسبوعية', branchLabel:'المركز', lines:[{productId:'p2',sku:'J1',name:'عصير',unit:'كرتون',quantity:2},{productId:'p3',sku:'J2',name:'ماء',unit:'كرتون',quantity:5}], updatedAt:'2026-09-27T03:00:00Z' },
  ] satisfies OrderTemplate[];
  it('searches template names, branches and line metadata', () => {
    expect(filterAndSortTemplates(templates, 'J2', 'updated').map(x=>x.id)).toEqual(['2']);
    expect(filterAndSortTemplates(templates, 'صنعاء', 'updated').map(x=>x.id)).toEqual(['1']);
  });
  it('sorts by name and line count deterministically', () => {
    expect(filterAndSortTemplates(templates, '', 'name').map(x=>x.id)).toEqual(['1','2']);
    expect(filterAndSortTemplates(templates, '', 'largest').map(x=>x.id)).toEqual(['2','1']);
  });
  it('paginates without exposing an invalid page', () => {
    expect(paginateTemplates(templates, 9, 1).page).toBe(2);
    expect(paginateTemplates(templates, 1, 1).items[0].id).toBe('1');
  });
});


describe('customer checkout experience', () => {
  it('keeps checkout as an explicit review step over the existing real submit path', () => {
    expect(source).toContain('checkoutOpen');
    expect(source).toContain('متابعة إلى إتمام الطلب');
    expect(source).toContain('اعتماد وإنشاء الطلب');
    expect(source).toContain('onClick={()=>void submit()}');
  });

  it('keeps checkout blocked by the existing offline and quantity-confirmation contracts', () => {
    expect(source).toContain('اعتمد جميع الكميات من السلة قبل إرسال الطلب.');
    expect(source).toContain('لا يمكن إنشاء معاملة خارج الاتصال.');
  });
});


describe('customer catalog price sorting closure', () => {
  it('keeps price sorting tied to the authorized catalog price', () => {
    const sourceText = readFileSync(resolve(process.cwd(), 'src', 'AppV3Fixed.tsx'), 'utf8');
    expect(sourceText).toContain('value="price-high"');
    expect(sourceText).toContain('value="price-low"');
    expect(sourceText).toContain("Number(y.authorizedPrice??0)-Number(x.authorizedPrice??0)");
    expect(sourceText).toContain("Number(x.authorizedPrice??0)-Number(y.authorizedPrice??0)");
  });
});


describe('customer cart empty state', () => {
  it('keeps an explicit empty basket state with a catalog recovery action', () => {
    expect(source).toContain('سلتك فارغة حاليًا.');
    expect(source).toContain('العودة إلى الكتالوج');
    expect(source).toContain('cart-empty-primary');
  });
});
