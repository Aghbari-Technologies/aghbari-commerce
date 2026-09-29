import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Aghbari full-product commerce surfaces', () => {
  it('locks customer storefront and admin control-center requirements into source', () => {
    const start = readFileSync(resolve(process.cwd(), 'AGHBARI-EXECUTION-START.md'), 'utf8');
    const app = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
    const store = readFileSync(resolve(process.cwd(), 'src/Storefront.tsx'), 'utf8');
    const home = readFileSync(resolve(process.cwd(), 'src/CustomerHomeWorkspace.tsx'), 'utf8');
    const admin = readFileSync(resolve(process.cwd(), 'src/AdminPanel.tsx'), 'utf8');
    const design = readFileSync(resolve(process.cwd(), 'src/ui-commerce-world-class.css'), 'utf8');

    expect(start).toContain('FULL PRODUCT COMMERCE MODE');
    expect(start).toContain('Customer Storefront / Portal');
    expect(start).toContain('Admin / Staff Control Center');
    expect(start).toContain('No fake products, prices, stock, orders, payments');
    expect(app).toContain("import Storefront from './Storefront';");
    expect(app).toContain('if(storefrontOpen)return <Storefront');
    expect(store).toContain('LIVE CATALOG');
    expect(store).toContain('السلة');
    expect(store).toContain('Checkout');
    expect(store).toContain('getCatalog');
    expect(store).toContain('getCart');
    expect(home).toContain('customer-home-merchandising');
    expect(home).toContain('customer-home-product-strip');
    expect(admin).toContain('admin-command-overview');
    expect(admin).toContain('admin-command-trigger');
    expect(admin).toContain('admin-workspace-section');
    expect(admin).toContain('bulk-order');
    expect(design).toContain('.customer-shell .customer-home-hero');
    expect(design).toContain('.admin-panel .admin-command-overview');
    expect(design).toContain('.control-plane-dashboard');
    expect(design).toContain('.workspace-surface-rail');

    const forbiddenBrand = /(بوابة العامري|Alamri|Amiri)/i;
    expect(store).not.toMatch(forbiddenBrand);
    expect(design).not.toMatch(forbiddenBrand);
  });
});
