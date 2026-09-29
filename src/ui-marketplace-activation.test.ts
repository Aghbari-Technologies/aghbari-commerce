import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('marketplace visual activation contract', () => {
  const mainSource = readFileSync(resolve(process.cwd(), 'src/main.tsx'), 'utf8');
  const appSource = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  const eliteSource = readFileSync(resolve(process.cwd(), 'src/ui-marketplace-elite.css'), 'utf8');

  it('keeps the elite visual layer active in the runtime stylesheet stack', () => {
    expect(mainSource).toContain("import './ui-marketplace-elite.css';");
    expect(mainSource.indexOf("import './ui-world-class.css';")).toBeLessThan(
      mainSource.indexOf("import './ui-marketplace-elite.css';"),
    );
    expect(mainSource.indexOf("import './ui-marketplace-elite.css';")).toBeLessThan(
      mainSource.indexOf("import './ui-global-search.css';"),
    );
  });

  it('keeps the reference-driven customer/admin presentation primitives available', () => {
    expect(eliteSource).toContain('.customer-home-command-deck');
    expect(eliteSource).toContain('.customer-shell .customer-order-summary-strip');
    expect(eliteSource).toContain('.admin-panel .operations-tabs');
    expect(eliteSource).toContain('.admin-panel .admin-boundary-center');
    expect(appSource).toContain('AGHBARI COMMERCE · B2B');
    expect(appSource).toContain('<h1>الأغبري</h1>');
    expect(appSource).toContain('Aghbari Commerce · مرحبًا، {customerName}');
  });
});
