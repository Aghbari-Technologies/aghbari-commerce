import { DomainError } from '../domain/errors.js';
import { resolvePrice, type PriceRepository } from '../domain/pricing.js';
import type { Order, OrderLineInput, PricingContext, UUID } from '../domain/types.js';

export interface OrderRepository {
  findByIdempotencyKey(input: {
    organizationId: UUID;
    actorId: UUID;
    operation: string;
    key: string;
  }): Order | undefined;
  insert(order: Order): void;
}

export interface Transaction {
  run<T>(work: () => T): T;
}

export interface CreateOrderDeps {
  orders: OrderRepository;
  prices: PriceRepository;
  transaction: Transaction;
  now(): string;
  newId(): UUID;
  nextOrderNumber(): string;
}

export interface CreateOrderCommand {
  actorId: UUID;
  organizationId: UUID;
  customerId: UUID;
  branchId: UUID;
  warehouseId: UUID;
  pricingContext: PricingContext;
  lines: readonly OrderLineInput[];
  idempotencyKey: string;
}

/**
 * Application boundary for createOrder.
 * Infrastructure must back the repository with a DB transaction and unique idempotency constraint.
 */
export function createOrder(deps: CreateOrderDeps, command: CreateOrderCommand): Order {
  if (!command.idempotencyKey.trim()) {
    throw new DomainError('VALIDATION_FAILED', 'An idempotency key is required.');
  }
  if (command.lines.length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'An order must contain at least one line.');
  }

  return deps.transaction.run(() => {
    const replay = deps.orders.findByIdempotencyKey({
      organizationId: command.organizationId,
      actorId: command.actorId,
      operation: 'createOrder',
      key: command.idempotencyKey,
    });
    if (replay) return replay;

    const at = deps.now();
    const lines = command.lines.map((line) => {
      if (!Number.isSafeInteger(line.quantity) || line.quantity <= 0) {
        throw new DomainError('VALIDATION_FAILED', 'Order quantity must be a positive integer.', {
          productId: line.productId,
        });
      }
      const price = resolvePrice(deps.prices, command.pricingContext, line.productId, at);
      const lineTotal = price.unitPrice * line.quantity;
      if (!Number.isFinite(lineTotal) || lineTotal < 0) {
        throw new DomainError('VALIDATION_FAILED', 'Order line total is invalid.');
      }
      return {
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: price.unitPrice,
        lineTotal,
      };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      throw new DomainError('VALIDATION_FAILED', 'Order total is invalid.');
    }

    const order: Order = {
      id: deps.newId(),
      orderNumber: deps.nextOrderNumber(),
      organizationId: command.organizationId,
      customerId: command.customerId,
      branchId: command.branchId,
      warehouseId: command.warehouseId,
      status: 'pending',
      lines,
      subtotal,
      total: subtotal,
      idempotencyKey: command.idempotencyKey,
      createdAt: at,
    };

    deps.orders.insert(order);
    return order;
  });
}
