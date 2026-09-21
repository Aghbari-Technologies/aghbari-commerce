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
  await expect(page.getByText('بوابة الأغبري التجارية', { exact: true }).first()).toBeVisible();
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

  test('authentication desktop visual evidence', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'تسجيل الدخول' })).toBeVisible();
    await expect(page.locator('.auth-aside')).toBeVisible();
    await assertRtlAndNoOverflow(page);
    await page.screenshot({ path: 'visual-evidence/auth-desktop.png', fullPage: true });
  });

  test('authentication mobile visual evidence', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'تسجيل الدخول' })).toBeVisible();
    await expect(page.locator('.auth-aside')).toBeVisible();
    await assertRtlAndNoOverflow(page);
    await page.screenshot({ path: 'visual-evidence/auth-mobile.png', fullPage: true });
  });
  test('customer desktop visual evidence', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await login(page, 'customer-a@test.local');
    await expect(page.locator('.portal-header')).toBeVisible();
    await expect(page.locator('.command-launch-button')).toBeVisible();
    await expect(page.locator('.portal-nav')).toBeVisible();
    await expect(page.locator('.portal-bottom-nav')).toBeHidden();
    await expect(page.locator('.product-grid')).toBeVisible();
    await expect(page.locator('.hero-card')).toBeVisible();
    await expect(page.locator('.purchase-shortcuts')).toBeVisible();
    await expect(page.locator('.purchase-shortcut-grid button').first()).toBeVisible();
    await page.screenshot({ path: 'visual-evidence/customer-desktop.png', fullPage: true });

    const detailButton = page.getByRole('button', { name: 'عرض التفاصيل', exact: true }).first();
    await expect(detailButton).toBeVisible();
    await detailButton.click();
    await expect(page.getByRole('dialog', { name: 'تفاصيل المنتج' })).toBeVisible();
    await assertRtlAndNoOverflow(page);
    await page.screenshot({ path: 'visual-evidence/customer-product-detail-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'إغلاق تفاصيل المنتج' }).click();

    await page.getByRole('banner').getByRole('button', { name: /السلة/ }).click();
    await expect(page.getByRole('dialog', { name: /السلة/ })).toBeVisible();
    await assertRtlAndNoOverflow(page);
    await page.screenshot({ path: 'visual-evidence/customer-cart-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'إغلاق السلة' }).click();

    await page.getByRole('button', { name: 'طلباتي', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'طلباتك وشحناتك' })).toBeVisible();
    await assertRtlAndNoOverflow(page);
    await page.screenshot({ path: 'visual-evidence/customer-orders-desktop.png', fullPage: true });

    const templatesNav = page.getByRole('button', { name: 'قوالب الطلبات', exact: true });
    if (await templatesNav.count()) {
      await templatesNav.click();
      await expect(page.getByRole('heading', { name: 'قوالب الطلبات الجاهزة' })).toBeVisible();
      await assertRtlAndNoOverflow(page);
      await page.screenshot({ path: 'visual-evidence/customer-templates-desktop.png', fullPage: true });
    }

    const financeNav = page.getByRole('button', { name: 'المركز المالي', exact: true });
    if (await financeNav.count()) {
      await financeNav.click();
      await expect(page.getByRole('heading', { name: 'المركز المالي' })).toBeVisible();
      await assertRtlAndNoOverflow(page);
      await page.screenshot({ path: 'visual-evidence/customer-finance-desktop.png', fullPage: true });
    }
  });

  test('customer mobile visual evidence', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, 'customer-a@test.local');
    await expect(page.locator('.portal-header')).toBeVisible();
    await expect(page.locator('.portal-nav')).toBeVisible();
    await expect(page.locator('.portal-bottom-nav')).toBeVisible();
    await expect(page.locator('.product-grid')).toBeVisible();
    await expect(page.locator('.hero-card')).toBeVisible();
    await expect(page.locator('.command-launch-button')).toBeHidden();
    await expect(page.locator('.portal-bottom-nav')).toBeVisible();
    await expect(page.locator('.purchase-shortcuts')).toBeVisible();
    await page.screenshot({ path: 'visual-evidence/customer-mobile.png', fullPage: true });
  });

  test('staff desktop visual evidence', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await login(page, 'admin-a@test.local');
    await expect(page.getByRole('heading', { name: 'مركز التحكم' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.staff-section-rail')).toBeVisible();
    await expect(page.locator('.admin-operations')).toBeVisible();
    await expect(page.locator('.status-distribution-card')).toBeVisible();
    await expect(page.locator('.status-donut')).toBeVisible();
    await expect(page.locator('#admin-customers')).toBeVisible();
    await expect(page.locator('#admin-inventory')).toBeVisible();
    await expect(page.locator('#admin-purchasing')).toBeVisible();
    await expect(page.locator('#admin-finance')).toBeVisible();
    await expect(page.locator('#admin-settings')).toBeVisible();
    const staffDetailButtons = page.getByRole('button', { name: 'عرض التفاصيل', exact: true });
    if (await staffDetailButtons.count()) {
      await staffDetailButtons.first().click();
      await expect(page.getByRole('dialog', { name: 'تفاصيل الطلب' })).toBeVisible();
      await assertRtlAndNoOverflow(page);
      await page.screenshot({ path: 'visual-evidence/staff-order-detail-desktop.png', fullPage: true });
      await page.getByRole('button', { name: 'إغلاق تفاصيل الطلب الإداري' }).click();
    }
    await page.screenshot({ path: 'visual-evidence/staff-desktop.png', fullPage: true });

    const adminScreens = [
      ['admin-orders', 'staff-orders-desktop'],
      ['admin-customers', 'staff-customers-desktop'],
      ['admin-inventory', 'staff-inventory-desktop'],
      ['admin-purchasing', 'staff-purchasing-desktop'],
      ['admin-finance', 'staff-finance-desktop'],
      ['admin-export', 'staff-export-desktop'],
      ['admin-settings', 'staff-settings-desktop'],
    ] as const;
    for (const [id, filename] of adminScreens) {
      const section = page.locator(`#${id}`).first();
      if (await section.count() && await section.isVisible().catch(() => false)) {
        await section.scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
        await assertRtlAndNoOverflow(page);
        await page.screenshot({ path: `visual-evidence/${filename}.png`, fullPage: false });
      }
    }
  });

  test('staff mobile visual evidence', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, 'admin-a@test.local');
    await expect(page.getByRole('heading', { name: 'مركز التحكم' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.staff-section-rail')).toBeVisible();
    await expect(page.locator('.admin-operations')).toBeVisible();
    await expect(page.locator('.staff-bottom-nav')).toBeVisible();
    await page.screenshot({ path: 'visual-evidence/staff-mobile.png', fullPage: true });
  });
});
