import { useCallback, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer' | 'customer';
interface OrganizationUser { user_id:string; email:string; role:UserRole; customer_id:string|null; created_at:string; }
interface AuditEvent { id:string; action:string; target_type:string; result:string; created_at:string; }

const ROLE_LABELS:Record<UserRole,string> = { owner:'المالك', admin:'مدير', sales:'مبيعات', warehouse:'مخزون وتوريد', viewer:'مشاهد', customer:'عميل' };
const ROLE_PERMISSIONS:Record<UserRole,string[]> = {
  owner:['كل العمليات','إدارة المستخدمين والأدوار','المالية','المخزون والتوريد','الكتالوج والتسعير','التدقيق'],
  admin:['الطلبات','العملاء','الكتالوج والتسعير','المخزون والتوريد','المالية','إعدادات بوابة العميل'],
  sales:['الطلبات','العملاء','الكتالوج والتسعير','المالية التشغيلية'],
  warehouse:['الطلبات','المخزون والمستودعات','التحويلات والجرد','المشتريات والاستلام'],
  viewer:['قراءة المساحات المصرح بها فقط'],
  customer:['بوابة B2B للعميل فقط']
};

export default function GovernancePanel({ role }: { role: UserRole }) {
  const canManageRoles = role === 'owner';
  const canViewGovernance = role === 'owner' || role === 'admin';
  const [users,setUsers]=useState<OrganizationUser[]>([]);
  const [audit,setAudit]=useState<AuditEvent[]>([]);
  const [busyUserId,setBusyUserId]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');

  const reload=useCallback(async()=>{
    if(!supabase || !canViewGovernance) return;
    setLoading(true); setError('');
    try{
      const [{data:userRows,error:userError},{data:auditRows,error:auditError}] = await Promise.all([
        supabase.rpc('list_organization_users'),
        supabase.from('audit_events').select('id,action,target_type,result,created_at').order('created_at',{ascending:false}).limit(50)
      ]);
      if(userError) throw userError;
      if(auditError) throw auditError;
      setUsers((userRows??[]) as OrganizationUser[]);
      setAudit((auditRows??[]) as AuditEvent[]);
    }catch(e){ setError(e instanceof Error?e.message:'تعذر تحميل الصلاحيات والتدقيق.'); }
    finally{setLoading(false);}
  },[canViewGovernance]);

  useEffect(()=>{void reload();},[reload]);

  async function changeRole(user:OrganizationUser,nextRole:UserRole){
    if(!supabase || !canManageRoles || user.role===nextRole) return;
    setBusyUserId(user.user_id); setError(''); setMessage('');
    try{
      const {error:invokeError}=await supabase.rpc('set_organization_user_role',{p_user_id:user.user_id,p_role:nextRole});
      if(invokeError) throw invokeError;
      setMessage(\`تم تحديث دور \${user.email} إلى \${ROLE_LABELS[nextRole]}.\`);
      await reload();
    }catch(e){setError(e instanceof Error?e.message:'تعذر تحديث دور المستخدم.');}
    finally{setBusyUserId(null);}
  }

  if(!canViewGovernance) return null;

  return <section className="admin-card governance-panel" id="admin-access">
    <div className="section-heading"><div><span className="eyebrow">الوصول والحوكمة</span><h2>المستخدمون والأدوار والتدقيق</h2></div><span>{users.length} حسابًا ضمن المؤسسة</span></div>
    <div className="admin-grid">
      <div className="admin-card"><div className="section-heading"><div><h3>مصفوفة الصلاحيات</h3><small>التصنيف يصف نطاق التشغيل؛ المنع الفعلي يفرضه الخادم أيضًا.</small></div></div>
        <div className="cart-lines">{(Object.keys(ROLE_PERMISSIONS) as UserRole[]).map(item=><article className="cart-line" key={item}><div><strong>{ROLE_LABELS[item]}</strong><small>{item}</small></div><div><small>{ROLE_PERMISSIONS[item].join(' · ')}</small></div></article>)}</div>
      </div>
      <div className="admin-card"><div className="section-heading"><div><h3>المستخدمون</h3><small>{canManageRoles?'يمكن للمالك تغيير الدور مع حماية آخر مالك.':'عرض فقط؛ تغيير الأدوار محصور بالمالك.'}</small></div></div>
        {loading?<div className="cart-empty">جارٍ تحميل المستخدمين…</div>:!users.length?<div className="cart-empty">لا توجد حسابات مؤسسية متاحة.</div>:
        <div className="cart-lines">{users.map(user=><article className="cart-line" key={user.user_id}><div><strong>{user.email}</strong><small>{user.customer_id?'مرتبط ببوابة عميل':'حساب فريق'} · أضيف {new Date(user.created_at).toLocaleDateString('ar-YE')}</small></div>
          <select aria-label={\`دور \${user.email}\`} value={user.role} disabled={!canManageRoles || busyUserId===user.user_id} onChange={e=>void changeRole(user,e.target.value as UserRole)}>
            {(Object.keys(ROLE_LABELS) as UserRole[]).map(item=><option value={item} key={item}>{ROLE_LABELS[item]}</option>)}
          </select></article>)}</div>}
      </div>
    </div>
    <div className="admin-card"><div className="section-heading"><div><h3>آخر سجل تدقيق</h3><small>قراءة append-only وفق صلاحية المؤسسة الحالية.</small></div><span>{audit.length} عملية</span></div>
      {!audit.length?<div className="cart-empty">لا توجد عمليات تدقيق معروضة بعد.</div>:<div className="cart-lines">{audit.map(event=><article className="cart-line" key={event.id}><div><strong>{event.action}</strong><small>{event.target_type} · {event.result}</small></div><time dateTime={event.created_at}>{new Date(event.created_at).toLocaleString('ar-YE')}</time></article>)}</div>}
    </div>
    {error&&<div className="error-banner" role="alert">{error}</div>}{message&&<div className="success" role="status">{message}</div>}
  </section>;
}
