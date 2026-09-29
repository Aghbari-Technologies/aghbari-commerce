import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer global search accessibility contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');

  it('keeps the global search wired to the real catalog query state and navigation', () => {
    expect(source).toContain('className="portal-global-search"');
    expect(source).toContain('value={query}');
    expect(source).toContain("navigate('catalog')");
    expect(source).toContain('recordSearch()');
  });

  it('provides a slash keyboard shortcut without hijacking form controls', () => {
    expect(source).toContain("event.key !== '/'");
    expect(source).toContain('target?.isContentEditable');
    expect(source).toContain('aria-keyshortcuts="/"');
    const entry = readFileSync(resolve(process.cwd(), 'src/main.tsx'), 'utf8');
    expect(entry).toContain("import './ui-global-search.css';");
  });
});
