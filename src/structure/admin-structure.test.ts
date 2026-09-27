import { describe, expect, it } from 'vitest';
import { AGHBARI_ADMIN_LIVE_ITEMS, adminTargetForPath, getAdminStructureForRole } from './admin-structure';

describe('admin deep-link routing contract', () => {
  it('keeps registered static admin surfaces bound to their live workspace', () => {
    expect(adminTargetForPath('/admin/orders')).toBe('#admin-orders');
    expect(adminTargetForPath('/admin/catalog')).toBe('#admin-catalog');
    expect(adminTargetForPath('/admin/pricing')).toBe('#admin-pricing-matrix');
    expect(adminTargetForPath('/admin/inventory/history')).toBe('#admin-inventory-history');
  });

  it('resolves an order id deep link instead of silently falling back to dashboard', () => {
    expect(adminTargetForPath('/admin/order/8ae5a329-5108-42d4-bf9-5925adc58219')).toBe('#admin-orders');
  });

  it('resolves a customer id deep link inside the existing customer workspace', () => {
    expect(adminTargetForPath('/admin/customers/11111111-1111-4111-8111-111111111111')).toBe('#admin-customers');
  });

  it('normalizes trailing slashes without losing a registered target', () => {
    expect(adminTargetForPath('/admin/orders/')).toBe('#admin-orders');
    expect(adminTargetForPath('/admin/catalog/')).toBe('#admin-catalog');
    expect(adminTargetForPath('/admin/')).toBe('#admin-dashboard');
  });

  it('does not invent a target for an unregistered admin route', () => {
    expect(adminTargetForPath('/admin/not-a-real-surface')).toBe('#admin-dashboard');
  });

  it('retains role-aware visibility for the live structure registry', () => {
    const sales = getAdminStructureForRole('sales').flatMap((group) => group.items.map((item) => item.id));
    const warehouse = getAdminStructureForRole('warehouse').flatMap((group) => group.items.map((item) => item.id));
    expect(sales).toContain('orders');
    expect(warehouse).toContain('orders');
    expect(AGHBARI_ADMIN_LIVE_ITEMS.some((item) => item.id === 'order-detail')).toBe(true);
  });
});
