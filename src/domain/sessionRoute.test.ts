import { describe, expect, it } from 'vitest';
import { resolveAuthenticatedSurface } from './sessionRoute';

describe('authenticated surface routing', () => {
  it.each(['owner', 'admin', 'sales', 'warehouse'])('routes staff role %s to admin', (role) => {
    expect(resolveAuthenticatedSurface(role, null)).toBe('admin');
  });

  it('keeps an unbound viewer on the staff/admin surface', () => {
    expect(resolveAuthenticatedSurface('viewer', null)).toBe('admin');
  });

  it('routes a customer-bound viewer to the customer portal', () => {
    expect(resolveAuthenticatedSurface('viewer', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0101')).toBe('customer');
  });

  it('routes explicit customer role to the customer portal', () => {
    expect(resolveAuthenticatedSurface('customer', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0101')).toBe('customer');
  });
});
