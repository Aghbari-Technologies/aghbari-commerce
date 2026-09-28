import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { AGHBARI_ADMIN_PATH_TARGETS } from './structure/admin-structure';

const adminPanelSource = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), 'AdminPanel.tsx'),
  'utf8',
);

describe('admin finance history workspace contract', () => {
  it('routes the dedicated finance history path to its dedicated anchor', () => {
    expect(AGHBARI_ADMIN_PATH_TARGETS['/admin/finance/history']).toBe('#admin-finance-history');
  });

  it('keeps the dedicated finance history anchor executable in the live Admin panel', () => {
    expect(adminPanelSource).toContain('id="admin-finance-history"');
    expect(adminPanelSource).toContain('href="#admin-finance-history"');
    expect(adminPanelSource).toContain('FinanceOperationsHistoryPanel');
  });

  it('keeps the dashboard data-center shortcut on the real data workspace', () => {
    expect(adminPanelSource).toContain('id="admin-import"');
  });
});
