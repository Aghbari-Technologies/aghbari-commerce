import { describe, expect, it } from 'vitest';
import { isStaffPortalRole, type UserRole } from './roles';

describe('staff portal role matrix', () => {
  const staffRoles: UserRole[] = ['owner', 'admin', 'sales', 'warehouse', 'viewer'];

  it.each(staffRoles)('routes %s to the staff portal', (role) => {
    expect(isStaffPortalRole(role)).toBe(true);
  });

  it('keeps customer accounts on the customer portal', () => {
    expect(isStaffPortalRole('customer')).toBe(false);
  });
});
