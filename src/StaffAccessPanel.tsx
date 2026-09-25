import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import './operations.css';
import RecordDetailDrawer from './RecordDetailDrawer';

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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(null);
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
  useEffect(() => { setPage(1); }, [query]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return users.filter((user) => !needle || user.user_id.toLocaleLowerCase().includes(needle) || user.email.toLocaleLowerCase().includes(needle) || ROLE_LABELS[user.role].toLocaleLowerCase().includes(needle));
  }, [users, query]);
  const accessPages = Math.max(1, Math.ceil(filtered.length / 12));
  const activeAccessPage = Math.min(page, accessPages);
  const visible = filtered.slice((activeAccessPage - 1) * 12, activeAccessPage * 12);

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

  return <section className="content-card operations-panel" id="admin-access" aria-busy={loading}>
    <div className="ops-metrics-strip" aria-label="ملخص الوصول"><article><small>الحسابات</small><strong>{users.length.toLocaleString("ar")}</strong><span>ضمن المنظمة</span></article><article><small>موظفون</small><strong>{users.filter(user=>!user.customer_id).length.toLocaleString("ar")}</strong><span>حسابات فريق</span></article><article><small>عملاء</small><strong>{users.filter(user=>Boolean(user.customer_id)).length.toLocaleString("ar")}</strong><span>حسابات مرتبطة</span></article><article><small>الدور الحالي</small><strong>{ROLE_LABELS[role]}</strong><span>سياق الجلسة</span></article></div>
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
        const editable = canManage && !customer;
        return <div className="access-row" role="row" key={user.user_id}>
          <div><strong>{user.email}</strong><code dir="ltr">{user.user_id.slice(0, 12)}…</code></div>
          <span>{customer ? 'عميل' : 'موظف'}</span>
          {canManage ? <select aria-label={'دور '+user.email} value={drafts[user.user_id] ?? user.role} onChange={(e) => setDrafts((current) => ({ ...current, [user.user_id]: e.target.value as UserRole }))}>{(customer ? (['viewer'] as UserRole[]) : (Object.keys(ROLE_LABELS) as UserRole[])).map((item) => <option key={item} value={item}>{ROLE_LABELS[item]}</option>)}</select> : <strong>{ROLE_LABELS[user.role]}</strong>}
          <time>{new Date(user.created_at).toLocaleDateString('ar-YE')}</time>
          <button type="button" className="ghost" onClick={() => setSelectedUser(user)}>التفاصيل</button><button type="button" disabled={!editable || busyId === user.user_id || (drafts[user.user_id] ?? user.role) === user.role} onClick={() => void saveRole(user)}>{busyId === user.user_id ? 'جارٍ الحفظ…' : 'اعتماد'}</button>
        </div>;
      })}</div>}
<div className="directory-pagination" aria-label="صفحات مستخدمي المنظمة"><span>صفحة {activeAccessPage} / {accessPages} · {filtered.length} حساب</span><div><button type="button" className="ghost" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={activeAccessPage===1}>السابق</button><button type="button" className="ghost" onClick={()=>setPage(p=>Math.min(accessPages,p+1))} disabled={activeAccessPage===accessPages}>التالي</button></div></div>
        <div className="permission-matrix" aria-label="مصفوفة القدرات التشغيلية">
      <div className="matrix-title"><strong>مصفوفة القدرات الحالية</strong><small>مرآة لعقود مركز الإدارة الحالية؛ الحد الأمني النهائي هو RLS/RPC في قاعدة البيانات.</small></div>
      {CAPABILITIES.map((capability) => <div className="matrix-row" key={capability.key}><span>{capability.label}</span>{(['owner','admin','sales','warehouse','viewer'] as UserRole[]).map((item) => <span className={capability.roles.includes(item) ? 'allowed' : 'blocked'} key={item}>{ROLE_LABELS[item]} {capability.roles.includes(item) ? '✓' : '—'}</span>)}</div>)}
    </div>{selectedUser&&<RecordDetailDrawer eyebrow="Access Control" title={selectedUser.email} summary={selectedUser.customer_id?'حساب عميل مرتبط':'حساب فريق'} fields={[{label:'الدور الحالي',value:ROLE_LABELS[selectedUser.role]},{label:'النوع',value:selectedUser.customer_id?'عميل':'موظف'},{label:'تاريخ الإنشاء',value:new Date(selectedUser.created_at).toLocaleString('ar-YE')},{label:'معرّف الحساب',value:selectedUser.user_id},{label:'معرّف العميل',value:selectedUser.customer_id??'لا يوجد'}]} onClose={()=>setSelectedUser(null)}/>}</div>
  </section>;
}
