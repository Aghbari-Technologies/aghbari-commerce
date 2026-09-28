export type PortalSection = 'home' | 'catalog' | 'orders' | 'finance' | 'templates' | 'account' | 'notifications';

export interface CustomerPortalVisibilityConfig {
  showCredit: boolean;
  showTemplates: boolean;
}

export const PORTAL_SECTIONS = new Set<PortalSection>([
  'home',
  'catalog',
  'orders',
  'finance',
  'templates',
  'account',
  'notifications',
]);

export function getVisibleCustomerPortalSections(config: CustomerPortalVisibilityConfig): PortalSection[] {
  const sections: PortalSection[] = ['home', 'catalog', 'orders'];
  if (config.showCredit) sections.push('finance');
  if (config.showTemplates) sections.push('templates');
  sections.push('account', 'notifications');
  return sections;
}

export function normalizeCustomerPortalSection(
  next: PortalSection,
  config: CustomerPortalVisibilityConfig,
): PortalSection {
  const visible = getVisibleCustomerPortalSections(config);
  return visible.includes(next) ? next : visible[0] ?? 'home';
}

export function sectionFromHash(hash: string): PortalSection {
  const value = hash.replace(/^#/, '') as PortalSection;
  return PORTAL_SECTIONS.has(value) ? value : 'home';
}
