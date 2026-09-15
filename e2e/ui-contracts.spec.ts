import { test, expect } from '@playwright/test';

test('public shell has Arabic RTL identity, security headers and no legacy branding', async ({ page }) => {
  const response = await page.goto('/');
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);

  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page).toHaveTitle(/الأغبري/);
  await expect(page.getByText('بوابة الأغبري التجارية', { exact: true })).toBeVisible();
  await expect(page.getByText('العامري', { exact: false })).toHaveCount(0);
  await expect(page.getByText(/Alamri|Al-Amri/i)).toHaveCount(0);

  const headers = await response.allHeaders();
  expect(headers['content-security-policy'] ?? '').toContain("frame-ancestors 'none'");
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
});

test('PWA manifest is Arabic RTL and service worker is actually registered with a root scope', async ({ page, request }) => {
  const manifestResponse = await request.get('/manifest.webmanifest');
  expect(manifestResponse.status()).toBe(200);
  const manifest = await manifestResponse.json();
  expect(manifest.lang).toBe('ar');
  expect(manifest.dir).toBe('rtl');
  expect(manifest.name).toMatch(/الأغبري/);
  expect(manifest.start_url).toBe('/');
  expect(manifest.scope).toBe('/');
  expect(manifest.display).toBe('standalone');

  const serviceWorkerResponse = await request.get('/sw.js');
  expect(serviceWorkerResponse.status()).toBe(200);
  const serviceWorkerSource = await serviceWorkerResponse.text();
  expect(serviceWorkerSource).toContain('addEventListener');
  expect(serviceWorkerSource).toContain("url.pathname.startsWith('/api/')");
  expect(serviceWorkerSource).toContain("url.pathname.includes('/auth/')");

  await page.goto('/');
  await expect.poll(async () => page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.getRegistration('/');
    return Boolean(registration);
  }), { timeout: 10_000 }).toBe(true);

  const registrationState = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { supported: false, registered: false, scope: '' };
    const registration = await navigator.serviceWorker.getRegistration('/');
    return { supported: true, registered: Boolean(registration), scope: registration?.scope ?? '' };
  });
  expect(registrationState.supported).toBe(true);
  expect(registrationState.registered).toBe(true);
  expect(registrationState.scope).toMatch(/\/$/);
});

test('login shell exposes accessible authentication controls and actionable errors', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await expect(form).toBeVisible();

  const email = form.locator('input[type="email"]');
  const password = form.locator('input[type="password"]');
  await expect(email).toHaveAttribute('autocomplete', 'email');
  await expect(password).toHaveAttribute('autocomplete', 'current-password');
  await expect(email).toHaveAttribute('required', '');
  await expect(password).toHaveAttribute('required', '');
  await expect(form.getByRole('button', { name: 'دخول آمن' })).toBeEnabled();

  await email.fill('invalid@example.invalid');
  await password.fill('definitely-wrong-password');
  await form.getByRole('button', { name: 'دخول آمن' }).click();
  await expect(page.locator('[role="alert"]')).toBeVisible();
});

test('offline mode gives explicit status and keeps checkout unavailable', async ({ page, context }) => {
  await page.goto('/');
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) throw new Error('E2E_EMAIL and E2E_PASSWORD are required for authenticated offline proof.');

  const form = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
  await form.locator('input[type="email"]').fill(email);
  await form.locator('input[type="password"]').fill(password);
  await form.getByRole('button', { name: 'دخول آمن' }).click();
  await expect(page.getByRole('link', { name: 'المنتجات' })).toBeVisible();

  await context.setOffline(true);
  await expect(page.getByRole('status')).toContainText('دون اتصال');
  await expect(page.getByText('أنت الآن دون اتصال')).toBeVisible();

  const checkout = page.getByRole('button', { name: 'إرسال طلب الجملة' });
  if (await checkout.count()) await expect(checkout).toBeDisabled();

  await context.setOffline(false);
});
