import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer unread notification indicator contract', () => {
  const app = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  const panel = readFileSync(resolve(process.cwd(), 'src/NotificationPanel.tsx'), 'utf8');
  const css = readFileSync(resolve(process.cwd(), 'src/ui-world-class.css'), 'utf8');

  it('surfaces the protected unread count in desktop and mobile navigation', () => {
    expect(app).toContain('getCustomerUnreadNotificationCount');
    expect(app).toContain('portal-nav-unread-badge');
    expect(app).toContain('unreadNotificationCount');
  });

  it('refreshes the badge after notification reads', () => {
    expect(panel).toContain("window.dispatchEvent(new CustomEvent('aghbari:notifications-changed'))");
  });

  it('keeps the badge visually compact', () => {
    expect(css).toContain('.portal-nav-unread-badge');
    expect(css).toContain('border-radius:999px');
  });
});
