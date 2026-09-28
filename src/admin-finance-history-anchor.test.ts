import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { AGHBARI_ADMIN_LIVE_ITEMS, AGHBARI_ADMIN_PATH_TARGETS } from './structure/admin-structure';

const root = dirname(fileURLToPath(import.meta.url));
const read = (name: string) => readFileSync(resolve(root, name), 'utf8');

const adminPanelSource = read('AdminPanel.tsx');
const dashboardSource = read('AdminExecutiveDashboard.tsx');
const boundarySource = read('AdminBoundaryCenter.tsx');
const financeHistorySource = read('FinanceOperationsHistoryPanel.tsx');
const runtimeSources = [adminPanelSource, dashboardSource, boundarySource, financeHistorySource];

describe('admin finance history workspace contract', () => {
  it('routes the dedicated finance history path to its dedicated anchor', () => {
    expect(AGHBARI_ADMIN_PATH_TARGETS['/admin/finance/history']).toBe('#admin-finance-history');
  });

  it('keeps the dedicated finance history anchor executable in the live Admin panel', () => {
    expect(financeHistorySource).toContain("id='admin-finance-history'");
    expect(adminPanelSource).toContain('href="#admin-finance-history"');
    expect(adminPanelSource).toContain('FinanceOperationsHistoryPanel');
  });

  it('keeps the dashboard data-center shortcut on the real data workspace', () => {
    expect(dashboardSource).toContain('target="#admin-import"');
    expect(dashboardSource).not.toContain('title="مركز البيانات الموحد" target="#admin-catalog"');
  });

  it('guards every live Admin workspace target against anchor drift', () => {
    for (const item of AGHBARI_ADMIN_LIVE_ITEMS) {
      if (!item.target) continue;
      const id = item.target.slice(1);
      expect(runtimeSources.some((source) => source.includes('id="' + id + '"') || source.includes("id='" + id + "'"))).toBe(true);
    }
  });
});
