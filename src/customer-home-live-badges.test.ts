import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('customer home live badge context', () => {
  const home = readFileSync(resolve(process.cwd(), 'src/CustomerHomeWorkspace.tsx'), 'utf8');
  const app = readFileSync(resolve(process.cwd(), 'src/AppV3Fixed.tsx'), 'utf8');

  it('exposes saved and unread notification counts from the live customer shell', () => {
    expect(home).toContain('favoritesCount: number');
    expect(home).toContain('recentCount: number');
    expect(home).toContain('unreadNotifications: number');
    expect(home).toContain('unreadNotifications>0');
    expect(app).toContain('favoritesCount={favoriteIds.length}');
    expect(app).toContain('recentCount={recentProductIds.length}');
    expect(app).toContain('unreadNotifications={unreadNotificationCount}');
  });
});
