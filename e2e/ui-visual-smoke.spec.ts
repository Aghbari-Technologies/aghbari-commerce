import { expect, test, type Page } from '@playwright/test';

async function login(page: Page, email: string, password: string, expectedSurface: 'customer' | 'admin') {
  await page.goto('/');
  const loginForm = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await loginForm.locator('input[type="email"]').fill(email);
  await loginForm.locator('input[type="password"]').fill(password);
  await loginForm.getByRole('button', { name: 'دخول آمن' }).click();
  if (expectedSurface === 'customer') {
    await expect(page.locator('.customer-shell')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'الكتالوج', exact: true })).toBeVisible();
  } else {
    await expect(page.getByRole('heading', { name: 'مركز التحكم' }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.admin-panel')).toBeVisible();
  }
}

test('customer portal visual baseline', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  expect(email).toBeTruthy();
  expect(password).toBeTruthy();
  await login(page, email!, password!, 'customer');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/visual-customer-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'طلباتي', exact: true }).click();
  await expect(page.locator('.customer-shell')).toContainText('طلباتي');
  await page.screenshot({ path: 'test-results/visual-customer-orders-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'الكتالوج', exact: true }).click();
  await page.screenshot({ path: 'test-results/visual-customer-mobile.png', fullPage: true });
});

test('admin workspace visual baseline', async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  expect(email).toBeTruthy();
  expect(password).toBeTruthy();
  await login(page, email!, password!, 'admin');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/visual-admin-desktop.png', fullPage: true });
});
