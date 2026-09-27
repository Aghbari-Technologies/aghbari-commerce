import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = resolve(process.cwd(), 'src');
const forbidden = /(العامري|Alamri|Amiri)/g;

function collectRuntimeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectRuntimeFiles(path);
    return /\.(tsx?|css)$/.test(entry.name) && !/\.(test|spec)\.(tsx?|css)$/.test(entry.name) ? [path] : [];
  });
}

describe('Aghbari runtime brand identity', () => {
  it('does not expose historical product identity names in runtime source', () => {
    const offenders: string[] = [];
    for (const path of collectRuntimeFiles(sourceRoot)) {
      const content = readFileSync(path, 'utf8');
      forbidden.lastIndex = 0;
      if (forbidden.test(content)) offenders.push(path.replace(process.cwd(), '').replaceAll('\\', '/'));
    }
    expect(offenders).toEqual([]);
  });
});
