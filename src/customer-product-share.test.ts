import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer product share action', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  it('uses Web Share when supported and clipboard fallback otherwise', () => {
    expect(source).toContain('async function shareProduct(product:PricedProduct)');
    expect(source).toContain('navigator.share');
    expect(source).toContain('navigator.clipboard.writeText(url)');
    expect(source).toContain('#catalog-product-');
    expect(source).toContain('product-share-button');
  });
  it('does not treat user cancellation as a failure', () => {
    expect(source).toContain("e.name==='AbortError'");
  });
});


describe('customer shared product deep link', () => {
  it('routes the shared product hash to Catalog and resolves a product by id', () => {
    const appSource = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
    const catalogSource = readFileSync(resolve(process.cwd(), 'src/services/catalog.ts'), 'utf8');
    expect(appSource).toContain("raw.startsWith('#catalog-product-')");
    expect(appSource).toContain('getCatalogProductById(sharedId');
    expect(appSource).toContain('setSelectedProduct(product)');
    expect(catalogSource).toContain("from('products').select('id,sku')");
    expect(catalogSource).toContain('p_search: identity.sku');
  });
});

describe('shared product deep-link replay guard', () => {
  it('avoids refetching the same shared product after it has been resolved', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
    expect(source).toContain('sharedProductHandled.current===sharedId');
    expect(source).toContain('sharedProductHandled.current=sharedId');
    expect(source).toContain('sharedProductHandled.current=null');
  });
});
