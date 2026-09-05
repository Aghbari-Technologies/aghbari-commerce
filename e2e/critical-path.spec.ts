import { test, expect } from '@playwright/test';

test('authenticated customer completes real catalog → cart → order → refresh path', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required; runtime tests must never silently skip.');

  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/');
  await expect(page.getByText('بوابة الأغبري', { exact: false }).first()).toBeVisible();

  const loginForm = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await loginForm.locator('input[type="email"]').fill(email);
  await loginForm.locator('input[type="password"]').fill(password);
  await loginForm.getByRole('button', { name: 'دخول آمن' }).click();

  await expect(page.getByRole('link', { name: 'المنتجات' })).toBeVisible();
  await expect(page.getByRole('button', { name: /السلة/ })).toBeVisible();
  await expect(page.getByText('الكتالوج')).toBeVisible();

  const addButton = page.getByRole('button', { name: /إضافة|أضف/ }).first();
  await expect(addButton).toBeVisible();
  await addButton.click();
  await expect(page.getByRole('button', { name: /السلة، 1 أصناف/ })).toBeVisible();

  const checkout = page.getByRole('button', { name: 'إرسال الطلب' });
  await expect(checkout).toBeEnabled();
  await checkout.click();

  const success = page.getByRole('status').filter({ hasText: 'تم إرسال الطلب رقم' }).last();
  await expect(success).toBeVisible();
  await expect(page.getByText('طلباتي')).toBeVisible();
  await expect(page.locator('#orders').getByText(/طلب #/).first()).toBeVisible();

  await page.reload();
  await expect(page.getByRole('link', { name: 'المنتجات' })).toBeVisible();
  await expect(page.locator('#orders').getByText(/طلب #/).first()).toBeVisible();

  expect(pageErrors, `Uncaught browser errors: ${pageErrors.join(' | ')}`).toEqual([]);
});
