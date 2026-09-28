import { describe, expect, it } from 'vitest';
import { filterCatalogProducts, type CatalogPriceFilter, type CatalogStockFilter } from './AppV3Fixed';

const products = [
  { id: '1', sku: 'A', name: 'متوفر بسعر', unit: 'كرتون', category: 'A', availableQuantity: 10, status: 'active', authorizedPrice: 100, priceCurrency: 'YER' },
  { id: '2', sku: 'B', name: 'متوفر بلا سعر', unit: 'كرتون', category: 'B', availableQuantity: 4, status: 'active', authorizedPrice: 0, priceCurrency: 'YER' },
  { id: '3', sku: 'C', name: 'نفد بسعر', unit: 'كرتون', category: 'C', availableQuantity: 0, status: 'active', authorizedPrice: 80, priceCurrency: 'YER' },
] as const;

function ids(stock: CatalogStockFilter, price: CatalogPriceFilter) {
  return filterCatalogProducts(products, stock, price).map((product) => product.id);
}

describe('customer catalog filters', () => {
  it('combines stock and price filters without mutating the source collection', () => {
    expect(ids('available', 'priced')).toEqual(['1']);
    expect(ids('available', 'missing')).toEqual(['2']);
    expect(ids('out', 'priced')).toEqual(['3']);
    expect(ids('all', 'all')).toEqual(['1', '2', '3']);
    expect(products.map((product) => product.id)).toEqual(['1', '2', '3']);
  });

  it('fails closed on non-positive authorized prices for the price boundary', () => {
    expect(ids('all', 'missing')).toEqual(['2']);
  });
});
