import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CustomerTier } from './domain/types';
import { createCustomer, getCustomers, setCustomerActive, setCustomerTier, type StaffCustomer } from './services/customers';
import { supabase } from './lib/supabase';
import RecordDetailDrawer from './RecordDetailDrawer';
import './customer-directory.css';

const tiers: CustomerTier[] = ['retail', 'wholesale', 'distributor'];
const tierLabels: Record<CustomerTier, string> = { retail: 'تجزئة', wholesale: 'جملة', distributor: 'موزع' };
type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';

export default function CustomerPanel({ role }: { role: UserRole }) {
  const canCreate = ['owner', 'admin', 'sales'].includes(role);
  const canManage = ['owner', 'admin'].includes(role);
  const canInvite = ['owner', 'admin', 'sales'].includes(role);
  const [customers, setCustomers] = useState<StaffCustomer[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState<CustomerTier>('wholesale');
  const [inviteEmail, setInviteEmail] = useState<Record<string, string>>({});
  const [inviteLink, setInviteLink] = useState<Record<string, string>>({});
  const [inviteBusy, setInviteBusy] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); const [selectedCustomer, setSelectedCustomer] = useState<StaffCustomer | null>(null); const [customerQuery, setCustomerQuery] = useState(''); const [customerStatus, setCustomerStatus] = useState<'all'|'active'|'inactive'>('all'); const [customerTierFilter, setCustomerTierFilter] = useState<'all'|CustomerTier>('all'); const [customerPage, setCustomerPage] = useState(1);
  const reload = useCallback(async () => { setLoading(true); try { setCustomers(await getCustomers(200)); } finally { setLoading(false); } }, []);
  useEffect(() => { void reload().catch((e) => setError(e instanceof Error ? e.message : 'تعذر تحميل العملاء.')); }, [reload]);
  useEffect(() => { setCustomerPage(1); }, [customerQuery, customerStatus, customerTierFilter]);
  async function run(action: () => Promise<unknown>, success: string) { setBusy(true); setError(null); setMessage(null); try { await action(); setMessage(success); await reload(); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تنفيذ العملية.'); } finally { setBusy(false); } }
  async function dispatchInvitation(customer: StaffCustomer) {
    const email = (inviteEmail[customer.id] ?? '').trim().toLowerCase();
    if (!supabase || !email) return;
    setInviteBusy(customer.id); setError(null); setMessage(null); setInviteLink((current) => ({ ...current, [customer.id]: '' }));
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('customer-invitations', { body: { action: 'create', customer_id: customer.id, email } });
      if (invokeError) throw invokeError;
      if (!data?.invitation_url) throw new Error('تعذر إنشاء رابط الدعوة.');
      setInviteLink((current) => ({ ...current, [customer.id]: String(data.invitation_url) }));
      setMessage(data.dispatched ? 'تم إنشاء الدعوة وإرسالها إلى البريد.' : 'تم إنشاء الدعوة. إعداد البريد الخارجي مطلوب للإرسال التلقائي.');
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر إرسال الدعوة.'); }
    finally { setInviteBusy(null); }
  }
  const visibleCustomers = useMemo(() => { const needle = customerQuery.trim().toLowerCase(); return customers.filter((customer) => (customerStatus === 'all' || (customerStatus === 'active' && customer.is_active) || (customerStatus === 'inactive' && !customer.is_active)) && (customerTierFilter === 'all' || customer.tier === customerTierFilter) && (!needle || customer.name.toLowerCase().includes(needle) || String(customer.phone ?? '').toLowerCase().includes(needle) || tierLabels[customer.tier].toLowerCase().includes(needle))); }, [customerQuery, customers, customerStatus, customerTierFilter]);
  const CUSTOMER_PAGE_SIZE = 12; const customerPages = Math.max(1, Math.ceil(visibleCustomers.length / CUSTOMER_PAGE_SIZE)); const activeCustomerPage = Math.min(customerPage, customerPages); const pagedCustomers = visibleCustomers.slice((activeCustomerPage - 1) * CUSTOMER_PAGE_SIZE, activeCustomerPage * CUSTOMER_PAGE_SIZE);
  if (!canCreate && !canManage) return null;
  return <div className="cart-panel" id="customers">
    <div className="section-heading"><div><span className="eyebrow">العملاء</span><h2>دورة العميل</h2></div><span>{customers.length} عملاء</span></div>
    <div className="admin-grid">
      {canCreate && <form className="admin-card" onSubmit={(e) => { e.preventDefault(); void run(async () => { await createCustomer(name.trim(), phone.trim(), tier); setName(''); setPhone(''); }, 'تم إنشاء العميل وتسجيل أثر العملية.'); }}>
        <h3>عميل جديد</h3>
        <input aria-label="اسم العميل" placeholder="اسم العميل" value={name} onChange={(e) => setName(e.target.value)} required />
        <input aria-label="هاتف العميل" placeholder="رقم الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <select aria-label="فئة العميل" value={tier} onChange={(e) => setTier(e.target.value as CustomerTier)}>{tiers.map((item) => <option key={item} value={item}>{tierLabels[item]}</option>)}</select>
        <button disabled={busy}>حفظ العميل</button>
      </form>}
      <div className="admin-card">
        <h3>العملاء الحاليون</h3><div className="directory-toolbar"><input aria-label="بحث العملاء" placeholder="بحث بالاسم أو الهاتف أو الفئة" value={customerQuery} onChange={(e) => setCustomerQuery(e.target.value)} disabled={loading} /><select aria-label="فلترة حالة العملاء" value={customerStatus} onChange={(e) => setCustomerStatus(e.target.value as typeof customerStatus)} disabled={loading}><option value="all">كل الحالات</option><option value="active">نشط فقط</option><option value="inactive">موقوف فقط</option></select><select aria-label="فلترة فئة العملاء" value={customerTierFilter} onChange={(e) => setCustomerTierFilter(e.target.value as typeof customerTierFilter)} disabled={loading}><option value="all">كل الفئات</option>{tiers.map(item => <option key={item} value={item}>{tierLabels[item]}</option>)}</select></div>
        {loading ? <div className="portal-loading">جارٍ تحميل العملاء…</div> : !customers.length ? <div className="empty-state"><strong>لا يوجد عملاء مسجلون بعد.</strong><button type="button" onClick={() => void reload()}>إعادة المحاولة</button></div> : !visibleCustomers.length ? <div className="empty-state"><strong>لا توجد نتائج مطابقة.</strong><button type="button" onClick={() => setCustomerQuery('')}>مسح البحث</button></div> : <div className="cart-lines">{pagedCustomers.map((customer) => <article className="cart-line" key={customer.id}>
          <div><strong>{customer.name}</strong><small>{customer.phone ?? 'بدون هاتف'} · {customer.is_active ? 'نشط' : 'موقوف'}</small></div>
          <button type="button" className="ghost" onClick={() => setSelectedCustomer(customer)}>التفاصيل</button>
          <select aria-label={`فئة ${customer.name}`} disabled={!canManage || busy} value={customer.tier} onChange={(e) => void run(() => setCustomerTier(customer.id, e.target.value as CustomerTier), 'تم تحديث فئة العميل.')}>{tiers.map((item) => <option key={item} value={item}>{tierLabels[item]}</option>)}</select>
          {canManage && <button disabled={busy} onClick={() => void run(() => setCustomerActive(customer.id, !customer.is_active), customer.is_active ? 'تم إيقاف العميل.' : 'تم تفعيل العميل.')}>{customer.is_active ? 'إيقاف' : 'تفعيل'}</button>}
          {canInvite && customer.is_active && <div className="invite-controls"><input type="email" aria-label={`بريد دعوة ${customer.name}`} placeholder="بريد العميل" value={inviteEmail[customer.id] ?? ''} onChange={(e) => setInviteEmail((current) => ({ ...current, [customer.id]: e.target.value }))} /><button disabled={inviteBusy === customer.id || !(inviteEmail[customer.id] ?? '').trim()} onClick={() => void dispatchInvitation(customer)}>{inviteBusy === customer.id ? 'جارٍ إنشاء الدعوة…' : 'إرسال دعوة'}</button>{inviteLink[customer.id] && <a href={inviteLink[customer.id]} target="_blank" rel="noreferrer">فتح رابط الدعوة</a>}</div>}
        </article>)}</div>}{visibleCustomers.length > 0 && <div className="directory-pagination" aria-label="صفحات العملاء"><span>صفحة {activeCustomerPage} / {customerPages} · عرض {((activeCustomerPage-1)*CUSTOMER_PAGE_SIZE)+1}–{Math.min(activeCustomerPage*CUSTOMER_PAGE_SIZE,visibleCustomers.length)}</span><div><button type="button" className="ghost" onClick={()=>setCustomerPage(p=>Math.max(1,p-1))} disabled={activeCustomerPage===1}>السابق</button><button type="button" className="ghost" onClick={()=>setCustomerPage(p=>Math.min(customerPages,p+1))} disabled={activeCustomerPage===customerPages}>التالي</button></div></div>}
      </div>
    </div>
    {error && <div className="error-banner" role="alert"><span>{error}</span><button type="button" className="ghost" onClick={() => void reload()} disabled={loading}>إعادة تحميل العملاء</button></div>}{message && <div className="success" role="status">{message}</div>}
    {selectedCustomer&&<RecordDetailDrawer eyebrow="Customer Directory" title={selectedCustomer.name} summary={selectedCustomer.is_active?'عميل نشط':'عميل موقوف'} fields={[{label:'الفئة',value:tierLabels[selectedCustomer.tier]},{label:'الهاتف',value:selectedCustomer.phone??'غير متاح'},{label:'الحالة',value:selectedCustomer.is_active?'نشط':'موقوف'},{label:'معرّف العميل',value:selectedCustomer.id},{label:'رابط الدعوة',value:inviteLink[selectedCustomer.id]??'لم تُنشأ دعوة في هذه الجلسة.',wide:true}]} onClose={()=>setSelectedCustomer(null)}/>} 
  </div>;
}
