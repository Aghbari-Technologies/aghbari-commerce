import { expect, test, type Page } from '@playwright/test';

function captureFailures(page: Page) {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(`pageerror:${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') failures.push(`console:${message.text()}`); });
  page.on('response', (response) => {
    if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) {
      failures.push(`http:${response.status()}:${response.request().method()}:${response.url()}`);
    }
  });
  return failures;
}

test('authenticated admin opens the real operational control plane', async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL?.trim();
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD are required; admin runtime tests must never silently skip.');

  const failures = captureFailures(page);
  await page.goto('/');
  await page.getByPlaceholder('البريد الإلكتروني').fill(email);
  await page.getByPlaceholder('كلمة المرور').fill(password);
  await page.getByRole('button', { name: 'دخول آمن' }).click();

  await expect(page.getByText('مركز الإدارة')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('مركز التحكم')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('منتج جديد')).toBeVisible();
  await expect(page.getByText('تسعير حسب الفئة')).toBeVisible();
  await expect(page.getByText('تعديل المخزون')).toBeVisible();
  await expect(page.getByText('إدارة الطلبات')).toBeVisible();
  await expect(page.getByText('دورة العميل')).toBeVisible();
  await expect(page.getByText('دورة التوريد')).toBeVisible();
  await expect(page.getByText('الفواتير والتحصيل والمصروفات')).toBeVisible();
  await expect(page.getByText('تصدير بيانات التشغيل')).toBeVisible();
  await expect(page.getByText('التحكم الديناميكي بتطبيق العميل')).toBeVisible();

  await expect(page.getByRole('button', { name: 'حفظ المنتج' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'اعتماد السعر' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'تسجيل الحركة' })).toBeEnabled();

  expect(failures, `Admin runtime failures: ${failures.join(' | ')}`).toEqual([]);
});
