import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AGHBARI_CUSTOMER_STRUCTURE, CUSTOMER_PORTAL_SECTIONS } from './structure/customer-structure';
import { getAdminStructureForRole } from './structure/admin-structure';
import { UI_REFERENCE_FILES, UI_REFERENCE_PACKS, UI_REFERENCE_TOTAL } from './structure/ui-reference-packs';

const adminSource = readFileSync(resolve(process.cwd(), 'src/AdminPanel.tsx'), 'utf8');
const customerSources = [
  'src/AppV3Fixed.tsx',
  'src/CustomerAccountWorkspace.tsx',
  'src/CustomerFinancePanel.tsx',
  'src/NotificationPanel.tsx',
  'src/WorkspaceSurfaceRail.tsx',
].map((path) => readFileSync(resolve(process.cwd(), path), 'utf8')).join('\n');

describe('canonical UI coverage', () => {
  it('keeps the indexed reference corpus internally complete and unique', () => {
    expect(UI_REFERENCE_TOTAL).toBe(84);
    expect(UI_REFERENCE_FILES).toHaveLength(84);
    expect(new Set(UI_REFERENCE_FILES).size).toBe(84);
  });

  it('keeps the complete reference corpus accounted once without turning it into an 84-screen requirement', () => {
    const uniqueFiles = new Set(UI_REFERENCE_FILES);
    const packCounts = UI_REFERENCE_PACKS.map((pack) => pack.references.length);
    expect(UI_REFERENCE_TOTAL).toBe(84);
    expect(UI_REFERENCE_FILES).toHaveLength(84);
    expect(uniqueFiles.size).toBe(84);
    expect(packCounts).toEqual([5, 20, 7, 18, 13, 7, 9, 5]);
  });

  it('keeps the customer portal at the canonical six sections with unique capabilities', () => {
    expect(new Set(CUSTOMER_PORTAL_SECTIONS)).toEqual(new Set(['catalog', 'orders', 'finance', 'templates', 'account', 'notifications']));
    expect(new Set(AGHBARI_CUSTOMER_STRUCTURE.map((item) => item.id)).size).toBe(AGHBARI_CUSTOMER_STRUCTURE.length);
    for (const section of CUSTOMER_PORTAL_SECTIONS) {
      expect(AGHBARI_CUSTOMER_STRUCTURE.some((item) => item.section === section)).toBe(true);
    }
    expect(AGHBARI_CUSTOMER_STRUCTURE.every((item) => item.status === 'live' || item.status === 'boundary')).toBe(true);
  });

  it('keeps purchasing and finance history registered as first-class live capabilities', () => {
    const adminStructureSource = readFileSync(resolve(process.cwd(), 'src/structure/admin-structure.ts'), 'utf8');
    const adminRuntimeSource = readFileSync(resolve(process.cwd(), 'src/AdminPanel.tsx'), 'utf8');
    const railSource = readFileSync(resolve(process.cwd(), 'src/WorkspaceSurfaceRail.tsx'), 'utf8');
    expect(adminStructureSource).toContain("live('purchasing', 'المشتريات'");
    expect(adminStructureSource).toContain("live('finance-history', 'سجل العمليات المالية'");
    expect(adminRuntimeSource).toContain('id="admin-purchasing"');
    expect(adminRuntimeSource).toContain("data-label="13 · سجل العمليات المالية"");
    expect(railSource).toContain("target: '#admin-purchasing'");
  });

  it('keeps every declared live admin workspace target represented in the active Admin runtime source', () => {
    const roles = ['owner', 'admin', 'sales', 'warehouse', 'viewer'] as const;
    const liveTargets = new Set<string>();
    for (const role of roles) {
      for (const group of getAdminStructureForRole(role)) {
        for (const item of group.items) {
          if (item.status === 'live' && item.target) liveTargets.add(item.target.trim());
        }
      }
    }
    for (const target of liveTargets) expect(adminSource).toContain(target);
  });

  it('keeps every Staff surface pack bound to a live or explicit boundary target', () => {
    const railSource = readFileSync(resolve(process.cwd(), 'src/WorkspaceSurfaceRail.tsx'), 'utf8');
    const knownTargets = new Set([
      ...getAdminStructureForRole('owner').flatMap((group) => group.items.filter((item) => item.status === 'live' && item.target).map((item) => item.target!.trim())),
      '#admin-boundaries',
    ]);
    for (const target of (railSource.matchAll(/target: '([^']+)'/g))) expect(knownTargets.has(target[1])).toBe(true);
    const inventoryTargets = ['#admin-inventory-activity', '#admin-inventory-history', '#admin-warehouses'];
    const purchasingTargets = ['#admin-purchasing', '#admin-suppliers', '#admin-receipts'];
    for (const target of [...inventoryTargets, ...purchasingTargets]) expect(knownTargets.has(target)).toBe(true);
    expect(railSource).toContain("targets: ['#admin-inventory-activity', '#admin-inventory-history', '#admin-warehouses']");
    expect(railSource).toContain("targets: ['#admin-purchasing', '#admin-suppliers', '#admin-receipts']");
  });

  it('keeps the canonical customer capability list dynamically rendered by the shared customer surface', () => {
    const railSource = readFileSync(resolve(process.cwd(), 'src/WorkspaceSurfaceRail.tsx'), 'utf8');
    expect(railSource).toContain('AGHBARI_CUSTOMER_STRUCTURE');
    expect(railSource).toContain('getCustomerSurfaceItems');
    expect(railSource).toContain('<strong>{item.label}</strong>');
    expect(customerSources).toContain('WorkspaceSurfaceRail');
  });

  it('keeps customer invitation acceptance as a real live capability', () => {
    const invitationSource = readFileSync(resolve(process.cwd(), 'src/InvitationAcceptance.tsx'), 'utf8');
    expect(AGHBARI_CUSTOMER_STRUCTURE.find((item) => item.id === 'invitations')?.status).toBe('live');
    expect(invitationSource).toContain('customer-invitations');
    expect(invitationSource).toContain('action: \'accept\'');
    expect(invitationSource).toContain('قبول الدعوة وتفعيل الحساب');
  });

  it('keeps non-live admin capabilities explicitly routed to the boundary workspace', () => {
    const roles = ['owner', 'admin', 'sales', 'warehouse', 'viewer'] as const;
    for (const role of roles) {
      for (const group of getAdminStructureForRole(role)) {
        for (const item of group.items.filter((entry) => entry.status !== 'live')) {
          expect(item.target ?? '#admin-boundaries').toBe('#admin-boundaries');
        }
      }
    }
  });
});
