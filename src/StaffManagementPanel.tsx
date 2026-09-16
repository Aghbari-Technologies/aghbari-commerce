import { useCallback, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
interface OrganizationUser { user_id: string; email: string | null; role: UserRole; customer_id: string | null; created_at: string; }
const ROLES: UserRole[] = ['owner', 'admin', 'sales', 'warehouse', 'viewer'];
const LABELS: Record<UserRole,string> = { owner: 'مالك', admin: 'مدير', sales: 'مبيعات', warehouse: 'مستودع', viewer: 'مشاهد' };

export default function StaffManagementPanel({ role }: { role: UserRole }) {
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase || !['owner', 'admin'].includes(role)) return;
    setLoading(true); setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('list_organization_users');
      if (rpcError) throw rpcError;
      setUsers((data ?? []) as OrganizationUser[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل أعضاء المؤسسة.');
    } finally { setLoading(false); }
  }, [role]);

  useEffect(() => { void load(); }, [load]);

  async function changeRole(userId: string, nextRole: UserRole) {
    if (!supabase || role !== 'owner') return;
    setBusy(userId); setError(null); setMessage(null);
    try {
      const { error: rpcError } = await supabase.rpc('set_organization_user_role', { p_user_id: userId, p_role: nextRole });
      if (rpcError) throw rpcError;
      setMessage('تم تحديث دور عضو المؤسسة وتسجيل العملية في سجل التدقيق.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحديث الدور.');
    } finally { setBusy(null); }
  }

  if (!['owner', 'admin'].includes(role)) return null;

  return <section className="cart-panel" aria-labelledby="staff-management-heading">
    <div className="section-heading">
      <div><span className="eyebrow">المنظمة والصلاحيات</span><h2 id="staff-management-heading">المستخدمون والأدوار</h2></div>
      <span>{users.length} أعضاء</span>
    </div>
    <p>عضوية المؤسسة مرتبطة بالخادم، وتغيير الأدوار لا يعتمد على إخفاء عناصر الواجهة فقط.</p>
    {loading ? <div className="cart-empty">جارٍ تحميل المستخدمين…</div> : users.length === 0 ? <div className="cart-empty">لا يوجد أعضاء ظاهرون لهذه المؤسسة.</div> : <div className="cart-lines">
      {users.map((user) => <article className="cart-line" key={user.user_id}>
        <div><strong>{user.email ?? user.user_id}</strong><small>العضوية: {user.customer_id ? 'مرتبطة بعميل' : 'موظف/إدارة'}</small></div>
        <div><strong>{LABELS[user.role]}</strong><small>{new Date(user.created_at).toLocaleDateString('ar')}</small></div>
        {role === 'owner' ? <select aria-label={`دور ${user.email ?? user.user_id}`} disabled={busy === user.user_id} value={user.role} onChange={(e) => void changeRole(user.user_id, e.target.value as UserRole)}>{ROLES.map((item) => <option key={item} value={item}>{LABELS[item]}</option>)}</select> : <span>{LABELS[user.role]}</span>}
      </article>)}
    </div>}
    {error && <div className="error-banner" role="alert">{error}</div>}
    {message && <div className="success" role="status">{message}</div>}
  </section>;
}
