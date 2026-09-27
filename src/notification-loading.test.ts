import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('notification loading surface', () => {
  it('uses structural skeleton markup with accessible busy-state semantics', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/NotificationPanel.tsx'), 'utf8');
    expect(source).toContain('notification-loading-skeleton');
    expect(source).toContain('aria-label="جارٍ تحميل الإشعارات"');
    expect(source).not.toContain('<div className="portal-loading" role="status">جارٍ تحميل الإشعارات…</div>');
  });
});
