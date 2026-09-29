import { test, expect, type Page } from '@playwright/test';
import { AGHBARI_ADMIN_LIVE_ITEMS } from '../src/structure/admin-structure';

async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  const form = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await form.locator('input[type="email"]').fill(email);
  await form.locator('input[type="password"]').fill(password);
  await form.getByRole('button', { name: 'دخول إلى بوابة الأغبري' }).click();
}

test.describe('UI reference-family browser coverage', () => {
  test('customer portal: all six canonical surfaces render with their primary state controls', async ({ page }) => {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    await page.setViewportSize({ width: 1440, height: 1000 });
    await login(page, email!, password!);
    await expect(page.locator('.customer-shell')).toBeVisible();

    const sections = [
      ['catalog', 'الكتالوج'],
      ['orders', 'طلباتي'],
      ['finance', 'المركز المالي'],
      ['templates', 'الطلبات المتكررة'],
      ['account', 'حسابي'],
      ['notifications', 'الإشعارات'],
    ] as const;

    for (const [section, label] of sections) {
      await page.getByRole('button', { name: label, exact: true }).first().click();
      await expect(page).toHaveURL(new RegExp('#' + section + '$'));
      await page.screenshot({ path: `test-results/ui-customer-${section}-desktop.png`, fullPage: true });
    }
  });

  test('customer portal: mobile shell keeps navigation, filters and primary actions usable', async ({ page }) => {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, email!, password!);
    await expect(page.locator('.customer-shell')).toBeVisible();
    await expect(page.locator('.customer-mobile-dock')).toBeVisible();

    await page.getByRole('button', { name: 'المزيد', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'المزيد من بوابة الأغبري' })).toBeVisible();
    await page.screenshot({ path: 'test-results/ui-customer-mobile-navigation.png', fullPage: true });

    await page.getByRole('dialog', { name: 'المزيد من بوابة الأغبري' }).getByRole('button', { name: 'المركز المالي', exact: true }).click();
    await expect(page.locator('.customer-finance-panel').first()).toBeVisible();
    await page.screenshot({ path: 'test-results/ui-customer-finance-mobile.png', fullPage: true });
  });

  test('admin control plane: live workspace families expose their actual anchors', async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    await page.setViewportSize({ width: 1440, height: 1000 });
    await login(page, email!, password!);
    await expect(page.getByRole('heading', { name: 'مركز التحكم' }).first()).toBeVisible();

    const liveTargets = [...new Set(
      AGHBARI_ADMIN_LIVE_ITEMS
        .map((item) => item.target)
        .filter((target): target is string => Boolean(target))
        .map((target) => target.replace(/^#/, '')),
    )];

    for (const id of liveTargets) {
      const target = page.locator('#' + id).first();
      await expect(target, `Missing live Admin anchor #${id}`).toBeVisible();
      await target.scrollIntoViewIfNeeded();
    }
    await page.screenshot({ path: 'test-results/ui-admin-control-plane-full.png', fullPage: true });

    await expect(page.getByText('العامري', { exact: false })).toHaveCount(0);
    await page.screenshot({ path: 'test-results/ui-admin-control-plane-full.png', fullPage: true });
  });
});
