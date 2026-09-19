export type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer' | 'customer';

const STAFF_PORTAL_ROLES = new Set<UserRole>(['owner', 'admin', 'sales', 'warehouse', 'viewer']);

export function isStaffPortalRole(role: UserRole): boolean {
  return STAFF_PORTAL_ROLES.has(role);
}
