import { test, expect, type Page } from '@playwright/test';

const PASSWORD = 'AghbariE2E!2026';

async function assertRtlAndNoOverflow(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  expect(metrics.scrollWidth, 'document horizontal overflow').toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.bodyScrollWidth, 'body horizontal overflow').toBeLessThanOrEqual(metrics.viewport + 1);
}

async function login(page: Page, email: string) {
  await page.goto('/');
  const form = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await expect(form).toBeVisible();
  await expect(page.getByRole('heading', { name: 'بوابة الأغبري التجارية' })).toBeVisible();
  await form.locator('input[type="email"]').fill(email);
  await form.locator('input[type="password"]').fill(PASSWORD);
  await form.getByRole('button', { name: 'دخول آمن' }).click();
  await page.locator('.portal-loading').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => undefined);
  await expect.poll(async () => {
    return (await page.getByRole('button', { name: 'الكتالوج', exact: true }).first().isVisible().catch(() => false))
      || (await page.getByRole('heading', { name: 'مركز التحكم' }).first().isVisible().catch(() => false));
  }, { timeout: 15000 }).toBeTruthy();
  await assertRtlAndNoOverflow(page);
}

test.describe('Aghbari UI visual integrity', () => {
  test('customer desktop visual evidence', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await login(page, 'customer-a@test.local');
    await expect(page.locator('.portal-header')).toBeVisible();
    await expect(page.locator('.portal-nav')).toBeVisible();
    await expect(page.locator('.product-grid')).toBeVisible();
    await expect(page.locator('.hero-card')).toBeVisible();
    await page.screenshot({ path: 'visual-evidence/customer-desktop.png', fullPage: true });
  });

  test('customer mobile visual evidence', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, 'customer-a@test.local');
    await expect(page.locator('.portal-header')).toBeVisible();
    await expect(page.locator('.portal-nav')).toBeVisible();
    await expect(page.locator('.product-grid')).toBeVisible();
    await expect(page.locator('.hero-card')).toBeVisible();
    await page.screenshot({ path: 'visual-evidence/customer-mobile.png', fullPage: true });
  });

  test('staff desktop visual evidence', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await login(page, 'admin-a@test.local');
    await expect(page.getByRole('heading', { name: 'مركز التحكم' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.staff-section-rail')).toBeVisible();
    await expect(page.locator('.admin-operations')).toBeVisible();
    await page.screenshot({ path: 'visual-evidence/staff-desktop.png', fullPage: true });
  });

  test('staff mobile visual evidence', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, 'admin-a@test.local');
    await expect(page.getByRole('heading', { name: 'مركز التحكم' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.staff-section-rail')).toBeVisible();
    await expect(page.locator('.admin-operations')).toBeVisible();
    await page.screenshot({ path: 'visual-evidence/staff-mobile.png', fullPage: true });
  });
});
