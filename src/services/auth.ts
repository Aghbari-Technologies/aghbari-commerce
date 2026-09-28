import { requireSupabase } from '../lib/supabase';

export function friendlyAuthError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  const normalized = raw.toLowerCase();
  if (normalized.includes('invalid login credentials')) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  if (normalized.includes('email not confirmed')) return 'لم يتم تأكيد البريد الإلكتروني لهذا الحساب بعد.';
  if (normalized.includes('too many requests')) return 'تم تجاوز عدد محاولات الدخول مؤقتًا. حاول لاحقًا.';
  if (normalized.includes('network') || normalized.includes('fetch')) return 'تعذر الاتصال بخدمة الدخول. تحقق من الشبكة ثم أعد المحاولة.';
  return raw || 'تعذر إتمام عملية المصادقة.';
}

export async function getSession() {
  const { data, error } = await requireSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  return data.session;
}

export async function resetPassword(email: string, redirectTo: string) {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}
