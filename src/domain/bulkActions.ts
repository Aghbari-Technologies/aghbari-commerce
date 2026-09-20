import type { OrderStatus } from './types';

export type BulkStaffRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';

export interface BulkOrderTarget {
  id: string;
  order_number: number;
  status: OrderStatus;
}

export interface BulkTransitionPlan {
  target: OrderStatus;
  selected: BulkOrderTarget[];
  eligible: BulkOrderTarget[];
  blocked: BulkOrderTarget[];
}

export function allowedNextOrderStatuses(status: OrderStatus, role: BulkStaffRole): OrderStatus[] {
  if (status === 'pending' && ['owner', 'admin', 'sales'].includes(role)) return ['confirmed', 'cancelled'];
  if (status === 'confirmed' && ['owner', 'admin', 'warehouse'].includes(role)) return ['preparing', 'cancelled'];
  if (status === 'preparing' && ['owner', 'admin', 'warehouse'].includes(role)) return ['ready', 'cancelled'];
  if (status === 'ready' && ['owner', 'admin', 'warehouse', 'sales'].includes(role)) return ['completed'];
  return [];
}

export function buildBulkTransitionPlan(
  orders: BulkOrderTarget[],
  selectedIds: Iterable<string>,
  role: BulkStaffRole,
  target: OrderStatus,
): BulkTransitionPlan {
  const ids = new Set([...selectedIds].map((id) => id.trim()).filter(Boolean));
  const selected = orders.filter((order) => ids.has(order.id));
  const eligible = selected.filter((order) => allowedNextOrderStatuses(order.status, role).includes(target));
  const blocked = selected.filter((order) => !allowedNextOrderStatuses(order.status, role).includes(target));
  return { target, selected, eligible, blocked };
}
