import { DomainError } from './errors.js';
import type { OrderStatus } from './types.js';

const transitions: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  draft: ['pending', 'cancelled'],
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from].includes(to);
}

export function transitionOrderStatus(from: OrderStatus, to: OrderStatus): OrderStatus {
  if (!canTransitionOrderStatus(from, to)) {
    throw new DomainError('CONFLICT', `Illegal order transition: ${from} → ${to}.`, { from, to });
  }
  return to;
}
