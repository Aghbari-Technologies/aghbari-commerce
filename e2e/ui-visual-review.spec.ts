import { test, expect, type Page } from '@playwright/test';

const PASSWORD = process.env.E2E_PASSWORD ?? process.env.E2E_ADMIN_PASSWORD ?? '';

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
    return (await page.getByRole('complementary', { name: 'تنقل البوابة' }).getByRole('button', { name: /الكتالوج/ }).first().isVisible().catch(() => false))
      || (await page.getByRole('heading', { name: 'مركز التحكم' }).first().isVisible().catch(() => false));
  }, { timeout: 15000 }).toBeTruthy();
  await assertRtlAndNoOverflow(page);
}

async function prepareViewportCapture(page: Page) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  });
  await page.waitForFunction(() => window.scrollY === 0 || document.documentElement.scrollTop === 0);
  await page.waitForTimeout(250);
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
    await prepareViewportCapture(page);
    await page.screenshot({ path: 'visual-evidence/auth-mobile.png', fullPage: false });
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
    await expect(page.locator('.product-detail-modal')).toBeVisible();
    await assertRtlAndNoOverflow(page);
    await page.screenshot({ path: 'visual-evidence/customer-product-detail-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'إغلاق تفاصيل المنتج' }).click();

    await page.getByRole('banner').getByRole('button', { name: /السلة/ }).click();
    await expect(page.getByRole('dialog', { name: /السلة/ })).toBeVisible();
    await assertRtlAndNoOverflow(page);
    await page.screenshot({ path: 'visual-evidence/customer-cart-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'إغلاق السلة' }).click();

    await page.getByRole('button', { name: /^طلباتي/ }).first().click();
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
    await expect(page.locator('.purchase-shortcuts')).toBeVisible();
    await prepareViewportCapture(page);
    await page.screenshot({ path: 'visual-evidence/customer-mobile.png', fullPage: false });

    const mobileDetail = page.getByRole('button', { name: 'عرض التفاصيل', exact: true }).first();
    if (await mobileDetail.count()) {
      await mobileDetail.click();
      await expect(page.locator('.product-detail-modal')).toBeVisible();
      await prepareViewportCapture(page);
      await page.screenshot({ path: 'visual-evidence/customer-mobile-product-detail.png', fullPage: false });
      await page.getByRole('button', { name: 'إغلاق تفاصيل المنتج' }).click();
    }

    await page.getByRole('banner').getByRole('button', { name: /السلة/ }).click();
    await expect(page.getByRole('dialog', { name: /السلة/ })).toBeVisible();
    await prepareViewportCapture(page);
    await page.screenshot({ path: 'visual-evidence/customer-mobile-cart.png', fullPage: false });
    await page.getByRole('button', { name: 'إغلاق السلة' }).click();

    const mobileOrders = page.locator('.portal-nav').getByRole('button', { name: 'طلباتي', exact: true });
    if (await mobileOrders.count()) {
      await mobileOrders.click();
      await expect(page.getByRole('heading', { name: 'طلباتك وشحناتك' })).toBeVisible();
      await prepareViewportCapture(page);
      await page.screenshot({ path: 'visual-evidence/customer-mobile-orders.png', fullPage: false });
    }

    const mobileTemplates = page.locator('.portal-nav').getByRole('button', { name: 'قوالب الطلبات', exact: true });
    if (await mobileTemplates.count()) {
      await mobileTemplates.click();
      await expect(page.getByRole('heading', { name: 'قوالب الطلبات الجاهزة' })).toBeVisible();
      await prepareViewportCapture(page);
      await page.screenshot({ path: 'visual-evidence/customer-mobile-templates.png', fullPage: false });
    }

    const mobileFinance = page.locator('.portal-nav').getByRole('button', { name: 'المركز المالي', exact: true });
    if (await mobileFinance.count()) {
      await mobileFinance.click();
      await expect(page.getByRole('heading', { name: 'المركز المالي' })).toBeVisible();
      await prepareViewportCapture(page);
      await page.screenshot({ path: 'visual-evidence/customer-mobile-finance.png', fullPage: false });
    }
  });

  test('staff desktop visual evidence', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await login(page, 'admin-a@test.local');
    await expect(page.getByRole('heading', { name: 'مركز التحكم' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.staff-section-rail')).toBeVisible();
    await expect(page.locator('.admin-operations')).toBeVisible();
    await expect(page.locator('.status-distribution-card')).toBeVisible();
    await expect(page.locator('#admin-customers')).toBeVisible();
    await expect(page.locator('#admin-inventory')).toBeVisible();
    await expect(page.locator('#admin-purchasing')).toBeVisible();
    await expect(page.locator('#admin-finance')).toBeVisible();
    await expect(page.locator('#admin-settings')).toBeVisible();
    const customerDetailAction = page.locator('#admin-customers').getByRole('button', { name: 'تفاصيل وكشف', exact: true }).first();
    await expect(customerDetailAction).toBeVisible();
    await customerDetailAction.click();
    await expect(page.locator('#customer-detail-modal')).toBeVisible();
    await expect(page.locator('#customer-detail-modal .modal-head .eyebrow', { hasText: 'ملف العميل' })).toBeVisible();
    await assertRtlAndNoOverflow(page);
    await page.screenshot({ path: 'visual-evidence/staff-customer-detail-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'إغلاق ملف العميل' }).click();

    const governance = page.locator('#admin-access').first();
    await expect(governance).toBeVisible();
    await governance.scrollIntoViewIfNeeded();
    await assertRtlAndNoOverflow(page);
    await page.screenshot({ path: 'visual-evidence/staff-governance-desktop.png', fullPage: false });

    const purchasing = page.locator('#admin-purchasing').first();
    await expect(purchasing).toBeVisible();
    const visualToken = Date.now().toString(36);
    const visualSupplierName = `Visual Supplier ${visualToken}`;
    const visualSupplierEmail = `supplier-${visualToken}@visual.test`;
    const visualBillNumber = `VIS-${visualToken}`;
    const supplierName = purchasing.getByLabel('اسم المورد');
    await supplierName.fill(visualSupplierName);
    await purchasing.getByLabel('هاتف المورد').fill('711000001');
    await purchasing.getByLabel('بريد المورد').fill(visualSupplierEmail);
    await purchasing.getByRole('button', { name: 'حفظ المورد', exact: true }).click();
    await expect(page.getByText('تم إنشاء المورد وتسجيل أثر العملية.', { exact: true })).toBeVisible({ timeout: 10000 });
    const supplierAction = purchasing.getByRole('button', { name: 'ملف المورد', exact: true }).first();
    await expect(supplierAction).toBeVisible();
    await supplierAction.click();
    await expect(page.getByRole('dialog', { name: visualSupplierName })).toBeVisible();
    await expect(page.locator('.supplier-accounting')).toBeVisible();
    await expect(page.getByText('فاتورة مورد جديدة', { exact: true })).toBeVisible();
    await page.getByLabel('رقم فاتورة المورد').fill(visualBillNumber);
    await page.getByLabel('إجمالي فاتورة المورد').fill('1250');
    await page.getByRole('button', { name: 'إصدار فاتورة المورد', exact: true }).click();
    await expect(page.getByText('تم إصدار فاتورة المورد وتسجيلها في كشف الحساب.', { exact: true })).toBeVisible({ timeout: 10000 });
    const billRow = page.locator('.supplier-accounting .cart-line').filter({ hasText: `فاتورة ${visualBillNumber}` }).first();
    await expect(billRow).toBeVisible();
    await billRow.getByRole('button', { name: 'سداد', exact: true }).click();
    await billRow.getByLabel(`مبلغ سداد ${visualBillNumber}`).fill('250');
    await billRow.getByLabel(`طريقة سداد ${visualBillNumber}`).selectOption('bank_transfer');
    await billRow.getByRole('button', { name: 'تسجيل السداد', exact: true }).click();
    await expect(page.getByText('تم تسجيل سداد المورد وتحديث حالة الفاتورة.', { exact: true })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'visual-evidence/staff-supplier-accounting-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'إغلاق ملف المورد' }).click();

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
    await prepareViewportCapture(page);
    await page.screenshot({ path: 'visual-evidence/staff-mobile.png', fullPage: false });

    const mobileStaffTargets = [
      ['الطلبات', 'admin-orders', 'staff-mobile-orders'],
      ['المخزون', 'admin-inventory', 'staff-mobile-inventory'],
      ['العملاء', 'admin-customers', 'staff-mobile-customers'],
      ['المالية', 'admin-finance', 'staff-mobile-finance'],
      ['الإعدادات', 'admin-settings', 'staff-mobile-settings'],
    ] as const;
    for (const [label, id, filename] of mobileStaffTargets) {
      const navButton = page.locator('.staff-bottom-nav').getByRole('button', { name: label, exact: true });
      if (await navButton.count()) {
        await navButton.click();
        await expect(page.locator(`#${id}`).first()).toBeVisible();
        await page.waitForTimeout(120);
        await prepareViewportCapture(page);
        await page.screenshot({ path: `visual-evidence/${filename}.png`, fullPage: false });
      }
    }
  });
});
