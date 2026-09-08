import { useCallback, useEffect, useState } from 'react';
import { getDeviceChangeRequests, reviewDeviceChangeRequest, type DeviceChangeRequest } from './services/security';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';

export default function SecurityCenter({ role }: { role: UserRole }) {
  const canReview = role === 'owner' || role === 'admin';
  const [requests, setRequests] = useState<DeviceChangeRequest[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try { setRequests(await getDeviceChangeRequests()); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذر تحميل طلبات الأجهزة.'); }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function review(id: string, approve: boolean) {
    setBusy(id); setError(null);
    try { await reviewDeviceChangeRequest(id, approve, approve ? 'تمت الموافقة بعد مراجعة الحساب.' : 'تم رفض الطلب بعد مراجعة الحساب.'); await reload(); }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذر معالجة طلب تغيير الجهاز.'); }
    finally { setBusy(null); }
  }

  return <section className="admin-live-card security-center" id="security">
    <div className="section-heading"><div><span className="eyebrow">الأمان</span><h3>أجهزة العملاء وطلبات التغيير</h3></div><span>{requests.filter((item) => item.status === 'pending').length} قيد المراجعة</span></div>
    <p>حساب العميل مرتبط بجهاز واحد. تغيير الجهاز يمر بطلب وموافقة إدارية بدل فتح جلسة جديدة بشكل غير مراقب.</p>
    {error && <div className="error-banner" role="alert">{error}</div>}
    {!requests.length ? <div className="security-empty">لا توجد طلبات تغيير جهاز.</div> : <div className="security-requests">{requests.map((item) => <article key={item.id} className="security-request"><div><strong>طلب جهاز للعميل</strong><small>الحالة: {item.status} · {new Date(item.created_at).toLocaleString('ar-YE')}</small><small>السبب: {item.reason ?? 'غير محدد'}</small></div>{canReview && item.status === 'pending' && <div className="security-actions"><button disabled={busy === item.id} onClick={() => void review(item.id, true)}>موافقة</button><button disabled={busy === item.id} onClick={() => void review(item.id, false)}>رفض</button></div>}</article>)}</div>}
  </section>;
}
