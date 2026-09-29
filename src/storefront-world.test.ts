import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('world-class storefront contract', () => {
  it('keeps the storefront as a real first-class commerce surface', () => {
    const app = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
    const store = readFileSync(resolve(process.cwd(), 'src/Storefront.tsx'), 'utf8');
    const styles = readFileSync(resolve(process.cwd(), 'src/storefront.css'), 'utf8');

    expect(app).toContain("import Storefront from './Storefront';");
    expect(app).toContain('if(storefrontOpen)return <Storefront');
    expect(app).toContain("window.location.pathname+'?login=1#catalog'");
    expect(store).toContain('ابدأ من المنتجات، لا من لوحة التحكم');
    expect(store).toContain('متجر الجملة');
    expect(store).toContain('كتالوج الشراء');
    expect(store).toContain('السلة');
    expect(store).toContain('طلب سريع');
    expect(styles).toContain('.storefront-header');
    expect(styles).toContain('.storefront-hero');
    expect(styles).toContain('.storefront-entry-grid');
    expect(styles).toContain('.storefront-footer');
  });
});
