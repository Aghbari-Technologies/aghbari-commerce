import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('live ecommerce storefront contract', () => {
  it('keeps the root surface as a first-class customer-facing store', () => {
    const app = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
    const store = readFileSync(resolve(process.cwd(), 'src/Storefront.tsx'), 'utf8');
    const styles = readFileSync(resolve(process.cwd(), 'src/storefront.css'), 'utf8');

    expect(app).toContain("import Storefront from './Storefront';");
    expect(app).toContain('if(publicStorefrontPath&&storefrontOpen)return <Storefront');
    expect(app).toContain("window.location.pathname+'?login=1#catalog'");
    expect(store).toContain('LIVE CATALOG');
    expect(store).toContain('كتالوج حقيقي');
    expect(store).toContain('السلة');
    expect(store).toContain('Checkout');
    expect(store).toContain('getCatalog');
    expect(store).toContain('getCart');
    expect(styles).toContain('.storefront-live-header');
    expect(styles).toContain('.storefront-live-hero');
    expect(styles).toContain('.storefront-live-grid');
    expect(styles).toContain('.storefront-live-cart');
  });
});
