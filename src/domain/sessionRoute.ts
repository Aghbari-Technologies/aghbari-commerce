export type AuthenticatedSurface = 'admin' | 'customer';

const STAFF_ROLES = new Set(['owner', 'admin', 'sales', 'warehouse']);

export function resolveAuthenticatedSurface(role: string, customerId: string | null | undefined): AuthenticatedSurface {
  if (STAFF_ROLES.has(role) || (role === 'viewer' && !customerId)) return 'admin';
  return 'customer';
}
