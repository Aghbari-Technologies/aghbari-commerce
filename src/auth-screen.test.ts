import { describe, expect, it } from 'vitest';
import { friendlyAuthError } from './services/auth';

describe('Aghbari authentication contract', () => {
  it('maps common Supabase sign-in failures to user-safe Arabic messages', () => {
    expect(friendlyAuthError(new Error('Invalid login credentials'))).toContain('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    expect(friendlyAuthError(new Error('Email not confirmed'))).toContain('لم يتم تأكيد البريد الإلكتروني');
    expect(friendlyAuthError(new Error('Too many requests'))).toContain('تجاوز عدد محاولات الدخول');
  });

  it('never leaks an empty or undefined error message', () => {
    expect(friendlyAuthError(null)).toBe('تعذر إتمام عملية المصادقة.');
  });

  it('keeps unexpected provider errors visible without replacing them with fake success', () => {
    expect(friendlyAuthError(new Error('provider unavailable'))).toBe('provider unavailable');
  });
});
