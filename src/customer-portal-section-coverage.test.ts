import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizeCustomerPortalSection } from './customer-portal-navigation';

const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
const sections = ['home', 'catalog', 'orders', 'finance', 'templates', 'account', 'notifications'] as const;

describe('customer portal section coverage', () => {
  it('keeps every logical portal section represented in metadata, navigation and rendering', () => {
    for (const section of sections) {
      expect(source).toContain(section + ':{');
      expect(source).toContain("navigate('" + section + "')");
      expect(source).toContain('navigate("' + section + '")');
      expect(source).toContain("section==='" + section + "'");
    }
    const navigationSource = readFileSync(resolve(process.cwd(), 'src/customer-portal-navigation.ts'), 'utf8');
    expect(navigationSource).toContain("export const PORTAL_SECTIONS = new Set<PortalSection>([");
    expect(navigationSource).toContain("'home',\n  'catalog',\n  'orders',\n  'finance',\n  'templates',\n  'account',\n  'notifications'");
  });

  it('does not allow hidden Finance/Templates sections to be opened by direct URL navigation', () => {
    expect(source).toContain('normalizeCustomerPortalSection(next,config)');
    expect(source).toContain('setSection(normalizeCustomerPortalSection(sectionFromHash(window.location.hash),config))');
    expect(source).toContain("window.history.replaceState(null,'','#'+normalized)");
    expect(source).toContain("هذا القسم غير متاح في إعدادات بوابة حسابك الحالية.");
    expect(source).toContain('[config.showCredit,config.showTemplates]');
    expect(normalizeCustomerPortalSection('finance', { showCredit: false, showTemplates: true })).toBe('home');
    expect(normalizeCustomerPortalSection('templates', { showCredit: true, showTemplates: false })).toBe('home');
    expect(normalizeCustomerPortalSection('orders', { showCredit: false, showTemplates: false })).toBe('orders');
  });

  it('keeps the seven-section PortalSection union aligned with the canonical set', () => {
    expect(source).toContain("type PortalSection = 'home' | 'catalog' | 'orders' | 'finance' | 'templates' | 'account' | 'notifications'");
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


describe('customer template terminology', () => {
  it('keeps all live customer surfaces aligned with the canonical القوالب label', () => {
    const structure = readFileSync(resolve(process.cwd(), 'src/structure/customer-structure.ts'), 'utf8');
    const settings = readFileSync(resolve(process.cwd(), 'src/ClientControlPanel.tsx'), 'utf8');
    expect(structure).toContain('الحفظ كقالب');
    expect(structure).not.toContain('الحفظ كمسحة');
    expect(settings).toContain("showTemplates','القوالب'");
    expect(settings).not.toContain("showTemplates','المسحات'");
    expect(settings).toContain('<h3>القوالب</h3>');
    expect(settings).not.toContain('<h3>المسحات</h3>');
    expect(source).not.toContain('تعذر حفظ المسحة');
    expect(source).not.toContain('تعذر تطبيق المسحة');
    expect(source).not.toContain('تعذر حذف المسحة');
    expect(source).not.toContain('تم تطبيق المسحة على السلة');
  });
});


describe('customer statement coverage', () => {
  it('keeps the statement capability explicit and customer-finance backed by real financial data', () => {
    const structure = readFileSync(resolve(process.cwd(), 'src/structure/customer-structure.ts'), 'utf8');
    const financeSource = readFileSync(resolve(process.cwd(), 'src/CustomerFinancePanel.tsx'), 'utf8');
    const serviceSource = readFileSync(resolve(process.cwd(), 'src/services/customerFinance.ts'), 'utf8');
    expect(structure).toContain("id: 'statements'");
    expect(financeSource).toContain("view === 'statement'");
    expect(financeSource).toContain('getCustomerStatement');
    expect(financeSource).toContain('customer-statement-table');
    expect(serviceSource).toContain(".from('payments')");
    expect(serviceSource).toContain(".in('invoice_id', invoiceIds)");
  });

  it('preserves the seven-section PortalSection contract while exposing statements within Finance', () => {
    expect(source).toContain("type PortalSection = 'home' | 'catalog' | 'orders' | 'finance' | 'templates' | 'account' | 'notifications'");
    expect(source).toContain("section==='finance'");
  });
});


describe('customer payment history coverage', () => {
  it('keeps payment history inside Finance and backed by invoice-scoped payment records', () => {
    const structure = readFileSync(resolve(process.cwd(), 'src/structure/customer-structure.ts'), 'utf8');
    const financeSource = readFileSync(resolve(process.cwd(), 'src/CustomerFinancePanel.tsx'), 'utf8');
    const serviceSource = readFileSync(resolve(process.cwd(), 'src/services/customerFinance.ts'), 'utf8');
    expect(structure).toContain("id: 'payment-history'");
    expect(financeSource).toContain("view === 'payments'");
    expect(financeSource).toContain('customer-payment-table');
    expect(serviceSource).toContain('buildCustomerPaymentHistory');
    expect(serviceSource).toContain(".in('invoice_id', invoiceIds)");
  });
});


describe('customer notification offline state', () => {
  it('keeps customer notifications explicitly fail-closed when offline', () => {
    const notificationSource = readFileSync(resolve(process.cwd(), 'src/NotificationPanel.tsx'), 'utf8');
    expect(source).toContain('<NotificationPanel audience="customer" online={online}/>');
    expect(notificationSource).toContain("audience === 'customer' && !online");
    expect(notificationSource).toContain('الإشعارات متوقفة دون اتصال');
    expect(notificationSource).toContain('لا يتم عرض بيانات إشعارات قديمة');
  });
});


describe('customer pricing coverage', () => {
  it('keeps Pricing as a live Catalog subview backed by the existing authorized pricing contract', () => {
    const structure = readFileSync(resolve(process.cwd(), 'src/structure/customer-structure.ts'), 'utf8');
    const appSource = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
    expect(structure).toContain("id: 'pricing'");
    expect(appSource).toContain('customer-pricing-dialog');
    expect(appSource).toContain('filteredPricingProducts');
    expect(appSource).toContain('tiers[p.id]');
    expect(appSource).toContain('effectivePrice(p,1)');
    expect(appSource).toContain('online');
  });
});
