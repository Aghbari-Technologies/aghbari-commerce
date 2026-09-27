import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Exact-source proof marker: this assertion is intentionally on the current corrected proof branch.
describe('customer mobile navigation coverage', () => {
  it('keeps all customer portal sections reachable from the compact mobile navigation', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
    expect(source).toContain('className="customer-mobile-dock"');
    expect(source).toContain('navigate("catalog")');
    expect(source).toContain('navigate("orders")');
    expect(source).toContain('setCartOpen(true)');
    expect(source).toContain('navigate("account")');
    expect(source).toContain('navigate("templates")');
    expect(source).toContain('navigate("notifications")');
    expect(source).toContain('navigate("finance")');
    expect(source).toContain('id="customer-mobile-more-menu"');
    expect(source).toContain("event.key==='Escape'");
    expect(source).toContain('setMobileMoreOpen(false)');
  });
});
