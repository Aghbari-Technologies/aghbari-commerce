export type AghbariStaffRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';

export const AGHBARI_ROLE_PERMISSIONS: Record<AghbariStaffRole, ReadonlySet<string>> = {
  owner: new Set(['*']),
  admin: new Set(['*']),
  sales: new Set([
    'dashboard.view','orders.view','orders.edit','customers.view','customers.manage','customers.create','customers.edit',
    'products.view','pricing.rules.view','pricing.preview','finance.view','notifications.view','notifications.create',
    'architecture.view',
  ]),
  warehouse: new Set([
    'dashboard.view','orders.view','orders.edit','products.view','stock.view','stock.edit','stock.sync','purchasing.view',
    'notifications.view','architecture.view',
  ]),
  viewer: new Set(['dashboard.view','orders.view','products.view','architecture.view']),
};

export function roleCan(role: string, permission: string) {
  const set = AGHBARI_ROLE_PERMISSIONS[role as AghbariStaffRole];
  return Boolean(set && (set.has('*') || set.has(permission)));
}
