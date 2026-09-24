import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import './operations.css';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
type StaffMember = { user_id: string; role: UserRole; created_at: string };

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
  const [members, setMembers] = useState<StaffMember[]>([]);
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
      const { data, error: rpcError } = await supabase.rpc('list_staff_members');
      if (rpcError) throw rpcError;
      const next = (data ?? []) as StaffMember[];
      setMembers(next);
      setDrafts(Object.fromEntries(next.map((member) => [member.user_id, member.role])));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل دليل الموظفين.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return members.filter((member) => !needle || member.user_id.toLocaleLowerCase().includes(needle) || ROLE_LABELS[member.role].toLocaleLowerCase().includes(needle));
  }, [members, query]);

  async function saveRole(member: StaffMember) {
    if (!supabase || !canManage) return;
    const nextRole = drafts[member.user_id] ?? member.role;
    if (nextRole === member.role) return;
    if (!window.confirm('اعتماد تغيير دور هذا الموظف؟ سيُسجّل التغيير في سجل التدقيق.')) return;
    setBusyId(member.user_id);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc('set_staff_role', { p_user_id: member.user_id, p_role: nextRole });
      if (rpcError) throw rpcError;
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحديث دور الموظف.');
    } finally {
      setBusyId(null);
    }
  }

  return <section className="content-card operations-panel" id="access-control" aria-busy={loading}>
    <div className="section-title">
      <div><span className="eyebrow">Access Control</span><h2>الأدوار والصلاحيات</h2><p className="panel-note">التعديل يتم عبر RPC محمي بالخادم؛ هذه الشاشة لا تمنح صلاحية من طرف العميل.</p></div>
      <span>{members.length} حسابات موظفين</span>
    </div>
    <div className="operations-toolbar">
      <input aria-label="بحث الموظفين" placeholder="ابحث بمعرف الحساب أو الدور…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <button type="button" className="ghost" onClick={() => void reload()} disabled={loading}>إعادة تحميل</button>
      {!canManage && <span className="permission-hint">وضع قراءة فقط · يتطلب تغيير الدور صلاحية المالك.</span>}
    </div>
    {loading ? <div className="portal-loading" role="status">جارٍ تحميل دليل الموظفين…</div>
      : error ? <div className="empty-state"><strong>تعذر تحميل الصلاحيات.</strong><span>{error}</span><button type="button" onClick={() => void reload()}>إعادة المحاولة</button></div>
      : !visible.length ? <div className="empty-state"><strong>لا توجد حسابات مطابقة.</strong><span>دليل الموظفين هنا محدود بحسابات المنظمة الحالية فقط.</span></div>
      : <div className="access-table" role="table" aria-label="دليل الموظفين"><div className="access-row access-head" role="row"><span>الحساب</span><span>الدور</span><span>الإنشاء</span><span>الإجراء</span></div>{visible.map((member) => <div className="access-row" role="row" key={member.user_id}><code dir="ltr">{member.user_id.slice(0, 12)}…</code>{canManage ? <select aria-label={'دور '+member.user_id.slice(0, 12)} value={drafts[member.user_id] ?? member.role} onChange={(e) => setDrafts((current) => ({ ...current, [member.user_id]: e.target.value as UserRole }))}>{(Object.keys(ROLE_LABELS) as UserRole[]).map((item) => <option key={item} value={item}>{ROLE_LABELS[item]}</option>)}</select> : <strong>{ROLE_LABELS[member.role]}</strong>}<time>{new Date(member.created_at).toLocaleDateString('ar-YE')}</time><button type="button" disabled={!canManage || busyId === member.user_id || (drafts[member.user_id] ?? member.role) === member.role} onClick={() => void saveRole(member)}>{busyId === member.user_id ? 'جارٍ الحفظ…' : 'اعتماد'}</button></div>)}</div>}
    <div className="permission-matrix" aria-label="مصفوفة القدرات التشغيلية">
      <div className="matrix-title"><strong>مصفوفة القدرات الحالية</strong><small>وصف لتجربة مركز الإدارة الحالية؛ الحماية النهائية تبقى على RLS/RPC.</small></div>
      {CAPABILITIES.map((capability) => <div className="matrix-row" key={capability.key}><span>{capability.label}</span>{(['owner','admin','sales','warehouse','viewer'] as UserRole[]).map((item) => <span className={capability.roles.includes(item) ? 'allowed' : 'blocked'} key={item}>{ROLE_LABELS[item]} {capability.roles.includes(item) ? '✓' : '—'}</span>)}</div>)}
    </div>
  </section>;
}
