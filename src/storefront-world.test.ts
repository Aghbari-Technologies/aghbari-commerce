import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('world-class storefront contract', () => {
  it('keeps the storefront as a real first-class commerce surface', () => {
    const app = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
    const store = readFileSync(resolve(process.cwd(), 'src/Storefront.tsx'), 'utf8');
    const styles = readFileSync(resolve(process.cwd(), 'src/storefront-world.css'), 'utf8');

    expect(app).toContain("import Storefront from './Storefront';");
    expect(app).toContain('if(storefrontOpen)return <Storefront');
    expect(app).toContain("window.location.pathname+'?login=1#catalog'");
    expect(store).toContain('كل ما يحتاجه متجرك');
    expect(store).toContain('استكشف التصنيفات');
    expect(store).toContain('مختارات من الكتالوج');
    expect(store).toContain('السلة');
    expect(store).toContain('طلب سريع');
    expect(styles).toContain('.store-main-header');
    expect(styles).toContain('.store-hero');
    expect(styles).toContain('.store-product-grid');
    expect(styles).toContain('.store-mobile-dock');
  });
});
