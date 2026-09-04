import { DomainError } from './errors.js';
import type { PricingContext, ProductPrice, UUID } from './types.js';

export interface PriceRepository {
  findEffectivePrice(input: {
    productId: UUID;
    priceListId: UUID;
    at: string;
  }): ProductPrice | undefined;
}

/** Resolves exactly one price from trusted pricing context. Client-supplied prices are not accepted. */
export function resolvePrice(
  repository: PriceRepository,
  context: PricingContext,
  productId: UUID,
  at: string,
): ProductPrice {
  const price = repository.findEffectivePrice({ productId, priceListId: context.priceListId, at });
  if (!price) {
    throw new DomainError('NOT_FOUND', 'No effective price exists for the authorized pricing context.', {
      productId,
      priceListId: context.priceListId,
    });
  }
  if (!Number.isFinite(price.unitPrice) || price.unitPrice < 0) {
    throw new DomainError('VALIDATION_FAILED', 'Resolved unit price is invalid.');
  }
  return price;
}
