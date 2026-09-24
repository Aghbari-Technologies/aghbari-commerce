import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import './operations.css';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
type OrganizationUser = { user_id: string; email: string; role: UserRole; customer_id: string | null; created_at: string };

const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'مالك',
  admin: 'مدير',
  sales: 'مبيعات',
  warehouse: 'مستودع',
  viewer: 'مشاهد',
};

const CAPABILITIES: Array<{ key: string; label: string; roles: UserRole[] }> = [
  { key: 'catalog', label: 'الكتالوج والمنتجات', roles: ['owner', 'admin', 'sales'] },
  { key: 'category', label: 'التصنيفات والتسعير', roles: ['owner', 'admin'] },
  { key: 'inventory', label: 'المخزون والمستودعات', roles: ['owner', 'admin', 'warehouse'] },
  { key: 'orders', label: 'سير الطلبات', roles: ['owner', 'admin', 'sales', 'warehouse'] },
  { key: 'finance', label: 'المالية والتصدير', roles: ['owner', 'admin', 'sales'] },
  { key: 'governance', label: 'التدقيق والتكاملات', roles: ['owner', 'admin', 'sales', 'warehouse'] },
];

export default function StaffAccessPanel({ role }: { role: UserRole }) {
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [drafts, setDrafts] = useState<Record<string, UserRole>>({});
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canManage = role === 'owner';

  const reload = useCallback(async () => {
    if (!supabase) throw new Error('خدمة البيانات غير متاحة.');
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('list_organization_users');
      if (rpcError) throw rpcError;
      const next = (data ?? []) as OrganizationUser[];
      setUsers(next);
      setDrafts(Object.fromEntries(next.map((user) => [user.user_id, user.role])));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل مستخدمي المنظمة.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return users.filter((user) => !needle || user.user_id.toLocaleLowerCase().includes(needle) || user.email.toLocaleLowerCase().includes(needle) || ROLE_LABELS[user.role].toLocaleLowerCase().includes(needle));
  }, [users, query]);

  async function saveRole(user: OrganizationUser) {
    if (!supabase || !canManage) return;
    const nextRole = drafts[user.user_id] ?? user.role;
    if (nextRole === user.role) return;
    if (!window.confirm('اعتماد تغيير دور هذا الحساب؟ سيُسجّل التغيير في سجل التدقيق.')) return;
    setBusyId(user.user_id);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc('set_organization_user_role', { p_user_id: user.user_id, p_role: nextRole });
      if (rpcError) throw rpcError;
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحديث دور الحساب.');
    } finally {
      setBusyId(null);
    }
  }

  return <section className="content-card operations-panel" id="access-control" aria-busy={loading}>
    <div className="section-title">
      <div><span className="eyebrow">Access Control</span><h2>الأدوار والصلاحيات</h2><p className="panel-note">التغيير يمر عبر RPC الكانوني على الخادم؛ حسابات العملاء لا يمكن ترقيتها إلى Staff.</p></div>
      <span>{users.filter((user) => !user.customer_id).length} موظفين · {users.filter((user) => Boolean(user.customer_id)).length} عملاء</span>
    </div>
    <div className="operations-toolbar">
      <input aria-label="بحث مستخدمي المنظمة" placeholder="ابحث بالبريد أو معرف الحساب أو الدور…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <button type="button" className="ghost" onClick={() => void reload()} disabled={loading}>إعادة تحميل</button>
      {!canManage && <span className="permission-hint">قراءة فقط · تغيير الدور يتطلب صلاحية المالك.</span>}
    </div>
    {loading ? <div className="portal-loading" role="status">جارٍ تحميل دليل المستخدمين…</div>
      : error ? <div className="empty-state"><strong>تعذر تحميل الصلاحيات.</strong><span>{error}</span><button type="button" onClick={() => void reload()}>إعادة المحاولة</button></div>
      : !visible.length ? <div className="empty-state"><strong>لا توجد حسابات مطابقة.</strong><span>النتائج محصورة في المنظمة الحالية عبر المسار المحمي.</span></div>
      : <div className="access-table" role="table" aria-label="دليل مستخدمي المنظمة"><div className="access-row access-head" role="row"><span>الحساب</span><span>النوع</span><span>الدور</span><span>الإنشاء</span><span>الإجراء</span></div>{visible.map((user) => {
        const customer = Boolean(user.customer_id);
        const editable = canManage && (!customer || user.role !== 'viewer');
        return <div className="access-row" role="row" key={user.user_id}>
          <div><strong>{user.email}</strong><code dir="ltr">{user.user_id.slice(0, 12)}…</code></div>
          <span>{customer ? 'عميل' : 'موظف'}</span>
          {canManage ? <select aria-label={'دور '+user.email} value={drafts[user.user_id] ?? user.role} onChange={(e) => setDrafts((current) => ({ ...current, [user.user_id]: e.target.value as UserRole }))}>{(customer ? ['viewer'] : (Object.keys(ROLE_LABELS) as UserRole[])).map((item) => <option key={item} value={item}>{ROLE_LABELS[item]}</option>)}</select> : <strong>{ROLE_LABELS[user.role]}</strong>}
          <time>{new Date(user.created_at).toLocaleDateString('ar-YE')}</time>
          <button type="button" disabled={!editable || busyId === user.user_id || (drafts[user.user_id] ?? user.role) === user.role} onClick={() => void saveRole(user)}>{busyId === user.user_id ? 'جارٍ الحفظ…' : 'اعتماد'}</button>
        </div>;
      })}</div>}
    <div className="permission-matrix" aria-label="مصفوفة القدرات التشغيلية">
      <div className="matrix-title"><strong>مصفوفة القدرات الحالية</strong><small>مرآة لعقود مركز الإدارة الحالية؛ الحد الأمني النهائي هو RLS/RPC في قاعدة البيانات.</small></div>
      {CAPABILITIES.map((capability) => <div className="matrix-row" key={capability.key}><span>{capability.label}</span>{(['owner','admin','sales','warehouse','viewer'] as UserRole[]).map((item) => <span className={capability.roles.includes(item) ? 'allowed' : 'blocked'} key={item}>{ROLE_LABELS[item]} {capability.roles.includes(item) ? '✓' : '—'}</span>)}</div>)}
    </div>
  </section>;
}
