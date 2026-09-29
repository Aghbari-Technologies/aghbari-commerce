import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('staff notification badge contract', () => {
  const app = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');
  const service = readFileSync(resolve(process.cwd(), 'src/services/customerNotifications.ts'), 'utf8');
  const css = readFileSync(resolve(process.cwd(), 'src/ui-world-class.css'), 'utf8');

  it('queries unread notifications by recipient user', () => {
    expect(service).toContain('getUnreadNotificationCountForUser');
    expect(service).toContain(".eq('recipient_user_id', normalized)");
    expect(service).toContain(".is('read_at', null)");
  });

  it('surfaces the staff unread count in the control-plane header', () => {
    expect(app).toContain('staffUnreadNotificationCount');
    expect(app).toContain('staff-notification-link');
    expect(app).toContain('getUnreadNotificationCountForUser(sessionUserId)');
  });

  it('keeps the badge compact and anchored', () => {
    expect(css).toContain('.staff-notification-link');
    expect(css).toContain('position:absolute');
  });
});
