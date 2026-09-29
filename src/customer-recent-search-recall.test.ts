import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer recent search recall contract', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  const css = readFileSync(resolve(process.cwd(), 'src/ui-global-search.css'), 'utf8');

  it('shows stored recent searches when the global search field is focused and empty', () => {
    expect(source).toContain('globalSearchFocused&&!query&&recentSearches.length>0');
    expect(source).toContain('portal-search-recent');
    expect(source).toContain('recentSearches.map(item');
    expect(source).toContain('setQuery(item);navigate("catalog")');
  });

  it('allows clearing local search history', () => {
    expect(source).toContain('onClick={()=>setRecentSearches([])}');
  });

  it('keeps the recall UI responsive', () => {
    expect(css).toContain('.portal-search-recent');
    expect(css).toContain('@media(max-width:640px)');
  });
});
