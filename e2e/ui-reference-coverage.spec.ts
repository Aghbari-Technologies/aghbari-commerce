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
      await page.screenshot({ path: 'test-results/ui-customer-' + section + '-desktop.png', fullPage: true });
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

    await page.getByRole('dialog', { name: 'المزيد من بوابة الأغبري' })
      .getByRole('button', { name: 'المركز المالي', exact: true })
      .click();
    await expect(page.locator('.customer-finance-panel').first()).toBeVisible();
    await page.screenshot({ path: 'test-results/ui-customer-finance-mobile.png', fullPage: true });
  });

  test('customer portal: nested buying, account and finance surfaces are directly reachable', async ({ page }) => {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    await page.setViewportSize({ width: 1440, height: 1000 });
    await login(page, email!, password!);
    await expect(page.locator('.customer-shell')).toBeVisible();
    await page.getByRole('button', { name: 'الرئيسية', exact: true }).first().click();
    await expect(page).toHaveURL(/#home$/);
    await expect(page.locator('.customer-home-workspace')).toBeVisible();
    await page.screenshot({ path: 'test-results/ui-customer-home-desktop.png', fullPage: true });

    const openCapability = async (sectionLabel: string, capabilityLabel: string, section: string) => {
      await page.getByRole('button', { name: sectionLabel, exact: true }).first().click();
      await expect(page).toHaveURL(new RegExp('#' + section + '$'));
      await page.getByRole('button', { name: new RegExp('^' + capabilityLabel + ' —') }).first().click();
    };

    await openCapability('اكتشاف وشراء', 'البحث', 'catalog');
    await expect(page.locator('input[aria-label="البحث في الكتالوج"]')).toBeFocused();
    await page.screenshot({ path: 'test-results/ui-customer-search-desktop.png', fullPage: true });

    await openCapability('اكتشاف وشراء', 'التصنيفات', 'catalog');
    await expect(page.locator('.category-row')).toBeVisible();
    await page.screenshot({ path: 'test-results/ui-customer-categories-desktop.png', fullPage: true });

    await openCapability('اكتشاف وشراء', 'الطلب السريع', 'catalog');
    await expect(page.getByRole('dialog', { name: 'الطلب السريع' })).toBeVisible();
    await page.screenshot({ path: 'test-results/ui-customer-quick-order-desktop.png', fullPage: true });
    await page.getByRole('dialog', { name: 'الطلب السريع' }).getByRole('button').first().click();

    await openCapability('اكتشاف وشراء', 'الأسعار', 'catalog');
    await expect(page.getByRole('dialog', { name: 'قائمة الأسعار' })).toBeVisible();
    await page.screenshot({ path: 'test-results/ui-customer-pricing-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'إغلاق قائمة الأسعار' }).click();

    await openCapability('الحساب والشركة', 'الهوية والجلسة', 'account');
    await expect(page.locator('.customer-account-workspace')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'الملف الشخصي' })).toBeVisible();
    await page.screenshot({ path: 'test-results/ui-customer-account-profile-desktop.png', fullPage: true });

    await page.getByRole('tab', { name: 'العناوين' }).click();
    await expect(page.getByRole('heading', { name: 'عناوين التسليم' })).toBeVisible();
    await page.screenshot({ path: 'test-results/ui-customer-addresses-desktop.png', fullPage: true });

    await page.getByRole('tab', { name: 'إعدادات الحساب' }).click();
    await expect(page.getByRole('heading', { name: 'إعدادات الحساب' })).toBeVisible();
    await page.screenshot({ path: 'test-results/ui-customer-account-settings-desktop.png', fullPage: true });

    await page.getByRole('button', { name: 'المركز المالي', exact: true }).first().click();
    await expect(page).toHaveURL(/#finance$/);
    await page.getByRole('tab', { name: 'كشف الحساب' }).click();
    await expect(page.getByRole('tab', { name: 'كشف الحساب' })).toHaveAttribute('aria-selected', 'true');
    await page.screenshot({ path: 'test-results/ui-customer-statement-desktop.png', fullPage: true });

    await page.getByRole('tab', { name: 'سجل الدفعات' }).click();
    await expect(page.getByRole('tab', { name: 'سجل الدفعات' })).toHaveAttribute('aria-selected', 'true');
    await page.screenshot({ path: 'test-results/ui-customer-payment-history-desktop.png', fullPage: true });
  });

  test('customer portal: cart and checkout surface is reachable from catalog', async ({ page }) => {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    await page.setViewportSize({ width: 1440, height: 1000 });
    await login(page, email!, password!);
    await page.getByRole('button', { name: 'الكتالوج', exact: true }).first().click();
    await expect(page).toHaveURL(/#catalog$/);

    const addButton = page.locator('.add-button').filter({ hasText: /إضافة للسلة|إضافة أخرى/ }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    await expect(page.getByRole('dialog', { name: /السلة ·/ })).toBeVisible();
    await page.screenshot({ path: 'test-results/ui-customer-cart-desktop.png', fullPage: true });

    const confirmQuantity = page.getByRole('button', { name: 'اعتماد الكمية', exact: true }).first();
    if (await confirmQuantity.isVisible()) await confirmQuantity.click();

    await page.getByRole('button', { name: 'متابعة إلى إتمام الطلب', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'مراجعة وإرسال الطلب' })).toBeVisible();
    await page.screenshot({ path: 'test-results/ui-customer-checkout-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'العودة للسلة', exact: true }).click();
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
      await expect(target, 'Missing live Admin anchor #' + id).toBeVisible();
      await target.scrollIntoViewIfNeeded();
    }

    await page.screenshot({ path: 'test-results/ui-admin-control-plane-full.png', fullPage: true });
    await expect(page.getByText('العامري', { exact: false })).toHaveCount(0);
  });
});
