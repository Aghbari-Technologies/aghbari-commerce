import { describe, expect, it } from 'vitest';
import { catalogCacheScope, shouldLoadPortalData } from '../AppV3Fixed';

describe('customer portal remote-load guard', () => {
  it('allows remote reads only for a signed-in identified online customer with Supabase', () => {
    expect(shouldLoadPortalData(true, 'customer-1', true, true)).toBe(true);
  });
  it('blocks remote reads while offline', () => {
    expect(shouldLoadPortalData(true, 'customer-1', false, true)).toBe(false);
  });
  it('blocks remote reads before authentication is ready', () => {
    expect(shouldLoadPortalData(false, 'customer-1', true, true)).toBe(false);
  });
  it('blocks remote reads without an identified customer', () => {
    expect(shouldLoadPortalData(true, null, true, true)).toBe(false);
  });
  it('blocks remote reads when the Supabase client is unavailable', () => {
    expect(shouldLoadPortalData(true, 'customer-1', true, false)).toBe(false);
  });
  it('builds a tenant, customer, warehouse and user scoped cache key', () => {
    expect(catalogCacheScope('org-1', 'customer-1', 'warehouse-1', 'user-1')).toBe('org-1:customer-1:warehouse-1:user-1');
  });
  it('drops empty context segments instead of creating ambiguous cache keys', () => {
    expect(catalogCacheScope('org-1', null, 'warehouse-1', 'user-1')).toBe('org-1:warehouse-1:user-1');
  });
});
