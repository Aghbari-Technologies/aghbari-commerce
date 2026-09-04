export const ORDER_STATUSES = [
  'NEW',
  'CONFIRMED',
  'IN_PROGRESS',
  'PREPARED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type ActorRole =
  | 'system_admin'
  | 'sales_manager'
  | 'sales_employee'
  | 'warehouse_manager'
  | 'warehouse_keeper'
  | 'moderator'
  | 'customer';

export interface OrderLineInput {
  readonly productId: string;
  readonly quantity: number;
}

export interface AuthorizedOrderLine extends OrderLineInput {
  readonly unitPrice: number;
}

export interface CreateOrderCommand {
  readonly operationId: string;
  readonly customerId: string;
  readonly organizationId: string;
  readonly branchId: string;
  readonly warehouseId: string;
  readonly lines: readonly OrderLineInput[];
  /** Client total is informational only; it is never used as the canonical total. */
  readonly clientTotal?: number;
}

export interface Order {
  readonly id: string;
  readonly orderNumber: string;
  readonly operationId: string;
  readonly customerId: string;
  readonly organizationId: string;
  readonly branchId: string;
  readonly warehouseId: string;
  readonly lines: readonly AuthorizedOrderLine[];
  readonly subtotal: number;
  readonly total: number;
  readonly status: OrderStatus;
  readonly version: number;
  readonly createdAt: string;
}

export const ORDER_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  NEW: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['PREPARED', 'CANCELLED'],
  PREPARED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

const ROLE_TRANSITIONS: Readonly<Record<string, readonly ActorRole[]>> = {
  'NEW->CONFIRMED': ['sales_employee', 'sales_manager', 'system_admin'],
  'CONFIRMED->IN_PROGRESS': ['warehouse_keeper', 'warehouse_manager', 'sales_manager', 'system_admin'],
  'IN_PROGRESS->PREPARED': ['warehouse_keeper', 'warehouse_manager', 'system_admin'],
  'PREPARED->DELIVERED': ['sales_employee', 'sales_manager', 'system_admin'],
  'NEW->CANCELLED': ['sales_employee', 'sales_manager', 'moderator', 'system_admin'],
  'CONFIRMED->CANCELLED': ['sales_manager', 'moderator', 'system_admin'],
  'IN_PROGRESS->CANCELLED': ['sales_manager', 'system_admin'],
  'PREPARED->CANCELLED': ['sales_manager', 'system_admin'],
};

export function canTransition(status: OrderStatus, next: OrderStatus, role: ActorRole): boolean {
  if (!ORDER_TRANSITIONS[status].includes(next)) return false;
  return ROLE_TRANSITIONS[`${status}->${next}`]?.includes(role) ?? false;
}

export function transitionOrder(order: Order, next: OrderStatus, role: ActorRole): Order {
  if (!canTransition(order.status, next, role)) {
    throw new Error(`FORBIDDEN_OR_INVALID_TRANSITION:${order.status}->${next}`);
  }

  return {
    ...order,
    status: next,
    version: order.version + 1,
  };
}

export function assertValidOrderCommand(command: CreateOrderCommand): void {
  if (!command.operationId) throw new Error('VALIDATION_FAILED:operationId');
  if (!command.customerId || !command.organizationId || !command.branchId || !command.warehouseId) {
    throw new Error('VALIDATION_FAILED:scope');
  }
  if (command.lines.length === 0) throw new Error('VALIDATION_FAILED:lines');

  const productIds = new Set<string>();
  for (const line of command.lines) {
    if (!line.productId || !Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new Error('VALIDATION_FAILED:line');
    }
    if (productIds.has(line.productId)) {
      throw new Error(`CONFLICT:DUPLICATE_PRODUCT:${line.productId}`);
    }
    productIds.add(line.productId);
  }

  if (command.clientTotal !== undefined && !Number.isFinite(command.clientTotal)) {
    throw new Error('VALIDATION_FAILED:clientTotal');
  }
}
