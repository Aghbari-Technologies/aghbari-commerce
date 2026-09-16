import { test, expect, type Page } from '@playwright/test';

async function loginAdmin(page: Page, email: string, password: string) {
  await page.goto('/');
  await expect(page.getByText('بوابة الأغبري', { exact: false }).first()).toBeVisible();
  const loginForm = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await loginForm.locator('input[type="email"]').fill(email);
  await loginForm.locator('input[type="password"]').fill(password);
  await loginForm.getByRole('button', { name: 'دخول آمن' }).click();
  await expect(page.getByRole('button', { name: 'الحساب', exact: true }).or(page.getByText('مركز التحكم', { exact: true }).first())).toBeVisible();
}

function captureBrowserFailures(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedResponses: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', (response) => {
    const status = response.status();
    if (status >= 400 && !response.url().endsWith('/favicon.ico')) {
      failedResponses.push(`${status} ${response.request().method()} ${response.url()}`);
    }
  });
  return { pageErrors, consoleErrors, failedResponses };
}

test('owner/admin can open the real control plane and all core management surfaces', async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required; admin runtime proof must never silently skip.');
  }

  const failures = captureBrowserFailures(page);
  await loginAdmin(page, email, password);

  await expect(page.getByText('مركز التحكم', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('مركز التشغيل التفصيلي وإدارة البيانات', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'منتج جديد' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'تصنيف جديد' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'تسعير حسب الفئة' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'صورة المنتج' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'استيراد Excel آمن' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'تعديل المخزون' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'إدارة الطلبات' })).toBeVisible();

  await expect(page.getByText('العملاء', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('المخزون', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('المالية', { exact: false }).first()).toBeVisible();

  expect(failures.pageErrors, `Uncaught browser errors: ${failures.pageErrors.join(' | ')}`).toEqual([]);
  expect(failures.consoleErrors, `Browser console errors: ${failures.consoleErrors.join(' | ')}`).toEqual([]);
  expect(failures.failedResponses, `HTTP responses >= 400: ${failures.failedResponses.join(' | ')}`).toEqual([]);
});
