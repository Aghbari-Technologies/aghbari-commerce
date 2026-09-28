import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AGHBARI_CUSTOMER_STRUCTURE } from './structure/customer-structure';

const rail = readFileSync(resolve(process.cwd(), 'src/WorkspaceSurfaceRail.tsx'), 'utf8');
const app = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');

describe('customer capability navigation closure', () => {
  it('exposes every canonical customer capability as an actionable control', () => {
    expect(AGHBARI_CUSTOMER_STRUCTURE.every((item) => rail.includes('onOpenCapability') && rail.includes('className={item.status === \'live\' ? \'workspace-surface-capability is-live\' : \'workspace-surface-capability\'}'))).toBe(true);
  });

  it('connects the customer workspace rail to the live capability dispatcher', () => {
    expect(app).toContain('onOpenCapability={openCustomerCapability}');
    expect(app).toContain('function openCustomerCapability(item:CustomerStructureItem)');
    for (const id of ['search','categories','product-detail','cart','checkout','order-detail','quick-order','pricing','profile','company','addresses','account-settings','invoice-history','invoice-detail','statements','payment-history','offline','invitations']) {
      expect(app).toContain("case '" + id + "':");
    }
  });

  it('keeps capability navigation behind the existing cart confirmation gate', () => {
    expect(app).toContain("function navigate(next:PortalSection):boolean");
    expect(app).toContain("setError('اعتمد كميات السلة أولاً قبل الانتقال إلى قسم آخر.')");
  });
});
