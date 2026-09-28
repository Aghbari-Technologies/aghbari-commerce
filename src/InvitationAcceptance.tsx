import { useState, type FormEvent } from 'react';
import { supabase } from './lib/supabase';

export default function InvitationAcceptance({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setSuccess('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/i.test(token)) return setError('رابط الدعوة غير صالح.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return setError('أدخل البريد المرتبط بالدعوة.');
    if (password.length < 8 || password.length > 256 || password !== confirm) return setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل ومتطابقة.');
    setLoading(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('customer-invitations', { body: { action: 'accept', token: token.toLowerCase(), email: normalizedEmail, password } });
      if (invokeError || !data?.ok) throw new Error(data?.error || invokeError?.message || 'تعذر قبول الدعوة.');
      const { error: loginError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (loginError) throw loginError;
      setSuccess('تم تفعيل حسابك وربطه بحساب العميل. جارٍ فتح البوابة التجارية…');
      window.setTimeout(() => { window.location.assign('/'); }, 700);
    } catch (err) { setError(err instanceof Error ? err.message : 'تعذر قبول الدعوة.'); }
    finally { setLoading(false); }
  }

  return <div className="customer-shell auth-shell" dir="rtl"><div className="auth-card"><span className="eyebrow">بوابة الأغبري</span><h1>تفعيل حساب العميل</h1><p>أدخل البريد المدعو وأنشئ كلمة مرور. الرابط أحادي الاستخدام وينتهي تلقائيًا.</p><form onSubmit={submit}><input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="البريد المرتبط بالدعوة" autoComplete="email" aria-label="البريد المرتبط بالدعوة" required/><input value={password} onChange={e => setPassword(e.target.value)} type="password" minLength={8} maxLength={256} placeholder="كلمة المرور الجديدة" autoComplete="new-password" required/><input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" minLength={8} maxLength={256} placeholder="تأكيد كلمة المرور" autoComplete="new-password" required/>{error && <div className="error-banner" role="alert">{error}</div>}{success && <div className="success" role="status">{success}</div>}<button disabled={loading}>{loading ? 'جارٍ تفعيل الحساب…' : 'قبول الدعوة وتفعيل الحساب'}</button></form></div></div>;
}
