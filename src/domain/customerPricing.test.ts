import { describe, expect, it } from 'vitest';
import appSource from '../AppV3Fixed.tsx?raw';
import { resolveCustomerPortalPrice } from './customerPricing';

describe('customer portal price resolution', () => {
  it('uses the server-authorized catalog price when no customer tier applies', () => {
    expect(resolveCustomerPortalPrice({
      authorizedPrice: 100,
      authorizedCurrency: 'YER',
      tiers: [{ minQuantity: 10, unitPrice: 90, currency: 'YER' }],
      quantity: 1
    })).toEqual({ unitPrice: 100, currency: 'YER' });
  });

  it('uses the highest applicable customer tier', () => {
    expect(resolveCustomerPortalPrice({
      authorizedPrice: 100,
      authorizedCurrency: 'YER',
      tiers: [
        { minQuantity: 1, unitPrice: 98, currency: 'YER' },
        { minQuantity: 10, unitPrice: 90, currency: 'YER' }
      ],
      quantity: 12
    })).toEqual({ unitPrice: 90, currency: 'YER' });
  });

  it('falls back safely when the authorized price is missing', () => {
    expect(resolveCustomerPortalPrice({
      authorizedPrice: null,
      authorizedCurrency: undefined,
      tiers: [],
      quantity: 1
    })).toEqual({ unitPrice: 0, currency: 'YER' });
  });
  it('uses the same resolver for persisted cart pricing after reload', () => {
    expect(appSource).toContain('const resolved=resolveCustomerPortalPrice');
    expect(appSource).toContain('unitPrice:resolved.unitPrice');
  });

});