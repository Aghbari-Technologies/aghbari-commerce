import { expect, test } from '@playwright/test';

test.describe('Admin control plane exact browser path', () => {
  test('admin can enter and operate the control plane', async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    await page.goto('/');
    const loginForm = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
    await loginForm.locator('input[type="email"]').fill(email!);
    await loginForm.locator('input[type="password"]').fill(password!);
    await loginForm.getByRole('button', { name: 'دخول آمن' }).click();

    await expect(page.getByRole('heading', { name: 'مركز التحكم' }).first()).toBeVisible();
    await expect(page.locator('#admin-access')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'الأدوار والصلاحيات' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'إدارة الطلبات' })).toBeVisible();
    await expect(page.locator('#admin-notifications')).toBeVisible();
    await expect(page.locator('#admin-governance')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'إشعارات مركز التشغيل' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'التدقيق والتكاملات' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'سجل التدقيق', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'صندوق التكاملات', exact: true })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'منتج جديد' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'تعديل المخزون' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'استيراد Excel آمن' })).toBeVisible();

    await expect(page.getByText('العامري', { exact: false })).toHaveCount(0);
    await expect(page.getByText('الأغبري', { exact: false }).first()).toBeVisible();
  });
});
