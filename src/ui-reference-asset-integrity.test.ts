import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function collectPngFiles(dir: string): string[] {
  return readdirSync(dir)
    .sort()
    .flatMap((entry) => {
      const full = resolve(dir, entry);
      const stat = statSync(full);
      return stat.isDirectory() ? collectPngFiles(full) : /\.png$/i.test(entry) ? [full] : [];
    });
}

describe('UI reference asset integrity', () => {
  it('keeps the full 84-reference corpus present and free of exact-content duplicates', () => {
    const root = resolve(process.cwd(), 'docs/ui-reference');
    const files = collectPngFiles(root);
    const hashes = files.map((file) => createHash('sha256').update(readFileSync(file)).digest('hex'));
    expect(files).toHaveLength(84);
    expect(new Set(hashes).size).toBe(hashes.length);
  });
});
