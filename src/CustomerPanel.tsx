import { useCallback, useEffect, useState } from 'react';
import type { CustomerTier } from './domain/types';
import { formatMoney } from './domain/pricing';
import { createCustomer, getCustomers, setCustomerActive, setCustomerTier, type StaffCustomer } from './services/customers';
import { supabase } from './lib/supabase';

const tiers: CustomerTier[] = ['retail', 'wholesale', 'distributor'];
const tierLabels: Record<CustomerTier, string> = { retail: 'تجزئة', wholesale: 'جملة', distributor: 'موزع' };
type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';

export default function CustomerPanel({ role }: { role: UserRole }) {
  const canCreate = ['owner', 'admin', 'sales'].includes(role);
  const canManage = ['owner', 'admin'].includes(role);
  const canInvite = ['owner', 'admin', 'sales'].includes(role);
  const [customers, setCustomers] = useState<StaffCustomer[]>([]);
  const [selectedCustomer,setSelectedCustomer]=useState<StaffCustomer|null>(null);
  const [detailLoading,setDetailLoading]=useState(false);
  const [detailOrders,setDetailOrders]=useState<Array<{order_number:number;status:string;total:number;currency:string;created_at:string}>>([]);
  const [detailLedger,setDetailLedger]=useState<Array<{reference:string|null;description:string;debit:number;credit:number;due_date:string|null;status:string;created_at:string}>>([]);
  const [detailInvitations,setDetailInvitations]=useState<Array<{recipient_email:string;expires_at:string;accepted_at:string|null;revoked_at:string|null;created_at:string}>>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState<CustomerTier>('wholesale');
  const [inviteEmail, setInviteEmail] = useState<Record<string, string>>({});
  const [inviteLink, setInviteLink] = useState<Record<string, string>>({});
  const [inviteBusy, setInviteBusy] = useState<string | null>(null);
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerStatus, setCustomerStatus] = useState<'all' | 'active' | 'paused'>('all');
  const [customerTier, setCustomerTierFilter] = useState<'all' | CustomerTier>('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const reload = useCallback(async () => setCustomers(await getCustomers(200)), []);
  useEffect(() => { void reload().catch((e) => setError(e instanceof Error ? e.message : 'تعذر تحميل العملاء.')); }, [reload]);
  async function run(action: () => Promise<unknown>, success: string) { setBusy(true); setError(null); setMessage(null); try { await action(); setMessage(success); await reload(); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تنفيذ العملية.'); } finally { setBusy(false); } }
  const visibleCustomers = customers.filter((customer) => {
    const needle = customerQuery.trim().toLocaleLowerCase('ar');
    const matchesQuery = !needle || (customer.name + ' ' + (customer.phone ?? '')).toLocaleLowerCase('ar').includes(needle);
    const matchesStatus = customerStatus === 'all' || (customerStatus === 'active' ? customer.is_active : !customer.is_active);
    const matchesTier = customerTier === 'all' || customer.tier === customerTier;
    return matchesQuery && matchesStatus && matchesTier;
  });
  const hasCustomerFilters = Boolean(customerQuery.trim()) || customerStatus !== 'all' || customerTier !== 'all';
  function clearCustomerFilters() { setCustomerQuery(''); setCustomerStatus('all'); setCustomerTierFilter('all'); }
  async function openCustomerDetail(customer:StaffCustomer){
    if(!supabase || detailLoading) return;
    setSelectedCustomer(customer); setDetailLoading(true); setError('');
    try{
      const [{data:orders,error:ordersError},{data:ledger,error:ledgerError},{data:invitations,error:invitationError}]=await Promise.all([
        supabase.from('orders').select('order_number,status,total,currency,created_at').eq('customer_id',customer.id).order('created_at',{ascending:false}).limit(25),
        supabase.from('customer_ledger_entries').select('reference,description,debit,credit,due_date,status,created_at').eq('customer_id',customer.id).order('created_at',{ascending:false}).limit(40),
        supabase.from('customer_invitations').select('recipient_email,expires_at,accepted_at,revoked_at,created_at').eq('customer_id',customer.id).order('created_at',{ascending:false}).limit(20)
      ]);
      if(ordersError) throw ordersError; if(ledgerError) throw ledgerError; if(invitationError) throw invitationError;
      setDetailOrders((orders??[]).map(item=>({...item,total:Number(item.total)})));
      setDetailLedger((ledger??[]).map(item=>({...item,debit:Number(item.debit),credit:Number(item.credit)})));
      setDetailInvitations((invitations??[]) as typeof detailInvitations);
    }catch(e){setSelectedCustomer(null);setError(e instanceof Error?e.message:'تعذر تحميل ملف العميل.');}
    finally{setDetailLoading(false);}
  }

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
        <div className="section-heading"><div><h3>العملاء الحاليون</h3></div><span>{hasCustomerFilters ? "إظهار " + visibleCustomers.length + " من " + customers.length : customers.length + " عميل"}</span></div>
        {customers.length > 0 && <div className="admin-order-tools customer-filter-tools"><input aria-label="البحث في العملاء" value={customerQuery} onChange={(e) => setCustomerQuery(e.target.value)} placeholder="اسم العميل أو الهاتف…"/><select aria-label="تصفية حالة العميل" value={customerStatus} onChange={(e) => setCustomerStatus(e.target.value as 'all' | 'active' | 'paused')}><option value="all">كل الحالات</option><option value="active">نشط</option><option value="paused">موقوف</option></select><select aria-label="تصفية فئة العميل" value={customerTier} onChange={(e) => setCustomerTierFilter(e.target.value as 'all' | CustomerTier)}><option value="all">كل الفئات</option>{tiers.map((item) => <option key={item} value={item}>{tierLabels[item]}</option>)}</select>{hasCustomerFilters && <button type="button" onClick={clearCustomerFilters}>مسح التصفية</button>}</div>}
        {!customers.length ? <small>لا يوجد عملاء مسجلون بعد.</small> : !visibleCustomers.length ? <div className="cart-empty">لا توجد نتائج مطابقة. عدّل البحث أو التصفية.</div> : <div className="cart-lines">{visibleCustomers.map((customer) => <article className="cart-line" key={customer.id}>
          <div><strong>{customer.name}</strong><small>{customer.phone ?? 'بدون هاتف'} · {customer.is_active ? 'نشط' : 'موقوف'}</small></div>
          <select aria-label={`فئة ${customer.name}`} disabled={!canManage || busy} value={customer.tier} onChange={(e) => void run(() => setCustomerTier(customer.id, e.target.value as CustomerTier), 'تم تحديث فئة العميل.')}>{tiers.map((item) => <option key={item} value={item}>{tierLabels[item]}</option>)}</select>
          {canManage && <button disabled={busy} onClick={() => void run(() => setCustomerActive(customer.id, !customer.is_active), customer.is_active ? 'تم إيقاف العميل.' : 'تم تفعيل العميل.')}>{customer.is_active ? 'إيقاف' : 'تفعيل'}</button>}
          <button type="button" className="ghost compact-action" onClick={()=>void openCustomerDetail(customer)} disabled={detailLoading}>تفاصيل وكشف</button>
          {canInvite && customer.is_active && <div className="invite-controls"><input type="email" aria-label={`بريد دعوة ${customer.name}`} placeholder="بريد العميل" value={inviteEmail[customer.id] ?? ''} onChange={(e) => setInviteEmail((current) => ({ ...current, [customer.id]: e.target.value }))} /><button disabled={inviteBusy === customer.id || !(inviteEmail[customer.id] ?? '').trim()} onClick={() => void dispatchInvitation(customer)}>{inviteBusy === customer.id ? 'جارٍ إنشاء الدعوة…' : 'إرسال دعوة'}</button>{inviteLink[customer.id] && <a href={inviteLink[customer.id]} target="_blank" rel="noreferrer">فتح رابط الدعوة</a>}</div>}
        </article>)}</div>}
      </div>
    </div>
    {error && <div className="error-banner" role="alert">{error}</div>}{message && <div className="success" role="status">{message}</div>}
  </div>;
}